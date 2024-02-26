const express = require('express');
const connection = require('../database/connect');


const router = express.Router();


router.post('/insertWeekPlan', async(req, res) => {
    console.log(req.body)
    const { data } = req.body;

    // Define an array to store the values for each row
    const values = [];

    data.forEach(row => {
        const { date, sbu, salesOrder, lineItem, lineNo, plantName, dailyTarget, style } = row;
        values.push([date, sbu, salesOrder, lineItem, lineNo, plantName, dailyTarget, style]);
    });

    const sql = `
    INSERT INTO dailyPlan (date, sbu, salesOrder, lineItem, lineNo, plantName, dailyTarget, style)
    VALUES ${data.map(row => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',')}
`;

connection.query(sql, values.flat(), (err, result) => {
    if (err) {
        console.error('Error inserting daily plan:', err);
        res.status(500).send('Error entering Daily Plan.');
    } else {
        console.log('Daily Plan entered successful');
        res.status(200).send('Daily Plan entered successful.');
    }
});
});

module.exports = router;