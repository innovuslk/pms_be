const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getSvLineNo', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        // Get today's date in the format YYYY-MM-DD
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Fetch all columns' data from downtime table where startTime is today's date
        const query = `
            SELECT lineNo
            FROM operatorDailyAssignment
            WHERE supervisor = ? AND date = ?;
        `;
        const values = [userId, current_date];
        const result = await queryPromise(query, values);
        console.log(result)

        const uniqueLineNosSet = new Set();
        result.forEach(row => {
            uniqueLineNosSet.add(row.lineNo);
        });

        const uniqueLineNos = [...uniqueLineNosSet];

        res.status(200).json({ message: 'line numbers retrieved successfully.', lineNos: uniqueLineNos });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lineNo');
    }
});

function queryPromise(query, values) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = router;
