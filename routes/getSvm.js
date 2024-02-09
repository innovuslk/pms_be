const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getsmv', async (req, res) => {
    try {
        const decodedUsername = base64.decode(req.body.username);

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        // Get the sum of piece counts for the user
        const smv = "SELECT smv FROM operatorDailyAssignment WHERE userid = ?";
        const smvValues = [userId];
        const smvResults = await queryPromise(smv, smvValues);

        if (smvResults.length > 0) {
            const smv = smvResults[0].smv;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'smv recieved successfully.', smv: smv });
        } else {
            res.status(200).json({ message: 'No smv recieved.', smv: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving smv');
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
