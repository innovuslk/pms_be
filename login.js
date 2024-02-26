const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('./database/connect');
const config = require('./config/config');

const router = express.Router();

router.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = "SELECT * FROM User WHERE username = ?";
    const values = [username];

    try {
        connection.query(sql, values, async (err, data) => {
            if (err) {
                console.error('Login failed:', err);
                return res.status(500).json({ message: "Login failed" });
            }

            if (data.length > 0) {
                const hashedPassword = data[0].password;
                const userLevel = data[0].userlevelId

                // Compare the provided password with the stored hashed password
                const passwordMatch = await bcrypt.compare(password, hashedPassword);

                if (passwordMatch) {
                    // Generate a JWT token
                    const token = jwt.sign({ username: username, userLevel: userLevel }, config.JWT_SECRET, { expiresIn: '12h' });
                    return res.json({ message: "Login successful", token: token, userLevel:userLevel });
                } else {
                    return res.status(401).json({ message: "Incorrect password" });
                }
            } else {
                return res.status(401).json({ message: "No record found" });
            }
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;
