const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getMyBest', async (req, res) => {
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

        // Get the sum of piece counts for the user
        const shift = `
        SELECT MAX(hourly_sum) as maxPieceCount
        FROM (
            SELECT SUM(pieceCount) as hourly_sum
            FROM pieceCount
            WHERE userid = ? AND DATE(timestamp) = ?
            GROUP BY hour
        ) as hourly_sums;
    `;
        const shiftValues = [userId, current_date];
        const pieceCount = await queryPromise(shift, shiftValues);

        if (pieceCount.length > 0) {
            const maxPieceCount = pieceCount[0].maxPieceCount;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'mybest recieved successfully.', mybest: maxPieceCount });
        } else {
            res.status(200).json({ message: 'No value recieved.', mybest: 0 });
        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving MyBest');
    }

});

router.post('/getMASBest', async (req, res) => {
    try {
        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Get the sum of piece counts for the user
        const MASBest = `
        SELECT MAX(hourly_sum) as maxPieceCount
        FROM (
            SELECT SUM(pieceCount) as hourly_sum
            FROM pieceCount
            WHERE DATE(timestamp) = ?
            GROUP BY hour, userid
        ) as hourly_sums;
    `;
        const MASBestValues = [current_date];
        const pieceCount = await queryPromise(MASBest, MASBestValues);

        if (pieceCount.length > 0) {
            const maxPieceCount = pieceCount[0].maxPieceCount;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'mybest recieved successfully.', masbest: maxPieceCount });
        } else {
            res.status(200).json({ message: 'No value recieved.', masbest: 0 });
        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving MASBEst');
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
