const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getTopUsers', async (req, res) => {
    try {
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date}`;

        // Get the top 5 users with the highest piece counts
        const topUsersQuery = `
            SELECT pc.userid, u.username, pc.totalPieceCount, p.shift, p.plantName, p.lineNo, p.operation
            FROM (
                SELECT userid, SUM(pieceCount) AS totalPieceCount
                FROM pieceCount
                WHERE DATE(timestamp) = ?
                GROUP BY userid
                ORDER BY totalPieceCount DESC
                LIMIT 5
            ) AS pc
            JOIN User u ON pc.userid = u.userid
            JOIN (
                SELECT userid, shift, plantName, lineNo, operation
                FROM pieceCount
                WHERE DATE(timestamp) = ?
                GROUP BY userid, shift, plantName, lineNo, operation
            ) AS p ON pc.userid = p.userid
        `;
        const topUsersQueryValues = [current_date, current_date];
        const topUsersResult = await queryPromise(topUsersQuery, topUsersQueryValues);

        const topUsersWithCurrentHourOutput = await Promise.all(topUsersResult.map(async (user) => {
            const latestHourQuery = `
                SELECT MAX(hour) AS latestHour
                FROM pieceCount
                WHERE userid = ? AND DATE(timestamp) = ?
            `;
            const latestHourValues = [user.userid, current_date];
            const latestHourResult = await queryPromise(latestHourQuery, latestHourValues);
            const latestHour = latestHourResult[0]?.latestHour || 0;

            const currentHourOutputQuery = `
                SELECT SUM(pieceCount) AS currentHourOutput
                FROM pieceCount
                WHERE userid = ? AND DATE(timestamp) = ? AND hour = ?
            `;
            const currentHourOutputValues = [user.userid, current_date, latestHour];
            const currentHourOutputResult = await queryPromise(currentHourOutputQuery, currentHourOutputValues);
            const currentHourOutput = currentHourOutputResult[0]?.currentHourOutput || 0;

            return {
                ...user,
                currentHourOutput,
                latestHour
            };
        }));

        // Insert top users with currentHourOutput, latestHour, and current timestamp into topUsers table
        const insertTopUsersQuery = `
            INSERT INTO topUsers (userid, username, totalPieceCount, shift, plantName, lineItem, currentHourOutput, latestHour, timestamp, operation)
            VALUES ?
        `;
        const currentTimestamp = new Date();
        const insertTopUsersValues = topUsersWithCurrentHourOutput.map(user => [
            user.userid, user.username, user.totalPieceCount, user.shift, user.plantName, user.lineNo, user.currentHourOutput, user.latestHour, currentTimestamp, user.operation
        ]);
        await queryPromise(insertTopUsersQuery, [insertTopUsersValues]);

        res.status(200).json({ message: 'Top 5 users with highest piece counts, current hour output, and latest hour inserted successfully.', topUsers: topUsersWithCurrentHourOutput });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving and inserting top users with highest piece counts, current hour output, and latest hour');
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
