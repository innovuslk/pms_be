const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getPlantStyles', async (req, res) => {
    try {
        const { date, plant } = req.body;
        const todayDate = new Date().toISOString().slice(0, 10); // Get today's date in 'YYYY-MM-DD' format
        const queryDate = date || todayDate; // Use today's date if no date is provided

        // Query to get distinct styles for the given plant and date
        const plantStylesQuery = "SELECT DISTINCT style FROM dailyPlan WHERE date = ? AND plantName = ?";
        const plantStylesResult = await queryPromise(plantStylesQuery, [queryDate, plant]);

        const result = [];

        // Iterate over each style to get line numbers and piece counts
        for (const style of plantStylesResult) {
            const styleName = style.style;

            // Query to get distinct line numbers for the current style and plant
            const lineNumbersQuery = "SELECT DISTINCT lineNo FROM dailyPlan WHERE style = ? AND plantName = ? AND date = ?";
            const lineNumbersResult = await queryPromise(lineNumbersQuery, [styleName, plant, queryDate]);

            const lineData = [];

            for (const line of lineNumbersResult) {
                const lineNo = line.lineNo;

                // Query to get pieceCount and latest hour for the current lineNo
                const pieceCountQuery = `
                    SELECT SUM(pieceCount) AS linePieceCount, MAX(hour) AS latestHour 
                    FROM pieceCount 
                    WHERE lineNo = ? AND DATE(timestamp) = ? AND plantName = ?`;
                const pieceCountResult = await queryPromise(pieceCountQuery, [lineNo, queryDate, plant]);

                const linePieceCount = pieceCountResult[0]?.linePieceCount || 0;
                const latestHour = pieceCountResult[0]?.latestHour || 0;

                // Query to get the dailyTarget for the current lineNo from dailyPlan table
                const dailyTargetQuery = `
                    SELECT dailyTarget 
                    FROM dailyPlan 
                    WHERE lineNo = ? AND plantName = ? AND style = ? AND date = ? LIMIT 1`;
                const dailyTargetResult = await queryPromise(dailyTargetQuery, [lineNo, plant, styleName, queryDate]);

                const dailyTarget = dailyTargetResult[0]?.dailyTarget || 0;

                // Push lineNumber, pieceCount, dailyTarget, and latestHour into lineData array
                lineData.push({
                    lineNumber: lineNo,
                    pieceCount: linePieceCount,
                    dailyTarget: dailyTarget,
                    latestHour: latestHour
                });
            }

            // Sum the piece counts across all line numbers for the current style
            const totalPieceCount = lineData.reduce((acc, line) => acc + line.pieceCount, 0);

            // Push the final data for each style into the result array
            result.push({
                style: styleName,
                lineData, // Line numbers, piece counts, daily targets, and latest hours
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
};
