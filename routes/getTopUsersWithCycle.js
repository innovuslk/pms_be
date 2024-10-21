const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.get('/getTopUsersWithCycle', async (req, res) => {
    try {
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date}`;


        const topUsersQuery = `
            SELECT t1.userid, t1.username, t1.totalPieceCount, t1.shift, t1.plantName, t1.lineItem, t1.currentHourOutput, t1.latestHour, t1.operation
            FROM topUsers t1
            INNER JOIN (
                SELECT userid, MAX(timestamp) AS latestTimestamp
                FROM topUsers
                WHERE DATE(timestamp) = ?
                GROUP BY userid
            ) t2 ON t1.userid = t2.userid AND t1.timestamp = t2.latestTimestamp
        `;
        const topUsersResult = await queryPromise(topUsersQuery, [current_date]);

        // console.log(`Top Users Result: ${JSON.stringify(topUsersResult)}`);

        if (topUsersResult.length === 0) {
            return res.status(200).json({ message: 'No top users found for the current date.', topUsers: [] });
        }

        // Calculate average and best cycle times for each user
        const topUsersWithCycleTimes = topUsersResult.map(user => {
            let intHour;
            switch (user.latestHour) {
                case 1:
                    intHour = 20;
                    break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                    intHour = 60;
                    break;
                case 9:
                    intHour = 8.5;
                    break;
                case 10:
                    intHour = 10;
                    break;
                default:
                    intHour = 60;
                    break;
            }

            const avgCycle = (user.currentHourOutput / intHour).toFixed(2);
            const bestCycle = (user.totalPieceCount / intHour).toFixed(2); // Assuming bestCycle uses totalPieceCount and latestHour

            return {
                ...user,
                avgCycle,
                bestCycle
            };
        });

        console.log(`Top Users with Cycle Times: ${JSON.stringify(topUsersWithCycleTimes)}`);

        res.status(200).json({ topUsers: topUsersWithCycleTimes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching top users');
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
