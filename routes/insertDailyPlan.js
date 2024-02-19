const express = require('express');
const connection = require('../database/connect');


const router = express.Router();


router.post('/insertDailyPlan', async(req, res) => {
    console.log(req.body)
    const {
        Date,
        Sbu,
        SalesOrder,
        LineItem,
        LineNo,
        PlantName,
        DailyTarget,
    } = req.body;



    const sql = `
        INSERT INTO dailyPlan (date, sbu, salesOrder, lineItem, lineNo, plantName, dailyTarget)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [Date, Sbu, SalesOrder, LineItem, LineNo, PlantName, DailyTarget];

    connection.query(sql, values, (err, result) => {
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