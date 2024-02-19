const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getDowntimes', async (req, res) => {
    try {
        // Get today's date in the format YYYY-MM-DD
        const currentDate = new Date().toISOString().slice(0, 10);

        // Fetch all columns' data from downtime table where startTime is today's date
        const query = `
            SELECT *
            FROM downtime
            WHERE DATE(startTime) = ?;
        `;
        const values = [currentDate];
        const result = await queryPromise(query, values);

        const userIds = result.map(user => user.userid);
        const userNamesQuery = `
            SELECT userid, username
            FROM User
            WHERE userid IN (?);
        `;
        const userNamesQueryValues = [userIds];
        const userNamesResult = await queryPromise(userNamesQuery, userNamesQueryValues);

        // Combine user IDs, usernames, and piece counts
        const topUsersWithUsernames = result.map(user => {
            const userDetails = userNamesResult.find(u => u.userid === user.userid);
            return {
                ...user,
                username: userDetails ? userDetails.username : null,
            };
        });

        res.status(200).json({ message: 'Downtimes retrieved successfully.', downtimes: topUsersWithUsernames });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving downtimes');
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
