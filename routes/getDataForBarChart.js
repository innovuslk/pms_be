const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getDataForBarChart', async (req, res) => {
    try {
        const { operatorType, shift, username } = req.body;

        // console.log(operatorType)
        let decodedUsername;
        try {
            decodedUsername = base64.decode(username);
        } catch (error) {
            console.error(error);
            return res.status(400).send('Invalid base64-encoded username');
        }

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

        let query = '';
        let values = [];

        if (['Operator', 'Pullout 1', 'Pullout 2'].includes(operatorType)) {
            query = `
                SELECT hour, SUM(pieceCount) as totalPieceCount 
                FROM pieceCount 
                WHERE operation = ? 
                AND userid = ? 
                AND DATE(timestamp) = ? 
                AND shift = ?
                GROUP BY hour
            `;
            values = [operatorType, userId, current_date, shift];
        } else if (operatorType === 'LineEnd') {
            query = `
                SELECT hour, SUM(pieceCount) as totalPieceCount 
                FROM pieceCount 
                WHERE operation = ? 
                AND DATE(timestamp) = ? 
                AND shift = ?
                GROUP BY hour
            `;
            values = [operatorType, current_date, shift];
        } else {
            return res.status(400).send('Invalid operator type');
        }

        const result = await queryPromise(query, values);

        const totalPieceCountByHour = {};
        for (let i = 1; i <= 11; i++) {
            totalPieceCountByHour[i] = 0; // Initialize with 0
        }

        result.forEach(row => {
            totalPieceCountByHour[row.hour] = row.totalPieceCount;
        });

        res.status(200).json({ message: 'Total piece count retrieved successfully.', totalPieceCountByHour });
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
