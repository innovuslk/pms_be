const express = require('express');
const connection = require('../database/connect');


const router = express.Router();


router.post('/insertOperatorWeek', async(req, res) => {
    const { data } = req.body;

    // Define an array to store the values for each row
    const values = [];

    data.forEach(row => {
        const { date, sbu, lineNo, plantName, userid, Shift, operation, supervisor, smv } = row;
        values.push([date, sbu, lineNo, plantName, userid, Shift, operation, supervisor, smv]);
    });

    const sql = `
    INSERT INTO operatorDailyAssignment (date, sbu, lineNo, plantName,userid, Shift, operation, supervisor, smv)
    VALUES ${data.map(row => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',')}
`;

connection.query(sql, values.flat(), (err, result) => {
    if (err) {
        console.error('Error inserting operator plan:', err);
        res.status(500).send('Error entering operator Plan.');
    } else {
        console.log('operator Plan entered successful');
        res.status(200).send('operator Plan entered successful.');
    }
});
});

module.exports = router;