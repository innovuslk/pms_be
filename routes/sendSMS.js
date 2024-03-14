const express = require('express');
const router = express.Router();
const config = require('../config/config');
const accountSid = config.TWILIO_ACCOUNT_SID;
const authToken = config.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const connection = require('../database/connect');
const base64 = require('base-64');

router.post('/sendSMS', async (req, res) => {
    try {
        const decodedUsername = base64.decode(req.body.username);

        const userQuery1 = "SELECT userid FROM User WHERE username = ?";
        const userValues1 = [decodedUsername];
        const userResult1 = await queryPromise(userQuery1, userValues1);

        if (userResult1.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult1[0].userid;

        const from = '+18563676136';

        const userQuery = "SELECT supervisor FROM operatorDailyAssignment WHERE userid = ? ";
        const userValues = [userId];

        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('Supervisor not found');
        }

        const supervisorId = userResult[0].supervisor;

        const phoneNumberQuery = "SELECT mobile FROM User WHERE userid = ? ";
        const phoneNumberValues = [supervisorId];

        const phoneNumberResult = await queryPromise(phoneNumberQuery, phoneNumberValues);

        if (phoneNumberResult.length === 0) {
            return res.status(404).send('Mobile number not found');
        }

        const toPhoneNumber = phoneNumberResult[0].mobile;

        // Send SMS message
        const message = await client.messages.create({
            body: `'${decodedUsername} need your assistance immediately' - sent from Softmatter PMS`,
            from,
            to: toPhoneNumber
        });

        console.log(message.sid);
        res.status(200).json({ message: 'SMS sent successfully', messageId: message.sid });
    } catch (error) {
        console.error('Failed to send SMS:', error);
        res.status(500).json({ message: 'Failed to send SMS' });
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
