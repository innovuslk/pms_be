const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getSvm', async (req, res) => {
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
        const Svm = "SELECT svm FROM operatordailyassignment WHERE userid = ?";
        const SvmValues = [userId];
        const SvmResults = await queryPromise(Svm, SvmValues);

        if (SvmResults.length > 0) {
            const Svm = SvmResults[0].svm;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'Svm recieved successfully.', Svm: Svm });
        } else {
            res.status(200).json({ message: 'No Svm recieved.', Svm: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving Svm');
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