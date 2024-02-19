const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getPlantUsers', async (req, res) => {
    try {
        const plantName = req.body.plantName;

        const userQuery = "SELECT userid, username FROM User WHERE plantName = ?";
        const userValues = [plantName];

        const userResult = await new Promise((resolve, reject) => {
            connection.query(userQuery, userValues, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        // Send the response with usernames and userids
        const users = userResult.map(user => ({ username: user.username, userid: user.userid }));
        res.json(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;