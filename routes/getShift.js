const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getShift', async (req, res) => {
    try {
        const decodedUsername = base64.decode(req.body.username);

        const userQuery = "SELECT userid FROM user WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        // Get the sum of piece counts for the user
        const shift = "SELECT Shift FROM operatordailyassignment WHERE userid = ?";
        const shiftValues = [userId];
        const shiftResults = await queryPromise(shift, shiftValues);

        if (shiftResults.length > 0) {
            const Shift = shiftResults[0].Shift;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'Shift recieved successfully.', Shift: Shift });
        } else {
            res.status(200).json({ message: 'No Shift recieved.', Shift: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving Shift');
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