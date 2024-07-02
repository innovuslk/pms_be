const express = require('express');
const connection = require('../database/connect');

const router = express.Router();


router.post('/getHistory', (req, res) => {
    const { startDate, endDate } = req.body;
    const query = `
        SELECT DATE(timestamp) as date, SUM(pieceCount) as pieceCount
        FROM pieceCount
        WHERE DATE(timestamp) BETWEEN ? AND ?
        GROUP BY DATE(timestamp)
        ORDER BY DATE(timestamp);
    `;

    connection.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

module.exports = router;