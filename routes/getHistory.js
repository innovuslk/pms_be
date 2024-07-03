const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getHistory', (req, res) => {
    const { startDate, endDate, sortBy } = req.body;

    let query;
    if (sortBy === 'operation') {
        query = `
            SELECT DATE(timestamp) as date, operation, SUM(pieceCount) as pieceCount
            FROM pieceCount
            WHERE DATE(timestamp) BETWEEN ? AND ?
            GROUP BY DATE(timestamp), operation
            ORDER BY DATE(timestamp), operation;
        `;
    } else if (sortBy === 'plantName') {
        query = `
            SELECT DATE(timestamp) as date, plantName, SUM(pieceCount) as pieceCount
            FROM pieceCount
            WHERE DATE(timestamp) BETWEEN ? AND ?
            GROUP BY DATE(timestamp), plantName
            ORDER BY DATE(timestamp), plantName;
        `;
    } else {
        query = `
            SELECT DATE(timestamp) as date, SUM(pieceCount) as pieceCount
            FROM pieceCount
            WHERE DATE(timestamp) BETWEEN ? AND ?
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp);
        `;
    }

    connection.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

module.exports = router;
