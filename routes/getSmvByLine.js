const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getsmvByLine', async (req, res) => {
    try {

        const lineNo = req.body.lineNo

        // Get the sum of piece counts for the user
        const smv = "SELECT smv FROM operatorDailyAssignment WHERE lineNo = ?";
        const smvValues = [lineNo];
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
