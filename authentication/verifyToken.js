const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const router = express.Router();

router.get('/verifyToken', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }

        // Token is valid, you can continue with your logic here
        res.status(200).json({ message: 'Token is valid' });
    });
});

module.exports = router;