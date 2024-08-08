const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

// Insert Daily Plan
router.post('/insertDailyPlan', async (req, res) => {
    const {
        Date,
        Sbu,
        SalesOrder,
        LineItem,
        LineNo,
        PlantName,
        DailyTarget,
        style,
        shift,
        plannedTarget
    } = req.body;

    const sql = `
        INSERT INTO dailyPlan (date, sbu, salesOrder, lineItem, lineNo, plantName, dailyTarget, style, shift, plannedTarget)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [Date, Sbu, SalesOrder, LineItem, LineNo, PlantName, DailyTarget, style, shift, plannedTarget];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting daily plan:', err);
            res.status(500).send('Error entering Daily Plan.');
        } else {
            console.log('Daily Plan entered successfully');
            res.status(200).send('Daily Plan entered successfully.');
        }
    });
});

// Fetch all Daily Plans
router.get('/dailyPlans', (req, res) => {
    const sql = 'SELECT * FROM dailyPlan';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching daily plans:', err);
            res.status(500).send('Error fetching daily plans.');
        } else {
            res.status(200).json(results);
        }
    });
});

// Update Daily Plan
router.put('/updateDailyPlan/:id', (req, res) => {
    const { id } = req.params;
    const {
        Date,
        Sbu,
        SalesOrder,
        LineItem,
        LineNo,
        PlantName,
        DailyTarget,
        style,
        shift,
        plannedTarget
    } = req.body;

    const sql = `
        UPDATE dailyPlan
        SET date = ?, sbu = ?, salesOrder = ?, lineItem = ?, lineNo = ?, plantName = ?, dailyTarget = ?, style = ?, shift = ?, plannedTarget = ?
        WHERE id = ?
    `;

    const values = [Date, Sbu, SalesOrder, LineItem, LineNo, PlantName, DailyTarget, style, shift, plannedTarget, id];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating daily plan:', err);
            res.status(500).send('Error updating Daily Plan.');
        } else {
            console.log('Daily Plan updated successfully');
            res.status(200).send('Daily Plan updated successfully.');
        }
    });
});

// Delete Daily Plan
router.delete('/deleteDailyPlan/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM dailyPlan WHERE id = ?';

    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting daily plan:', err);
            res.status(500).send('Error deleting Daily Plan.');
        } else {
            console.log('Daily Plan deleted successfully');
            res.status(200).send('Daily Plan deleted successfully.');
        }
    });
});

module.exports = router;
