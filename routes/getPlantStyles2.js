const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getPlantStyles2', async (req, res) => {
    try {
        const { date, plant } = req.body;

        // Query to get unique styles for the given plant and date
        const plantStylesQuery = "SELECT DISTINCT style FROM dailyPlan WHERE date = ? AND plantName = ?";
        const plantStylesValues = [date, plant];
        const plantStylesResult = await queryPromise(plantStylesQuery, plantStylesValues);

        // Array to store line numbers
        const lineNumbersSet = new Set();  // Use Set to ensure uniqueness of line numbers

        // Iterate over each style to fetch line numbers
        for (const style of plantStylesResult) {
            const styleName = style.style;

            // Query to get line numbers for each style and plant
            const lineNumbersQuery = "SELECT DISTINCT lineNo FROM dailyPlan WHERE style = ? AND plantName = ?";
            const lineNumbersValues = [styleName, plant];
            const lineNumbersResult = await queryPromise(lineNumbersQuery, lineNumbersValues);

            // Add each line number to the set
            lineNumbersResult.forEach(line => lineNumbersSet.add(line.lineNo));
        }

        // Convert Set to array for response
        const lineNumbersArray = Array.from(lineNumbersSet);

        // Send response with styles and line numbers
        res.status(200).json({
            styles: plantStylesResult.map(s => s.style),  // Return array of style names
            lineNos: lineNumbersArray  // Return array of unique line numbers
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
