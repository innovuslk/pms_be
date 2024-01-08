// app.js or server.js
const express = require('express');
const cors = require('cors');
const loginRoute = require('./login');
const getInfoByUsername = require('./getLineNumberRoute');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', loginRoute);
app.use('/info',getInfoByUsername)

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
