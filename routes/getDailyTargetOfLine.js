const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getDailyTargetByLine', async (req, res) => {
    try {

        const lineNo = req.body.lineNo
        const date = req.body.date

        // Get the sum of piece counts for the user
        const smv = "SELECT dailyTarget FROM dailyPlan WHERE lineNo = ? AND date = ?";
        const smvValues = [lineNo, date];
        const smvResults = await queryPromise(smv, smvValues);

        if (smvResults.length > 0) {
            const dailyTarget = smvResults[0].dailyTarget;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'smv recieved successfully.', dailyTarget: dailyTarget });
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
