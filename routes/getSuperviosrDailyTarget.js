const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getSupervisorDailyTarget', async (req, res) => {
    try {
        const decodedUsername = base64.decode(req.body.username);
        const userQuery = "SELECT userid, userlevelId FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;
        const userLevelId = userResult[0].userlevelId;

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date}`;

        let query;
        let values;

        if (userLevelId === 1) {
            // Admin: Fetch plant names from dailyPlan table
            query = `
                SELECT DISTINCT lineNo
                FROM dailyPlan
                WHERE date = ?;
            `;
            values = [current_date];
        } else {
            // Non-admin: Fetch plant names from operatorDailyAssignment table
            query = `
                SELECT lineNo
                FROM operatorDailyAssignment
                WHERE supervisor = ? AND date = ?;
            `;
            values = [userId, current_date];
        }

        const lineNoResult = await queryPromise(query, values);


        if (!lineNoResult.length) {
            return res.status(404).send("Line number not assigned for today");
        }

        const dailyTargets = [];

        for (const line of lineNoResult) {
            const lineNumber = line.lineNo;
            const dailyPlanQuery = `
                SELECT dailyTarget, style
                FROM dailyPlan
                WHERE date = ? AND lineNo = ?;
            `;
            const dailyPlanValues = [current_date, lineNumber];
            const dailyPlanResult = await queryPromise(dailyPlanQuery, dailyPlanValues);

            if (dailyPlanResult.length > 0) {
                dailyTargets.push({
                    lineNo: lineNumber,
                    dailyTarget: dailyPlanResult[0].dailyTarget,
                    style: dailyPlanResult[0].style
                });
            }
        }

        if (dailyTargets.length === 0) {
            return res.status(404).send('No daily targets found for the given date');
        }

        // Respond with success and the daily targets
        res.status(200).json({ message: 'Daily targets received successfully.', dailyTargets: dailyTargets });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving daily targets');
    }
});

module.exports = router;

// Helper function to promisify the database query
function queryPromise(query, values) {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}
