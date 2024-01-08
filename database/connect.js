const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'newuser',
    password: '12345',
    database: 'softmatter',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to the database');
});

module.exports = connection;
