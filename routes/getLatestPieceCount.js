const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getPieceCount', async (req, res) => {
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
        const totalPieceCountQuery = "SELECT SUM(pieceCount) as totalPieceCount FROM pieceCount WHERE userid = ?";
        const totalPieceCountValues = [userId];
        const totalPieceCountResult = await queryPromise(totalPieceCountQuery, totalPieceCountValues);

        if (totalPieceCountResult.length > 0) {
            const totalPieceCount = totalPieceCountResult[0].totalPieceCount;
            // Respond with success and the total piece count
            res.status(200).json({ message: 'Total piece count retrieved successfully.', totalPieceCount: totalPieceCount });
        } else {
            res.status(200).json({ message: 'No piece counts found for the user.', totalPieceCount: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving total piece count');
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