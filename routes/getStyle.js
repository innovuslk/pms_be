const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getStyle', async (req, res) => {

    let operation = req.body.operation

    try {
        // Get the styles from the database
        const styleQuery = "SELECT * FROM style WHERE operation = ?";
        const styleValues = [operation]
        const styleResults = await queryPromise(styleQuery,styleValues);

        if (styleResults.length > 0) {
            // Extract styles
            const styles = styleResults.map(result => result.size);
            // Respond with success and the styles
            res.status(200).json({ message: 'Styles received successfully.', styles: styles });
        } else {
            res.status(200).json({ message: 'No styles received.', styles: [] });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving styles');
    }
});

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
