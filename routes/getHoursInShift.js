const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getShiftHours', async (req, res) => {
    try {
        const shiftID = req.body.shiftID;

        const userQuery = "SELECT NoOfHours FROM shift WHERE shiftID = ?";
        const userValues = [shiftID];
        const userResult = await queryPromise(userQuery, userValues);

        console.log(shiftID);

        if (userResult.length > 0) {
            const NoOfHours = userResult[0].NoOfHours;
            console.log(NoOfHours)
            // Respond with success and the total piece count
            res.status(200).json({ message: 'ShiftHours recieved successfully.', ShiftHours: NoOfHours });
        } else {
            res.status(500).json({ message: 'No ShiftHours recieved.', ShiftHours: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving Shift');
    }

}

)

router.post('/getDailyTarget', async (req, res) => {
    try {
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Retrieve sales orders, line items, and quantities for the current date
        const dailyPlanQuery = `
            SELECT dailyTarget
            FROM dailyPlan
            WHERE date = ?;
        `;
        const dailyPlanValues = [current_date];
        const dailyPlanResult = await queryPromise(dailyPlanQuery, dailyPlanValues);

        if (dailyPlanResult.length === 0) {
            return res.status(404).send('Date error');
        }

        if (dailyPlanResult.length > 0) {
            const dailyTarget = dailyPlanResult[0].dailyTarget;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'dailyTarget recieved successfully.', dailyTarget: dailyTarget });
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