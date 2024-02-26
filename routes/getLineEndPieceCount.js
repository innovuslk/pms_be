const express = require('express');
const connection = require('../database/connect');
const base64 = require('base-64');

const router = express.Router();

router.post('/getLineEndPieceCount', async (req, res) => {
    try {

        const operation = req.body.operation

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        const decodedUsername = base64.decode(req.body.username);

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        const lineNoQuery = "SELECT lineNo from operatorDailyAssignment WHERE userid = ? AND date = ?";
        const lineNoValues = [userId, current_date]
        const lineNoResult = await queryPromise(lineNoQuery, lineNoValues);

        if (!lineNoResult.length) {
            return res.status(404).send("Line number not assigned for today");
        }
        const lineNumber = lineNoResult[0].lineNo;
        
        // Get the sum of piece counts for the user
        const totalLineEndPieceCountQuery = "SELECT SUM(pieceCount) as totalLineEndPieceCount FROM pieceCount WHERE operation = ? AND DATE(timestamp) = ? AND lineNo = ?";
        const totalLineEndPieceCountValues = [operation, current_date, lineNumber];
        const totalLineEndPieceCountResult = await queryPromise(totalLineEndPieceCountQuery, totalLineEndPieceCountValues);

        if (totalLineEndPieceCountResult.length > 0) {
            const totalLineEndPieceCount = totalLineEndPieceCountResult[0].totalLineEndPieceCount;
            // Respond with success and the total piece count and latest hour
            res.status(200).json({ message: 'Total Line end piece count retrieved successfully.', totalLineEndPieceCount: totalLineEndPieceCount});
        } else {
            res.status(200).json({ message: 'No piece counts found for the user.', totalLineEndPieceCount: 0 });
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