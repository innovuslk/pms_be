const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getAllOperators', async (req, res) => {
    try {
        const userQuery = "SELECT userid, username FROM User WHERE userlevelId = '3'";

        const userResult = await new Promise((resolve, reject) => {
            connection.query(userQuery, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (userResult.length === 0) {
            return res.status(404).send('Users not found');
        }
        res.json({ Users: userResult });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lineNo');
    }
});

module.exports = router;
