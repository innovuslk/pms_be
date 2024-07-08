const express = require('express');
const connection = require('../database/connect');

const router = express.Router();


router.post('/insertStyleData', async(req, res) => {
    const {
        Base,
        StyleNo,
        Size,
        StitchCount,
        Operation
    } = req.body;


    const sql = `
        INSERT INTO style (base_style, style_number, size, stitchCount, operation)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [Base, StyleNo, Size, StitchCount, Operation];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting Style:', err);
            res.status(500).send('Error inserting style.');
        } else {
            console.log('Style Added Successfully');
            res.status(200).send('Style Added Successfully');
        }
    });
});

module.exports = router;