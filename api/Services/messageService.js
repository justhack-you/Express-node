const { default: mongoose } = require('mongoose');
const func = require('../../utilities/utility-functions');
const messageModel = require('../models/message');
const userModel = require('../models/user');
const Subscription = require('../models/Subscription')
const webpush = require('web-push');

module.exports = {
    sendMessage,
    getMessage,
    getAllUsers,
    userSubscription,
    sendNotification
}

async function sendMessage(reqUser, reqBody) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} sendMessage()`)

        const sender = reqUser.id
        const { receiver, content, isRead } = reqBody

        const message = new messageModel({ sender, receiver, content, isRead })
        await message.save();

        await message.populate('sender', 'username');
        await message.populate('receiver', 'username');

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} sendMessage() ${func.msgCons.WITH_SUCCESS}`)
        return { message: 'Message sent successfully', message }
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} sendMessage() ${func.msgCons.WITH_ERROR} => `, error)
        throw error;
    }
}

async function getMessage(reqParams, user) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} getMessage()`)

        const messages = await messageModel.find({
            $or: [
                { sender: new mongoose.Types.ObjectId(reqParams.id), receiver: new mongoose.Types.ObjectId(user.id) },
                { sender: new mongoose.Types.ObjectId(user.id), receiver: new mongoose.Types.ObjectId(reqParams.id) },
            ]
        }).populate('sender', '_id')
            .populate('receiver', '_id')
            .sort({ createdAt: 1 });

        const messageArray = messages.map(msg => ({
            id: msg._id,
            sender: msg.sender._id,
            receiver: msg.receiver._id,
            content: msg.content,
            isRead: msg.isRead
        }));

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} getMessage() ${func.msgCons.WITH_SUCCESS}`)
        return messageArray;
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} getMessage() ${func.msgCons.WITH_ERROR} => `, error)
        throw error;
    }
}

async function getAllUsers(reqUserId) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} getAllUsers()`)

        const users = await userModel.aggregate([
            {
                $addFields: {
                    isTargetUser: { $eq: ["$username", reqUserId] }
                }
            },
            {
                $lookup: {
                    from: "messages",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$sender", "$$userId"] },
                                        { $eq: ["$isRead", false] }
                                    ]
                                }
                            }
                        },
                        {
                            $count: "unreadCount"
                        }
                    ],
                    as: "unreadMessages"
                }
            },
            {
                $addFields: {
                    unreadCount: {
                        $ifNull: [
                            { $arrayElemAt: ["$unreadMessages.unreadCount", 0] },
                            0
                        ]
                    }
                }
            },
            {
                $sort: {
                    isTargetUser: -1,
                    username: 1
                }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    _id: 1,
                    unreadCount: 1
                }
            },
            { $unset: ["isTargetUser", "unreadMessages"] }
        ]);
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} getAllUsers() ${func.msgCons.WITH_SUCCESS}`)
        return users;
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} getAllUsers() ${func.msgCons.WITH_ERROR} => `, error)
        throw error;
    }
}

async function userSubscription(reqBody) {
    try {
        const { subscription, userId } = reqBody;
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} userSubscription()`)

        await Subscription.findOneAndUpdate(
            { userId },
            { subscription },
            { upsert: true }
        );

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} userSubscription() ${func.msgCons.WITH_SUCCESS}`)
        return { message: 'Subscription saved' };
    } catch (error) {
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} userSubscription() ${func.msgCons.WITH_ERROR}`)
        throw { error: error.message };
    }
}

webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

async function sendNotification(userId, payload) {
    try {
        const subscriptionDoc = await Subscription.findOne({ userId });

        if (!subscriptionDoc) {
            console.log('No subscription found for user:', userId);
            return;
        }

        await webpush.sendNotification(subscriptionDoc.subscription, JSON.stringify(payload));
        console.log('Notification sent successfully');
    } catch (error) {
        console.error('Error sending notification:', error);

        if (error.statusCode === 410) {
            await Subscription.findOneAndDelete({ userId });
        }
    }
};