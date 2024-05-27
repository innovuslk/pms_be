const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');
const axios = require('axios');
const config = require('../config/config')

const router = express.Router();

const shiftATimeSlots = [
    { start: "06:00", end: "06:20", label: "1st Hour" },
    { start: "06:20", end: "07:20", label: "2nd Hour" },
    { start: "07:20", end: "08:20", label: "3rd Hour" },
    { start: "08:20", end: "09:40", label: "4th Hour" },
    { start: "09:40", end: "10:40", label: "5th Hour" },
    { start: "10:40", end: "11:00", label: "6th Hour" },
    { start: "11:00", end: "12:00", label: "7th Hour" },
    { start: "12:00", end: "13:00", label: "8th Hour" },
    { start: "13:00", end: "14:00", label: "9th Hour" }
];

const shiftBTimeSlots = [
    { startHour: 14, startMinute: 0, endHour: 14, endMinute: 20, label: '1st Hour' },
    { startHour: 14, startMinute: 20, endHour: 15, endMinute: 20, label: '2nd Hour' },
    { startHour: 15, startMinute: 20, endHour: 16, endMinute: 20, label: '3rd Hour' },
    { startHour: 16, startMinute: 20, endHour: 17, endMinute: 20, label: '4th Hour' },
    { startHour: 17, startMinute: 20, endHour: 18, endMinute: 20, label: '5th Hour' },
    { startHour: 18, startMinute: 20, endHour: 19, endMinute: 20, label: '6th Hour' },
    { startHour: 19, startMinute: 20, endHour: 19, endMinute: 40, label: '7th Hour' },
    { startHour: 19, startMinute: 40, endHour: 20, endMinute: 0, label: '8th Hour' }
];

router.post('/getAPIPieceCount', async (req, res) => {
    try {
        const decodedUsername = base64.decode(req.body.username);

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date}`;

        // Determine current shift and time slot label
        const currentHour = date_time.getHours();
        const currentMinute = date_time.getMinutes();

        let shift, timeSlots, currentSlotLabel;

        if (currentHour >= 6 && currentHour < 14) {
            shift = 'A';
            timeSlots = shiftATimeSlots;
        } else if (currentHour >= 14 && currentHour < 22) {
            shift = 'B';
            timeSlots = shiftBTimeSlots;
        } else {
            shift = 'C';
        }

        if (shift === 'A' || shift === 'B') {
            for (const slot of timeSlots) {
                const [startHour, startMinute] = slot.start.split(':').map(Number);
                const [endHour, endMinute] = slot.end.split(':').map(Number);

                if (
                    (currentHour === startHour && currentMinute >= startMinute) || 
                    (currentHour === endHour && currentMinute < endMinute) || 
                    (currentHour > startHour && currentHour < endHour)
                ) {
                    currentSlotLabel = slot.label;
                    break;
                }
            }
        }

        if (!currentSlotLabel) {
            return res.status(200).json({ message: 'Current time does not fall within any defined time slots.', totalPieceCount: 0 });
        }

        const startTime = timeSlots.find(slot => slot.label === currentSlotLabel).start;
        const endTime = timeSlots.find(slot => slot.label === currentSlotLabel).end;

        // Get the sum of piece counts for the user within the time slot
        const totalPieceCountQuery = `
            SELECT SUM(pieceCount) as totalPieceCount 
            FROM api_pieceCount 
            WHERE operator = ? 
            AND DATE(timestamp) = ? 
            AND TIME(timestamp) BETWEEN ? AND ?
        `;
        const totalPieceCountValues = [decodedUsername, current_date, startTime, endTime];
        const totalPieceCountResult = await queryPromise(totalPieceCountQuery, totalPieceCountValues);

        if (totalPieceCountResult.length > 0) {
            const totalPieceCount = totalPieceCountResult[0].totalPieceCount || 0;

            // Post data to another API
            const postApiUrl = `'${config.APP_HOST_IP}/set/setPieceCount'`;  
            const postData = {
                username: decodedUsername, 
                pieceCount: totalPieceCount,
                hour: currentSlotLabel,
                shift: shift
            };

            const response = await axios.post(postApiUrl, postData);

            if (response.status === 200) {
                res.status(200).json({ message: 'Total piece count retrieved and posted successfully.', totalPieceCount: totalPieceCount });
            } else {
                res.status(response.status).json({ message: 'Failed to post data to the API.' });
            }
        } else {
            res.status(200).json({ message: 'No piece counts found for the user.', totalPieceCount: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving total piece count');
    }
});

function queryPromise(query, values) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = router;
