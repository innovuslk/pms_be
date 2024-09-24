const express = require('express');
const connection = require('../database/connect');
const router = express.Router();

router.post('/getAllOperators', async (req, res) => {
    try {
        const { date, style, plant, lineNo } = req.body;

        // Step 1: Get user assignments based on the provided date, style, plant, and lineNo
        const assignmentQuery = `
            SELECT DISTINCT oda.userid, oda.shift, oda.operation
            FROM operatorDailyAssignment oda
            JOIN dailyPlan ls ON oda.lineNo = ls.lineNo
            WHERE oda.date = ? AND ls.style = ? AND ls.plantName = ? AND oda.lineNo = ?
        `;

        const assignmentResult = await new Promise((resolve, reject) => {
            connection.query(assignmentQuery, [date, style, plant, lineNo], (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (assignmentResult.length === 0) {
            return res.status(404).send('No assignments found for the provided criteria');
        }

        // Extract userIds, shifts, and operations from the result
        const userIds = assignmentResult.map(row => row.userid);
        const userShifts = assignmentResult.map(row => ({
            userid: row.userid,
            shift: row.shift,
            operation: row.operation
        }));

        // Step 2: Get usernames from User table for the retrieved userIds
        const userQuery = `
            SELECT userid, username 
            FROM User 
            WHERE userid IN (?) 
        `;

        const userResult = await new Promise((resolve, reject) => {
            connection.query(userQuery, [userIds], (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (userResult.length === 0) {
            return res.status(404).send('No users found for the given userIds');
        }

        // Step 3: Get sum of pieceCount from pieceCount table for each user
        const pieceCountQuery = `
            SELECT userid, SUM(pieceCount) as totalPieceCount
            FROM pieceCount
            WHERE userid IN (?) AND DATE(timestamp) = ?
            GROUP BY userid
        `;

        const pieceCountResult = await new Promise((resolve, reject) => {
            connection.query(pieceCountQuery, [userIds, date], (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        // Step 4: Merge data and create the final response
        const usersWithPieceCount = userResult.map(user => {
            const shiftData = userShifts.find(shift => shift.userid === user.userid);
            const pieceCountData = pieceCountResult.find(pc => pc.userid === user.userid) || { totalPieceCount: 0 };

            return {
                username: user.username,
                shift: shiftData ? shiftData.shift : null,
                operation: shiftData ? shiftData.operation : null, // Include the operation
                totalPieceCount: pieceCountData.totalPieceCount
            };
        });

        // Step 5: Send the response
        res.json({ users: usersWithPieceCount });

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving operator data');
    }
});

module.exports = router;
