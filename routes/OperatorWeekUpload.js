const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/insertOperatorWeek', async (req, res) => {
    const { data } = req.body;

    // Extract usernames from the data
    const usernames = data.map(row => row.username);

    // Query to get userids from usernames
    const getUserIdsQuery = `SELECT username, userid FROM User WHERE username IN (?)`;

    connection.query(getUserIdsQuery, [usernames], (err, results) => {
        if (err) {
            console.error('Error fetching userids:', err);
            return res.status(500).send('Error fetching userids.');
        }

        // Create a map of usernames to userids
        const usernameToUserIdMap = {};
        console.log(results)
        results.forEach(row => {
            usernameToUserIdMap[row.username] = row.userid;
        });

        // Replace usernames with userids in the data
        const values = data.map(row => {
            const { date, sbu, lineNo, plantName, username, Shift, operation, supervisor, smv } = row;
            return [date, sbu, lineNo, plantName, usernameToUserIdMap[username], Shift, operation, supervisor, smv];
        });

        // Insert the data into operatorDailyAssignment table
        const insertQuery = `
            INSERT INTO operatorDailyAssignment (date, sbu, lineNo, plantName, userid, Shift, operation, supervisor, smv)
            VALUES ${data.map(row => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',')}
        `;

        connection.query(insertQuery, values.flat(), (err, result) => {
            if (err) {
                console.error('Error inserting operator plan:', err);
                return res.status(500).send('Error entering operator Plan.');
            } else {
                console.log('Operator Plan entered successfully');
                return res.status(200).send('Operator Plan entered successfully.');
            }
        });
    });
});

module.exports = router;
