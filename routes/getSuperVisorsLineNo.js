const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getSvLineNo', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);
        const plantName = req.body.plantName;

        // Query to get userid and userLevelId from the User table
        const userQuery = "SELECT userid, userlevelId FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        const userLevelId = userResult[0].userlevelId;

        // Get today's date in the format YYYY-MM-DD
        const date_time = new Date();
        const month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        const year = date_time.getFullYear();
        const date = ("0" + date_time.getDate()).slice(-2);
        const current_date = `${year}-${month}-${date}`;

        let lineNoQuery, supervisorQuery;
        let values = [current_date, plantName];

        if (userLevelId === 1) {
            // Admin: Fetch line numbers from dailyPlan table and supervisor IDs from operatorDailyAssignment table
            lineNoQuery = `
                SELECT DISTINCT dp.lineNo, dp.style 
                FROM dailyPlan dp 
                WHERE dp.date = ? AND dp.plantName = ?;
            `;

            supervisorQuery = `
                SELECT DISTINCT supervisor 
                FROM operatorDailyAssignment 
                WHERE date = ? AND plantName = ?;
            `;
        } else {
            // Non-admin: Fetch line numbers from operatorDailyAssignment table
            lineNoQuery = `
                SELECT o.lineNo, dp.style 
                FROM operatorDailyAssignment o 
                JOIN dailyPlan dp ON o.lineNo = dp.lineNo AND o.date = dp.date AND o.plantName = dp.plantName 
                WHERE o.supervisor = ? AND o.date = ? AND o.plantName = ?;
            `;
            values.unshift(userId); // Add userId to the beginning of values array
        }

        // Execute the line number query
        const lineNoResult = await queryPromise(lineNoQuery, values);

        const uniqueLineNosSet = new Set();
        const lineStyles = {};
        lineNoResult.forEach(row => {
            uniqueLineNosSet.add(row.lineNo);
            lineStyles[row.lineNo] = row.style;
        });

        const uniqueLineNos = [...uniqueLineNosSet];

        if (uniqueLineNos.length === 0) {
            return res.status(200).json({ message: 'Line numbers retrieved successfully.', lineNos: [], linePieceCounts: [] });
        }

        let supervisorResult = [];
        if (userLevelId === 1) {
            // Execute the supervisor query for admin
            supervisorResult = await queryPromise(supervisorQuery, values);
        } else {
            // Add the current user's supervisor ID
            supervisorResult.push({ supervisor: userId });
        }

        const supervisorIds = supervisorResult.map(row => row.supervisor);

        // Get the piece counts for each unique line number
        const pieceCountQuery = `
            SELECT p.lineNo, p.latestHour, p.totalPieceCount, pc.salesOrder
            FROM (
                SELECT lineNo, MAX(hour) as latestHour, SUM(pieceCount) AS totalPieceCount
                FROM pieceCount
                WHERE operation = 'LineEnd'
                AND DATE(timestamp) = ?
                AND lineNo IN (?)
                GROUP BY lineNo
            ) p
            JOIN pieceCount pc ON p.lineNo = pc.lineNo AND p.latestHour = pc.hour
            WHERE DATE(pc.timestamp) = ? AND pc.operation = 'LineEnd';
        `;
        const pieceCountValues = [current_date, uniqueLineNos, current_date];
        const pieceCountResult = await queryPromise(pieceCountQuery, pieceCountValues);

        const linePieceCounts = uniqueLineNos.map(lineNo => {
            const pieceCountData = pieceCountResult.find(row => row.lineNo === lineNo);
            return {
                lineNo: lineNo,
                pieceCount: pieceCountData ? pieceCountData.totalPieceCount : 0,
                latestHour: pieceCountData ? pieceCountData.latestHour : null,
                salesOrder: pieceCountData ? pieceCountData.salesOrder : null,
                style: lineStyles[lineNo] // Add style to the response
            };
        });

        res.status(200).json({ message: 'Line numbers retrieved successfully.', lineNos: uniqueLineNos, linePieceCounts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving lineNo');
    }
});



router.post('/getSvPlant', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);

        // Query to get userid and userLevelId from the User table
        const userQuery = "SELECT userid, userlevelId FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        const userLevelId = userResult[0].userlevelId;

        // Get today's date in the format YYYY-MM-DD
        const date_time = new Date();
        const month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        const year = date_time.getFullYear();
        const date = ("0" + date_time.getDate()).slice(-2);
        const current_date = `${year}-${month}-${date}`;

        let query;
        let values;

        // Choose the query based on user level
        if (userLevelId === 1) {
            // Admin: Fetch plant names from dailyPlan table
            query = `
                SELECT DISTINCT plantName
                FROM dailyPlan
                WHERE date = ?;
            `;
            values = [current_date];
        } else {
            // Non-admin: Fetch plant names from operatorDailyAssignment table
            query = `
                SELECT plantName
                FROM operatorDailyAssignment
                WHERE supervisor = ? AND date = ?;
            `;
            values = [userId, current_date];
        }

        // Execute the query
        const result = await queryPromise(query, values);

        // Extract unique plant names
        const uniquePlantName = new Set();
        result.forEach(row => {
            uniquePlantName.add(row.plantName);
        });

        const uniquePlantNames = [...uniquePlantName];

        res.status(200).json({ message: 'Plant names retrieved successfully.', plantNames: uniquePlantNames });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving plant names');
    }
});

router.post('/getSvLineUsers', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);
        const lineNo = req.body.lineNo;

        // Query to get userid and userLevelId from the User table
        const userQuery = "SELECT userid, userLevelId FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        const userLevelId = userResult[0].userLevelId;

        // Get today's date in the format YYYY-MM-DD
        const date_time = new Date();
        const month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        const year = date_time.getFullYear();
        const date = ("0" + date_time.getDate()).slice(-2);
        const current_date = `${year}-${month}-${date}`;

        let query;
        let values;

        if (userLevelId === 1) {
            // Admin: Fetch unique user IDs from operatorDailyAssignment table for all supervisors
            query = `
                SELECT DISTINCT userid
                FROM operatorDailyAssignment
                WHERE date = ? AND lineNo = ?;
            `;
            values = [current_date, lineNo];
        } else {
            // Non-admin: Fetch unique user IDs from operatorDailyAssignment table where supervisor is the user's ID
            query = `
                SELECT DISTINCT userid
                FROM operatorDailyAssignment
                WHERE supervisor = ? AND date = ? AND lineNo = ?;
            `;
            values = [userId, current_date, lineNo];
        }

        const result = await queryPromise(query, values);

        // Extract unique user IDs
        const uniqueUserIds = result.map(row => row.userid);

        if (uniqueUserIds.length === 0) {
            return res.status(200).json([]);
        }

        // Calculate the sum of pieceCount for today's date and specific user IDs
        const usernamesQuery = `
            SELECT u.username, SUM(pc.pieceCount) as totalPieceCount
            FROM User u
            JOIN pieceCount pc ON u.userid = pc.userid
            WHERE DATE(pc.timestamp) = ? AND pc.userid IN (${uniqueUserIds.map(() => '?').join(', ')})
            GROUP BY u.username;
        `;
        const usernamesValues = [current_date, ...uniqueUserIds];
        const usernamesResult = await queryPromise(usernamesQuery, usernamesValues);

        res.status(200).json(usernamesResult);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving usernames');
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
