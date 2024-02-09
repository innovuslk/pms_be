const express = require('express');
const connection = require('../database/connect');
const router = express.Router();

router.post('/updateEndTime', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);
        const endTime = req.body.endTime;
        const type = req.body.type;

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        const updateDowntimeQuery = "UPDATE downtime SET endTime = ? WHERE userid = ? AND type = ? AND endTime IS NULL ORDER BY startTime DESC LIMIT 1";
        const updateDowntimeValues = [endTime, userId, type];
        await queryPromise(updateDowntimeQuery, updateDowntimeValues);

        res.status(200).send('End time updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating end time');
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
