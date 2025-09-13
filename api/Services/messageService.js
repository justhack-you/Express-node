const { default: mongoose } = require('mongoose');
const func = require('../../utilities/utility-functions');
const messageModel = require('../models/message');
const userModel = require('../models/user');

module.exports = {
    sendMessage,
    getMessage,
    getAllUsers
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
        res.status(500).json(error);
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
        res.status(500).json(error);
    }
}

async function getAllUsers() {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} getAllUsers()`)

        const users = await userModel.find({}).select('username email');
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} getAllUsers() ${func.msgCons.WITH_SUCCESS}`)
        return users;
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} getAllUsers() ${func.msgCons.WITH_ERROR} => `, error)
        res.status(500).json(error);
    }
}