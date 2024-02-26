const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64'); // You may need to install this library using 'npm install base-64'

const router = express.Router();

router.post('/getInfo', async (req, res) => {
    try {
        // Decode the provided username
        const decodedUsername = base64.decode(req.body.username);

        // Get userId from user table based on the decoded username
        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];

        console.log(decodedUsername);

        const userResult = await new Promise((resolve, reject) => {
            connection.query(userQuery, userValues, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Step 2: Get plantName and lineNo from operatordailyassignment using userId
        const assignmentQuery = "SELECT lineNo, plantName FROM operatorDailyAssignment WHERE userid = ? AND date = ?";
        const assignmentValues = [userId, current_date];

        console.log(userId)

        const assignmentResult = await new Promise((resolve, reject) => {
            connection.query(assignmentQuery, assignmentValues, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (assignmentResult.length === 0) {
            return res.status(404).send('Assignment data not found');
        }

        const { lineNo, plantName } = assignmentResult[0];

        // Send the response with plantName and lineNo
        res.json({ plantName, lineNo, decodedUsername });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
router.post('/getAdminInfo', async (req, res) => {
    try {
        // Decode the provided username
        const decodedUsername = base64.decode(req.body.username);

        res.json({decodedUsername });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
