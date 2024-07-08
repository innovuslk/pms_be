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
const getAllOperators = require('./routes/getAllOperators')
const chatRouter = require('./routes/startChat');
const mybest = require('./routes/getMyBest');
const getAPILineData = require('./routes/getAPILineData');
const getSupervisorDailyTarget = require('./routes/getSuperviosrDailyTarget')
const getStyle = require('./routes/getStyle')
const insertStyle = require('./routes/insertStyle')
const insertStyleData = require('./routes/insertStyleData')
const OperatorWeekUpload = require('./routes/OperatorWeekUpload')
const getTopUsersWithCycle = require('./routes/getTopUsersWithCycle')
const getHistory = require('./routes/getHistory')

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
app.use('/',getAllOperators)
app.use('/chat', chatRouter);
app.use('/get',mybest);
app.use('/get',getAPILineData);
app.use('/get', getSupervisorDailyTarget);
app.use('/get', getStyle);
app.use('/insert', insertStyle);
app.use('/insert', insertStyleData);
app.use('/insert',OperatorWeekUpload);
app.use('/get',getTopUsersWithCycle);
app.use('/get',getHistory);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});
