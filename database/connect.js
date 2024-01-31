const mysql = require('mysql');
const config = require('../config/config');

const connection = mysql.createConnection({
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the database');
    function createTables() {
        const createTableQueries = [
            `CREATE TABLE IF NOT EXISTS user_level (
                id INT PRIMARY KEY,
                userlevel VARCHAR(255) NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS User (
                PN INT,
                userid INT NOT NULL,
                username VARCHAR(255) NOT NULL,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                userlevelId INT,
                EPF VARCHAR(255) NOT NULL,
                PRIMARY KEY (PN, userid),
                INDEX idx_userid (userid),
                FOREIGN KEY (userlevelId) REFERENCES user_level(id)
            );`,
            `CREATE TABLE IF NOT EXISTS shift (
                ShiftID VARCHAR(20) not null primary key,
                startTime VARCHAR(50) not null,
                endTime VARCHAR(50) not null,
                NoOfHours INT not null
            )`,
            `CREATE TABLE IF NOT EXISTS dailyPlan (
                id INT PRIMARY KEY,
                date DATE NOT NULL,
                sbu VARCHAR(50) NOT NULL,
                salesOrder VARCHAR(255) NOT NULL,
                lineItem VARCHAR(255) NOT NULL,
                lineNo INT NOT NULL,
                plantName VARCHAR(255) NOT NULL,
                dailyTarget INT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS operatorDailyAssignment (
                id INT PRIMARY KEY,
                date DATE,
                sbu VARCHAR(50) NOT NULL,
                lineNo INT NOT NULL,
                plantName VARCHAR(255) NOT NULL,
                userid INT NOT NULL,
                Shift VARCHAR(20),
                operation VARCHAR(255) NOT NULL,
                svm INT NOT NULL,
                FOREIGN KEY (userid) REFERENCES User(userid),
                FOREIGN KEY (Shift) REFERENCES shift(ShiftID)
            );`,
            `CREATE TABLE IF NOT EXISTS pieceCount (
                id VARCHAR(255) PRIMARY KEY,
                userid INT NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                salesOrder VARCHAR(50),
                lineItem VARCHAR(255),
                operation VARCHAR(255) NOT NULL,
                plantName VARCHAR(50) NOT NULL,
                pieceCount VARCHAR(50),
                shift VARCHAR(20),
                hour VARCHAR(20),
                lineNo VARCHAR(20),
                FOREIGN KEY (userid) REFERENCES User(userid)
            );`
        ];

        // Execute each query
        createTableQueries.forEach((query) => {
            connection.query(query, (err, results) => {
                if (err) {
                    console.error('Error creating table:', err);
                } else {
                    console.log('Table created successfully:', results);
                }
            });
        });
    }

    // Call the function to create tables after connecting
    createTables();
});

module.exports = connection;
