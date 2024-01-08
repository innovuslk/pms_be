// loginRoute.js
const express = require('express');
const connection = require('./database/connect');

const router = express.Router();

router.post('/login', (req, res) => {
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    const values = [
        req.body.username,
        req.body.password
    ];
    
    connection.query(sql, values, (err, data) => {
        if (err) return res.json("Login Failed");
        if (data.length > 0) {
            return res.json("Login Successfully");
        } else {
            return res.status(401).json({ message: "No record found" });
        }
    });
});

module.exports = router;


