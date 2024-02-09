const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');
const shortid = require('shortid');

const router = express.Router();

router.post('/downTime', async (req, res) => {
    try {
        console.log(req.body)
        const decodedUsername = atob(req.body.username);
        const downTime = req.body.downTime;
        const type = req.body.type;
        const startTime = req.body.startTime;

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        const uniqueId = shortid.generate();

        const insertDowntimeQuery = "INSERT INTO downtime (id, userid,downTime,type,startTime ) VALUES (?, ?, ?, ?, ?)";
        const insertDowntimeValues = [uniqueId, userId, '0', type, startTime ];
        await queryPromise(insertDowntimeQuery, insertDowntimeValues);


    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error updating piece Count');
    }
})

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