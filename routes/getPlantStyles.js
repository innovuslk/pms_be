const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getPlantStyles', async (req, res) => {
    try {
        const { date, plant } = req.body;
        const todayDate = new Date().toISOString().slice(0, 10); // Get today's date in 'YYYY-MM-DD' format

        // Query to get unique styles for the given plant and date
        const plantStylesQuery = "SELECT DISTINCT style FROM dailyPlan WHERE date = ? AND plantName = ?";
        const plantStylesValues = [date, plant];
        const plantStylesResult = await queryPromise(plantStylesQuery, plantStylesValues);

        // Iterate over the styles to get lineNumbers and pieceCount for each style
        const result = [];
        for (const style of plantStylesResult) {
            const styleName = style.style;

            // Query to get lineNumbers for the current style
            const lineNumbersQuery = "SELECT DISTINCT lineNo FROM dailyPlan WHERE style = ? AND plantName = ?";
            const lineNumbersValues = [styleName, plant];
            const lineNumbersResult = await queryPromise(lineNumbersQuery, lineNumbersValues);

            const lineData = [];

            for (const line of lineNumbersResult) {
                const lineNo = line.lineNo;

                const pieceCountQuery = `
                    SELECT SUM(pieceCount) AS linePieceCount 
                    FROM pieceCount 
                    WHERE lineNo = ? AND DATE(timestamp) = ? AND plantName = ?`;
                const pieceCountValues = [lineNo, date, plant];
                const pieceCountResult = await queryPromise(pieceCountQuery, pieceCountValues);

                const linePieceCount = pieceCountResult[0]?.linePieceCount || 0;

                // Push lineNumber and pieceCount into lineData array
                lineData.push({
                    lineNumber: lineNo,
                    pieceCount: linePieceCount
                });
            }

            // Sum the piece counts across all lineNumbers for the current style
            const totalPieceCount = lineData.reduce((acc, line) => acc + line.pieceCount, 0);

            // Prepare the response for the current style
            result.push({
                style: styleName,
                lineData, // All line numbers and their respective piece counts
                totalPieceCount // Sum of piece counts for all line numbers
            });
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving data');
    }
});

module.exports = router;

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
