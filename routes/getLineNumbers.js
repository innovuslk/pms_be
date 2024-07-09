const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.get('/getLineNumbers', async (req, res) => {
    try {
        const lineNumbersQuery = "SELECT lineNumber FROM lineNumbers";

        const lineNumbersResult = await new Promise((resolve, reject) => {
            connection.query(lineNumbersQuery, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (lineNumbersResult.length === 0) {
            return res.status(404).send('Line numbers not found');
        }

        // Extract line numbers into an array
        const lineNumbers = lineNumbersResult.map(row => row.lineNumber);

        res.json(lineNumbers);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
