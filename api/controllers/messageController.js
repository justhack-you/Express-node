const func = require('../../utilities/utility-functions');
const messageService = require('../Services/messageService');

module.exports = {
    sendMessage,
    getMessage,
    getAllUsers
}



async function sendMessage(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} sendMessage()`)
        const response = await messageService.sendMessage(req.user, req.body)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} sendMessage() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} sendMessage() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function getMessage(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} getMessage()`)

        const response = await messageService.getMessage(req.params, req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} getMessage() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} getMessage() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function getAllUsers(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} getAllUsers()`)

        const response = await messageService.getAllUsers()
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} getAllUsers() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} getAllUsers() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}