const mysql = require('mysql');
const config = require('../config/config');
const bcrypt = require('bcrypt');

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
                userid INT AUTO_INCREMENT PRIMARY KEY,
                PN INT NOT NULL,
                username VARCHAR(255) NOT NULL,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                userlevelId INT,
                EPF VARCHAR(255) NOT NULL,
                plantName VARCHAR(50),
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
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                sbu VARCHAR(50) NOT NULL,
                salesOrder VARCHAR(255) NOT NULL,
                lineItem VARCHAR(255) NOT NULL,
                lineNo VARCHAR(50) NOT NULL,
                plantName VARCHAR(255) NOT NULL,
                style VARCHAR(50),
                dailyTarget INT NOT NULL
            );`,
            `CREATE TABLE IF NOT EXISTS operatorDailyAssignment (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE,
                sbu VARCHAR(50) NOT NULL,
                lineNo VARCHAR(50) NOT NULL,
                plantName VARCHAR(255) NOT NULL,
                userid INT NOT NULL,
                Shift VARCHAR(20),
                operation VARCHAR(255) NOT NULL,
                smv FLOAT NOT NULL,
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
            );`,
            `CREATE TABLE IF NOT EXISTS downtime (
                id VARCHAR(255) not null primary key,
                userid INT not null,
                downTime VARCHAR(50) not null,
                type VARCHAR(255) not null,
                startTime TIMESTAMP,
                endTime TIMESTAMP
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

    const defaultUserQuery = `INSERT INTO User (PN, userid, username, firstName, lastName, password, userlevelId, EPF) 
    SELECT ?, ?, ?, ?, ?, ?, ?, ? FROM dual
    WHERE NOT EXISTS (
        SELECT userid FROM User WHERE username = ?
    ) LIMIT 1`;

    const password = '12345';
    bcrypt.hash(password, 10)
        .then((hashedPassword) => {
            const defaultUserData = ['3243', '346', 'innovus', 'innovus', 'mahith', hashedPassword, '01', '3q47aweu', 'innovus'];

            connection.query(defaultUserQuery, defaultUserData, (err, results) => {
                if (err) {
                    console.error('Error creating default user:', err);
                } else {
                    console.log('Default user created successfully:', results);
                }
            });
        })
        .catch((err) => {
            console.error('Error hashing password:', err);
        });


        const insertUserLevelsQuery = `INSERT INTO user_level (id, userlevel)
        SELECT * FROM (SELECT ?, ?) AS tmp
        WHERE NOT EXISTS (
            SELECT id FROM user_level WHERE id = ?
        ) LIMIT 1`;
    
        // Data for user_level table
        const userLevelsData = [
            [1, 'admin'],
            [3, 'operator']
        ];
    
        // Insert data into user_level table
        userLevelsData.forEach((userData) => {
            connection.query(insertUserLevelsQuery, [...userData, userData[0]], (err, results) => {
                if (err) {
                    console.error('Error inserting user level:', err);
                } else {
                    console.log('User level inserted successfully:', results);
                }
            });
        });


});

module.exports = connection;
