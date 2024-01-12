// app.js or server.js
const express = require('express');
const cors = require('cors');
const loginRoute = require('./login');
const getInfoByUsername = require('./routes/getFactoryInfo');
const setPieceCount = require('./routes/setPieceCount');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', loginRoute);
app.use('/info',getInfoByUsername)
app.use('/set',setPieceCount)

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
