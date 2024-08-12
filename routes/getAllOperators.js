const express = require('express');
const connection = require('../database/connect');
const router = express.Router();

router.post('/getAllOperators', async (req, res) => {
    try {

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date}`;

        const assignmentQuery = `
            SELECT DISTINCT userid 
            FROM operatorDailyAssignment 
            WHERE date = ?`;
        
        const assignmentResult = await new Promise((resolve, reject) => {
            connection.query(assignmentQuery, [current_date], (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        console.log(assignmentResult)

        if (assignmentResult.length === 0) {
            return res.status(404).send('No assignments found for today');
        }

        // Step 2: Extract userIds from the result
        const userIds = assignmentResult.map(row => row.userid);

        // Step 3: Get usernames from User table for the retrieved userIds
        const userQuery = `
            SELECT userid, username 
            FROM User 
            WHERE userid IN (?) `;

        const userResult = await new Promise((resolve, reject) => {
            connection.query(userQuery, [userIds], (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (userResult.length === 0) {
            return res.status(404).send('No users found for the given userIds');
        }

        // Step 4: Send the response
        res.json({ Users: userResult });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving users');
    }
});

module.exports = router;
