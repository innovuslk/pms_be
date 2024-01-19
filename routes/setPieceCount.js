const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');
const shortid = require('shortid');

const router = express.Router();

router.post('/setPieceCount', async (req, res) => {
    try {
        const decodedUsername = base64.decode(req.body.username);
        const pieceCount = Number(req.body.pieceCount);

        // Get user ID
        const userQuery = "SELECT userid FROM user WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Retrieve sales orders, line items, and quantities for the current date
        const dailyPlanQuery = `
            SELECT salesOrder, lineItem, quantity
            FROM dailyPlan
            WHERE date = ?;
        `;
        const dailyPlanValues = [current_date];
        const dailyPlanResult = await queryPromise(dailyPlanQuery, dailyPlanValues);

        if (dailyPlanResult.length === 0) {
            return res.status(404).send('Date error');
        }

        const salesOrder = dailyPlanResult[0].salesOrder;
        const lineItem = dailyPlanResult[0].lineItem;
        const quantity = dailyPlanResult[0].quantity;



            // Insert a new record
            const operatorAssignmentQuery = "SELECT operation, plantName FROM operatorDailyAssignment WHERE userid = ?";
            const operatorAssignmentValues = [userId];
            const operatorAssignmentResult = await queryPromise(operatorAssignmentQuery, operatorAssignmentValues);

            if (operatorAssignmentResult.length === 0) {
                return res.status(404).send('Operator assignment not found');
            }

            const operation = operatorAssignmentResult[0].operation;
            const plantName = operatorAssignmentResult[0].plantName;
            const uniqueId = shortid.generate();

            const insertPieceCountQuery = "INSERT INTO pieceCount (id, userid, timestamp, salesOrder, lineItem, operation, plantName, pieceCount) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)";
            const insertPieceCountValues = [uniqueId, userId, salesOrder, lineItem, operation, plantName, pieceCount];
            await queryPromise(insertPieceCountQuery, insertPieceCountValues);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating piece Count');
    }
});

function queryPromise(query, values) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = router;
