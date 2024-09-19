const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getStylesData', async (req, res) => {
    try {
        const { date, plant, style, lineNo } = req.body;

        // Query to get unique styles for the given plant and date
        const pieceCountQuery = `
   SELECT SUM(pieceCount) AS linePieceCount, 
           (SELECT salesOrder 
            FROM pieceCount 
            WHERE lineNo = ? 
              AND DATE(timestamp) = ? 
              AND plantName = ?
            LIMIT 1) AS salesOrder
    FROM pieceCount 
    WHERE lineNo = ? 
      AND DATE(timestamp) = ? 
      AND plantName = ?`;
        const pieceCountValues = [lineNo, date, plant, lineNo, date, plant];
        const pieceCountResult = await queryPromise(pieceCountQuery, pieceCountValues);

        const linePieceCount = pieceCountResult[0]?.linePieceCount || 0;
        const salesOrder = pieceCountResult[0]?.salesOrder || 0;

        // Send response with styles and line numbers
        res.status(200).json({
            style: style,
            lineNo: lineNo,
            pieceCount: linePieceCount,
            salesOrder: salesOrder
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

// Helper function to promisify the database query
function queryPromise(query, values) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = router;
