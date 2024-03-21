const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getPieceCountByLine', async (req, res) => {
    try {
        const lineNo = req.body.lineNo;

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        // Get the sum of piece counts for the user
        const totalPieceCountQuery = "SELECT SUM(pieceCount) as totalPieceCount, MAX(hour) as latestHour FROM pieceCount WHERE operation = 'LineEnd' AND lineNo = ? AND DATE(timestamp) = ?";
        const totalPieceCountValues = [lineNo , current_date];
        const totalPieceCountResult = await queryPromise(totalPieceCountQuery, totalPieceCountValues);

        if (totalPieceCountResult.length > 0) {
            const totalPieceCount = totalPieceCountResult[0].totalPieceCount;
            const latestHour = totalPieceCountResult[0].latestHour;
            // Respond with success and the total piece count and latest hour
            res.status(200).json({ message: 'Total piece count retrieved successfully.', totalPieceCount: totalPieceCount, latestHour: latestHour });
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
