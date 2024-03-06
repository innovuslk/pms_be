const express = require('express');
const connection = require('../database/connect');

const router = express.Router();

router.post('/getAllUsers', async (req, res) => {
    try {
        const userQuery = "SELECT * FROM User";

        const userResult = await new Promise((resolve, reject) => {
            connection.query(userQuery, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        if (userResult.length === 0) {
            return res.status(404).send('Users not found');
        }
        res.json({ Users: userResult });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/deleteUser', async (req, res) => {
    const { userId } = req.body;

    try {
        // Delete records from operatordailyassignment table that reference the user
        const deleteAssignmentQuery = "DELETE FROM operatordailyassignment WHERE userid = ?";
        connection.query(deleteAssignmentQuery, [userId], (err, result) => {
            if (err) {
                console.error('Error deleting assignment:', err);
                return res.status(500).send('Internal Server Error');
            }

            // Delete the user from the User table
            const deleteUserQuery = "DELETE FROM User WHERE userid = ?";
            connection.query(deleteUserQuery, [userId], (err, result) => {
                if (err) {
                    console.error('Error deleting user:', err);
                    return res.status(500).send('Internal Server Error');
                }

                if (result.affectedRows === 0) {
                    return res.status(404).send('User not found');
                }

                res.status(200).send('User deleted successfully');
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
