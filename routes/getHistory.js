const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getHistory', (req, res) => {
    const { startDate, endDate, sortBy, lineNo, style } = req.body;

    let query;
    let queryParams = [startDate, endDate];

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
        SELECT DATE(pc.timestamp) AS date, pc.plantName, dp.style, SUM(pc.pieceCount) AS pieceCount
        FROM pieceCount AS pc
        JOIN dailyPlan AS dp
        ON pc.plantName = dp.plantName
        AND pc.lineItem = dp.lineItem
        AND DATE(pc.timestamp) = dp.date
        WHERE DATE(pc.timestamp) BETWEEN ? AND ?
        ${style ? 'AND dp.style = ?' : ''}
        GROUP BY DATE(pc.timestamp), pc.plantName, dp.style
        ORDER BY DATE(pc.timestamp), pc.plantName, dp.style;
    `;

    queryParams.push(style);

    }
    else if (sortBy === 'lineNo') {
        query = `
            SELECT DATE(timestamp) as date, lineNo, operation, SUM(pieceCount) as pieceCount
            FROM pieceCount
            WHERE DATE(timestamp) BETWEEN ? AND ? AND lineNo LIKE ?
            GROUP BY DATE(timestamp), lineNo, operation
            ORDER BY DATE(timestamp), lineNo, operation;
        `;
        queryParams.push(`${lineNo}%`);
    } else {
        query = `
            SELECT DATE(timestamp) as date, SUM(pieceCount) as pieceCount
            FROM pieceCount
            WHERE DATE(timestamp) BETWEEN ? AND ?
            GROUP BY DATE(timestamp)
            ORDER BY DATE(timestamp);
        `;
    }

    connection.query(query, queryParams, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

module.exports = router;
