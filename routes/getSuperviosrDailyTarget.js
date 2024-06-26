const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getSupervisorDailyTarget', async (req, res) => {
    try {
        
        const decodedUsername = base64.decode(req.body.username);
        const userQuery = "SELECT userid FROM User WHERE username = ?";
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

        const lineNoQuery = "SELECT lineNo from operatorDailyAssignment WHERE supervisor = ? AND date = ?";
        const lineNoValues = [userId, current_date]
        const lineNoResult = await queryPromise(lineNoQuery, lineNoValues);

        if (!lineNoResult.length) {
            return res.status(404).send("Line number not assigned for today");
        }
        const lineNumber = lineNoResult[0].lineNo;

        // console.log(lineNumber)
        // Retrieve sales orders, line items, and quantities for the current date
        const dailyPlanQuery = `
            SELECT dailyTarget, style
            FROM dailyPlan
            WHERE date = ? AND lineNo = ?;
        `;
        const dailyPlanValues = [current_date, lineNumber];
        const dailyPlanResult = await queryPromise(dailyPlanQuery, dailyPlanValues);


        if (dailyPlanResult.length === 0) {
            return res.status(404).send('Date error');
        }

        if (dailyPlanResult.length > 0) {
            const dailyTarget = dailyPlanResult[0].dailyTarget;
            const style = dailyPlanResult[0].style;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'dailyTarget recieved successfully.', dailyTarget: dailyTarget});
        } else {
            res.status(500).json({ message: 'No dailyTarget recieved.', dailyTarget: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving dailyTarget');
    }

}



)
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
