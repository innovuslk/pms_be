const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getDataForBarChart', async (req, res) => {
    try {

        const operatorType = req.body.operatorType
        const hours = ["1st Hour", "2nd Hour", "3rd Hour", "4th Hour", "5th Hour", "6th Hour", "7th Hour", "8th Hour"];
        const totalPieceCountByHour = {};

        if(operatorType === 'operator'){
            for (const hour of hours) {
                const totalPieceCountQuery = `SELECT SUM(pieceCount) as totalPieceCount FROM pieceCount WHERE hour = ? AND operation = ?`;
                const totalPieceCountValues = [hour, operatorType];
                const result = await queryPromise(totalPieceCountQuery, totalPieceCountValues);
    
                if (result.length > 0) {
                    totalPieceCountByHour[hour] = result[0].totalPieceCount;
                } else {
                    totalPieceCountByHour[hour] = 0;
                }
            }
        }

        if(operatorType === 'LineEnd'){
            for (const hour of hours) {
                const totalPieceCountQuery2 = `SELECT SUM(pieceCount) as totalPieceCount FROM pieceCount WHERE hour = ? AND operation = ?`;
                const totalPieceCountValues2 = [hour,operatorType];
                const result2 = await queryPromise(totalPieceCountQuery2, totalPieceCountValues2);
    
                if (result2.length > 0) {
                    totalPieceCountByHour[hour] = result2[0].totalPieceCount;
                } else {
                    totalPieceCountByHour[hour] = 0;
                }
            }
    
        }


        // Respond with success and the total piece count for each hour
        res.status(200).json({ message: 'Total Line end piece count retrieved successfully.', totalPieceCountByHour });
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
