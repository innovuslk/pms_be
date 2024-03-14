const express = require('express');
const connection = require('../database/connect');
const bcrypt = require('bcrypt');

const router = express.Router();


router.post('/register', async(req, res) => {
    const {
        PN,
        username,
        firstName,
        lastName,
        password,
        userlevel,
        EPF,
        plantName,
        mobile
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO User (PN, username, firstName, lastName, password, userLevelId, EPF, plantName, mobile)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [PN, username, firstName, lastName, hashedPassword, userlevel, EPF, plantName, mobile];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error registering user.');
        } else {
            console.log('User registered successfully');
            res.status(200).send('User registered successfully.');
        }
    });
});

module.exports = router;