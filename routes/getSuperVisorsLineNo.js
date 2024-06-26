const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getSvLineNo', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);
        const plantName = req.body.plantName;

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        
        // Get today's date in the format YYYY-MM-DD
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date}`;

        // Fetch all columns' data from downtime table where startTime is today's date
        const query = `
            SELECT lineNo
            FROM operatorDailyAssignment
            WHERE supervisor = ? AND date = ? AND plantName = ?;
        `;
        const values = [userId, current_date, plantName];
        const result = await queryPromise(query, values);

        const uniqueLineNosSet = new Set();
        result.forEach(row => {
            uniqueLineNosSet.add(row.lineNo);
        });

        const uniqueLineNos = [...uniqueLineNosSet];

        if (uniqueLineNos.length === 0) {
            return res.status(200).json({ message: 'Line numbers retrieved successfully.', lineNos: [], linePieceCounts: [] });
        }

        // Get the piece counts for each unique line number
        const pieceCountQuery = `
            SELECT lineNo, MAX(hour) as latestHour, SUM(pieceCount) AS totalPieceCount
            FROM pieceCount
            WHERE operation = 'LineEnd'
            AND DATE(timestamp) = ?
            AND lineNo IN (?)
            GROUP BY lineNo;
        `;
        const pieceCountValues = [current_date, uniqueLineNos];
        const pieceCountResult = await queryPromise(pieceCountQuery, pieceCountValues);

        const linePieceCounts = uniqueLineNos.map(lineNo => {
            const pieceCountData = pieceCountResult.find(row => row.lineNo === lineNo);
            return {
                lineNo: lineNo,
                pieceCount: pieceCountData ? pieceCountData.totalPieceCount : 0,
                latestHour: pieceCountData ? pieceCountData.latestHour : null
            };
        });

        res.status(200).json({ message: 'Line numbers retrieved successfully.', lineNos: uniqueLineNos, linePieceCounts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lineNo');
    }
});

router.post('/getSvPlant', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        // Get today's date in the format YYYY-MM-DD
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Fetch all columns' data from downtime table where startTime is today's date
        const query = `
            SELECT plantName
            FROM operatorDailyAssignment
            WHERE supervisor = ? AND date = ?;
        `;
        const values = [userId, current_date];
        const result = await queryPromise(query, values);


        const uniquePlantName = new Set();
        result.forEach(row => {
            uniquePlantName.add(row.plantName)
        });

        const uniquePlantNames = [...uniquePlantName];

        res.status(200).json({ message: 'line numbers retrieved successfully.', plantNames: uniquePlantNames });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lineNo');
    }
});

router.post('/getSvLineUsers', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);
        const lineNo = req.body.lineNo

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        // Get today's date in the format YYYY-MM-DD
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Fetch all unique user IDs from operatorDailyAssignment table where supervisor is the user's ID and date is today's date
        const query = `
            SELECT DISTINCT userid
            FROM operatorDailyAssignment
            WHERE supervisor = ? AND date = ? AND lineNo = ?;
        `;
        const values = [userId, current_date, lineNo];
        const result = await queryPromise(query, values);

        // Extract unique user IDs
        const uniqueUserIds = result.map(row => row.userid);

        // Calculate the sum of pieceCount for today's date and specific user IDs
        const usernamesQuery = `
        SELECT u.username, SUM(pc.pieceCount) as totalPieceCount
        FROM User u
        JOIN pieceCount pc ON u.userid = pc.userid
        WHERE DATE(pc.timestamp) = ? AND pc.userid IN (${uniqueUserIds.map(() => '?').join(', ')})
        GROUP BY u.username;
    `;
        const usernamesValues = [current_date, ...uniqueUserIds];
        const usernamesResult = await queryPromise(usernamesQuery, usernamesValues);

        res.status(200).json(usernamesResult);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving usernames');
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
