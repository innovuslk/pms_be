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

            // Query to get distinct lineNumbers for the current style
            const lineNumbersQuery = "SELECT DISTINCT lineNo FROM dailyPlan WHERE style = ? AND plantName = ?";
            const lineNumbersValues = [styleName, plant];
            const lineNumbersResult = await queryPromise(lineNumbersQuery, lineNumbersValues);

            const lineData = [];

            for (const line of lineNumbersResult) {
                const lineNo = line.lineNo;

                // Query to get pieceCount for the current lineNo
                const pieceCountQuery = `
                    SELECT SUM(pieceCount) AS linePieceCount, MAX(hour) as latestHour  
                    FROM pieceCount 
                    WHERE lineNo = ? AND DATE(timestamp) = ? AND plantName = ?`;
                const pieceCountValues = [lineNo, date, plant];
                const pieceCountResult = await queryPromise(pieceCountQuery, pieceCountValues);

                const linePieceCount = pieceCountResult[0]?.linePieceCount || 0;
                const latestHour = pieceCountResult[0]?.latestHour || 0;

                // Query to get the dailyTarget for the current lineNo from dailyPlan table
                const dailyTargetQuery = `
                    SELECT dailyTarget 
                    FROM dailyPlan 
                    WHERE lineNo = ? AND plantName = ? AND style = ? AND date = ? LIMIT 1`;
                const dailyTargetValues = [lineNo, plant, styleName, date];
                const dailyTargetResult = await queryPromise(dailyTargetQuery, dailyTargetValues);

                const dailyTarget = dailyTargetResult[0]?.dailyTarget || 0;

                // Push lineNumber, pieceCount, and dailyTarget into lineData array
                lineData.push({
                    lineNumber: lineNo,
                    pieceCount: linePieceCount,
                    dailyTarget: dailyTarget, // Include dailyTarget in the response
                    latestHour: latestHour 
                });
            }

            // Sum the piece counts across all lineNumbers for the current style
            const totalPieceCount = lineData.reduce((acc, line) => acc + line.pieceCount, 0);

            // Prepare the response for the current style
            result.push({
                style: styleName,
                lineData, // All line numbers, piece counts, and daily targets
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
