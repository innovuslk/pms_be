const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getTopUsers', async (req, res) => {
    try {
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Get the top 5 users with the highest piece counts
        const topUsersQuery = `
            SELECT userid, SUM(pieceCount) AS totalPieceCount
            FROM pieceCount
            WHERE DATE(timestamp) = ?
            GROUP BY userid
            ORDER BY totalPieceCount DESC
            LIMIT 5;
        `;
        const topUsersQueryValues = [current_date];
        const topUsersResult = await queryPromise(topUsersQuery, topUsersQueryValues);

        // Fetch usernames of top users from the user table
        const userIds = topUsersResult.map(user => user.userid);
        const userNamesQuery = `
            SELECT userid, username
            FROM User
            WHERE userid IN (?);
        `;
        const userNamesQueryValues = [userIds];
        const userNamesResult = await queryPromise(userNamesQuery, userNamesQueryValues);

        // Combine user IDs, usernames, and piece counts
        const topUsersWithUsernames = topUsersResult.map(user => {
            const userDetails = userNamesResult.find(u => u.userid === user.userid);
            return {
                userid: user.userid,
                username: userDetails ? userDetails.username : null,
                totalPieceCount: user.totalPieceCount
            };
        });

        res.status(200).json({ message: 'Top 5 users with highest piece counts retrieved successfully.', topUsers: topUsersWithUsernames });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving top users with highest piece counts');
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
