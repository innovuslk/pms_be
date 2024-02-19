const express = require('express');
const connection = require('../database/connect');


const router = express.Router();


router.post('/insertOperator', async(req, res) => {
    const {
        Date,
        Sbu,
        LineNo,
        PlantName,
        userId,
        Shift,
        operation,
        Smv
    } = req.body;


    const sql = `
        INSERT INTO operatorDailyAssignment (date, sbu, lineNo, plantName, userid, Shift, operation, smv)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [Date, Sbu, LineNo,PlantName, userId, Shift, operation, Smv];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error Entering Operator.');
        } else {
            console.log('User registered successfully');
            res.status(200).send('Operator Assigned Successful.');
        }
    });
});

module.exports = router;