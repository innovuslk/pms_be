const express = require('express');
const { WebPubSubServiceClient } = require('@azure/web-pubsub');
const connection = require('../database/connect');
const { WebPubSubEventHandler } = require('@azure/web-pubsub-express');

const router = express.Router();
const connectionString = 'Endpoint=https://pms-chat.webpubsub.azure.com;AccessKey=CCSh7lChRl/3/El9lcWenImYKCrtEK5wpUeo2UdEM4g=;Version=1.0;';
const hubName = 'PMS_CHAT';
const webPubSubServiceClient = new WebPubSubServiceClient(connectionString, hubName);

const chatRooms = {};

router.use(express.json());

let handler = new WebPubSubEventHandler(hubName, {
    path: "/eventhandler",
    onConnected: async (req) => {
        console.log(`${req.context.userId} connected`);
        await webPubSubServiceClient.sendToAll({
            type: "system",
            message: `${req.context.userId} joined`,
        });
    },
    handleUserEvent: async (req, res) => {
        if (req.context.eventName === "message") {
            await webPubSubServiceClient.sendToAll({
                from: req.context.userId,
                message: req.data,
            });
        }
        res.success();
    },
});

router.post('/startChat', async (req, res) => {
    try {
        const decodedUsername = atob(req.body.username);

        const userQuery = "SELECT userid FROM User WHERE username = ?";
        const userValues = [decodedUsername];
        const userResult = await queryPromise(userQuery, userValues);

        if (userResult.length === 0) {
            return res.status(404).send('User not found');
        }

        const userId = userResult[0].userid;

        let date_time = new Date();
        let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
        let year = date_time.getFullYear();
        let date = ("0" + date_time.getDate()).slice(-2);
        let current_date = `${year}-${month}-${date} `;

        const query = `
            SELECT supervisor
            FROM operatorDailyAssignment
            WHERE userid = ? AND date = ?;
        `;
        const values = [userId, current_date];
        const result = await queryPromise(query, values);

        const supervisorId = result[0].supervisor;

        if (supervisorId == null) {
            return res.status(503).json("No supervisor assigned for this user today.");
        }

        const roomId = `room-${supervisorId}-${Date.now()}`;
        const group = `group-${supervisorId}`;
        await webPubSubServiceClient.sendToAll(group, { type: "system", message: `New chat room created for user ${decodedUsername}` });

        chatRooms[roomId] = { supervisorId, messages: [], users: [] };
        res.json({ roomId });
    } catch (error) {
        console.error('Failed to start chat', error);
        res.status(500).json({ message: 'Failed to start chat' });
    }
});
router.use(handler.getMiddleware());
router.get('/negotiate', async (req, res) => {
    try {
        let id = req.query.id;
        console.log(id)
        if (!id) {
            res.status(400).send("missing user id");
            return;
        }
        let token = await serviceClient.getClientAccessToken({ userId: id });
        res.json({
            url: token.url,
        });
    } catch (error) {
        console.error('Failed to negotiate token', error);
        res.status(500).json({ message: 'Failed to negotiate token' });
    }
});

router.use(express.static('public'));


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
