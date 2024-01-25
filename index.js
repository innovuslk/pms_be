// app.js or server.js
const express = require('express');
const cors = require('cors');
const loginRoute = require('./login');
const getInfoByUsername = require('./routes/getFactoryInfo');
const setPieceCount = require('./routes/setPieceCount');
const getPieceCount = require('./routes/getLatestPieceCount');
const UserRegister = require('./routes/userRegister');
const getShift = require('./routes/getShift');
const getHoursInShift = require('./routes/getHoursInShift');
const app = express();

app.use(cors());

app.use(express.json());

app.use('/', loginRoute);
app.use('/', UserRegister);
app.use('/info',getInfoByUsername)
app.use('/set',setPieceCount)
app.use('/set',getPieceCount)
app.use('/get',getShift)
app.use('/get',getHoursInShift)

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
