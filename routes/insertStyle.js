const express = require('express');
const connection = require('../database/connect');
const router = express.Router();

router.post('/insertStyle', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);
        const size = req.body.size;

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        const styleQuery = "INSERT INTO operatorSize (userid, size, timestamp) VALUES (?, ?, NOW())";
        const styleValues = [userId, size, current_date];
        await queryPromise(styleQuery, styleValues);

        res.status(200).send('size updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating size');
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
