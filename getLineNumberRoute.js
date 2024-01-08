// infoRoute.js
const express = require('express');
const connection = require('./database/connect');

const router = express.Router();

// Function to get line number by username
const getInfoByUsername = (username, callback) => {
    const infoSql = "SELECT line_number, factory FROM operatorInfo WHERE username = ?";
    const infoValues = [username];

    connection.query(infoSql, infoValues, (infoErr, infoData) => {
        if (infoErr) {
            return callback(infoErr, null);
        }

        if (infoData.length > 0) {
            const { username, line_number, factory } = infoData[0];
            return callback(null, { username, line_number, factory });
        } else {
            return callback("No record found", null);
        }
    });
};

// API endpoint to get line number by username
router.get('/getInfo/:username', (req, res) => {
    const username = req.params.username;

    getInfoByUsername(username, (err, info) => {
        if (err) {
            return res.json({ error: err });
        }

        return res.json(info);
    });
});

module.exports = router;
