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
const getLineEndPieceCount = require('./routes/getLineEndPieceCount');
const getDataForBarChart = require('./routes/getDataForBarChart');
const getSvm = require('./routes/getSvm');
const downTime = require('./routes/sendDowntime');
const updateEndTime = require('./routes/updateDownTime');
const getTopUsers = require('./routes/topUsers');
const insertDailyPlan = require('./routes/insertDailyPlan');
const insertOperator = require('./routes/insertOperator');
const getPlantUsers = require('./routes/getPlantUsers');
const getDowntimes = require('./routes/getDowntime');
const weekPlan = require('./routes/weekPlan');
const verifyToken = require('./authentication/verifyToken');
const getAllUsers = require('./routes/getAllUsers');
const sendSMS = require('./routes/sendSMS');
const getSvLineNo = require('./routes/getSuperVisorsLineNo');
const getPieceCountByLine = require('./routes/getPieceCountByLineNo');
const getsmvByLine = require('./routes/getSmvByLine');
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
app.use('/get',getLineEndPieceCount)
app.use('/get',getDataForBarChart)
app.use('/get',getSvm);
app.use('/send',downTime)
app.use('/update',updateEndTime)
app.use('/get',getTopUsers);
app.use('/insert',insertDailyPlan);
app.use('/insert',insertOperator);
app.use('/get',getPlantUsers);
app.use('/get',getDowntimes);
app.use('/insert',weekPlan);
app.use('/',verifyToken);
app.use('/',getAllUsers);
app.use('/send',sendSMS);
app.use('/',getSvLineNo);
app.use('/',getPieceCountByLine);
app.use('/',getsmvByLine);

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
