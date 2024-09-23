const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

// Route to get details for all plants
router.post('/getAllPlantDetails', async (req, res) => {
    try {
        const { date } = req.body;
        const todayDate = new Date().toISOString().slice(0, 10); // Get today's date in 'YYYY-MM-DD' format

        // If no date is provided, use today's date
        const queryDate = date || todayDate;

        // Query to get distinct plant names for the given date
        const plantNamesQuery = "SELECT DISTINCT plantName FROM dailyPlan WHERE date = ?";
        const plantNamesResult = await queryPromise(plantNamesQuery, [queryDate]);

        const result = [];

        // Iterate over each plant to get styles and line numbers
        for (const plant of plantNamesResult) {
            const plantName = plant.plantName;

            // Query to get distinct styles for the current plant and date
            const plantStylesQuery = "SELECT DISTINCT style FROM dailyPlan WHERE date = ? AND plantName = ?";
            const plantStylesResult = await queryPromise(plantStylesQuery, [queryDate, plantName]);

            // Iterate over each style to get line numbers and piece counts
            for (const style of plantStylesResult) {
                const styleName = style.style;

                // Query to get line numbers for the current style and plant
                const lineNumbersQuery = "SELECT DISTINCT lineNo FROM dailyPlan WHERE style = ? AND plantName = ?";
                const lineNumbersResult = await queryPromise(lineNumbersQuery, [styleName, plantName]);

                const lineData = [];

                // For each line number, calculate piece counts
                for (const line of lineNumbersResult) {
                    const lineNo = line.lineNo;

                    const pieceCountQuery = `
                        SELECT SUM(pieceCount) AS linePieceCount 
                        FROM pieceCount 
                        WHERE lineNo = ? AND DATE(timestamp) = ? AND plantName = ?`;
                    const pieceCountResult = await queryPromise(pieceCountQuery, [lineNo, queryDate, plantName]);

                    const linePieceCount = pieceCountResult[0]?.linePieceCount || 0;

                    // Push lineNumber and pieceCount into lineData array
                    lineData.push({
                        lineNumber: lineNo,
                        pieceCount: linePieceCount
                    });
                }

                // Sum the piece counts across all line numbers for the current style
                const totalPieceCount = lineData.reduce((acc, line) => acc + line.pieceCount, 0);

                // Push the final data directly into the result array
                result.push({
                    plantName,
                    style: styleName,
                    lineData,
                    totalPieceCount
                });
            }
        }

        res.status(200).json(result);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving all plant details');
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
