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
        shift,
        operation,
        supervisor,
        Smv
    } = req.body;


    const sql = `
        INSERT INTO operatorDailyAssignment (date, sbu, lineNo, plantName, userid, Shift, operation, supervisor, smv)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [Date, Sbu, LineNo,PlantName, userId, shift, operation, supervisor, Smv];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send('Error Entering Operator.');
        } else {
            console.log('operator inserted successfully');
            res.status(200).send('Operator Assigned Successful.');
        }
    });
});

router.get('/operatorAssigns', (req, res) => {
    const sql = 'SELECT * FROM operatorDailyAssignment';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching operatorDailyAssignment:', err);
            res.status(500).send('Error fetching operatorDailyAssignment.');
        } else {
            res.status(200).json(results);
        }
    });
});

// Update Daily Plan
router.put('/updateOperatorAssign/:id', (req, res) => {
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
        shift
    } = req.body;

    const sql = `
        UPDATE operatorDailyAssignment
        SET date = ?, sbu = ?, salesOrder = ?, lineItem = ?, lineNo = ?, plantName = ?, dailyTarget = ?, style = ?, shift = ?
        WHERE id = ?
    `;

    const values = [Date, Sbu, SalesOrder, LineItem, LineNo, PlantName, DailyTarget, style, shift, id];

    connection.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating operator assign:', err);
            res.status(500).send('Error updating operator assign.');
        } else {
            console.log('operator assigned successfully');
            res.status(200).send('operator assigned successfully.');
        }
    });
});

// Delete Daily Plan
router.delete('/deleteOperatorAssign/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM operatorDailyAssignment WHERE id = ?';

    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting operatorAssign:', err);
            res.status(500).send('Error deleting operatorAssign.');
        } else {
            console.log('operatorAssign deleted successfully');
            res.status(200).send('operatorAssign deleted successfully.');
        }
    });
});

module.exports = router;