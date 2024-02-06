const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getLineEndPieceCount', async (req, res) => {
    try {

        const operation = req.body.operation

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;
        
        // Get the sum of piece counts for the user
        const totalLineEndPieceCountQuery = "SELECT SUM(pieceCount) as totalLineEndPieceCount FROM pieceCount WHERE operation = ? AND DATE(timestamp) = ?";
        const totalLineEndPieceCountValues = [operation, current_date];
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