const userService = require('../Services/userService')
const func = require('../../utilities/utility-functions');

module.exports = {
    register,
    login,
    updateProfile,
    createTask,
    updateTask,
    deleteTask,
    statisticsTask,
    getAllUser,
    updateUserStatus,
    assignmentList,
    fetchUserById
}

async function register(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} register()`)

        const response = await userService.register(req.body)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} register() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} register() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}
async function login(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} login()`)

        const response = await userService.login(req.body)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} login() ${func.msgCons.WITH_SUCCESS}`)
        const token = (response?.token) ?? null;
        delete response.token ?? null;

        res.set('Access-Control-Expose-Headers', 'token');
        res.status(200).header('token', token).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} login() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function updateProfile(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} login()`)

        const response = await userService.updateProfile(req.body)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} login() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} login() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function createTask(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} createTask()`)

        const response = await userService.createTask(req.body, req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} createTask() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} createTask() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function updateTask(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} updateTask()`)

        const response = await userService.updateTask(req.params, req.body, req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} updateTask() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} updateTask() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function deleteTask(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} deleteTask()`)

        const response = await userService.deleteTask(req.params, req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} deleteTask() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} deleteTask() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function statisticsTask(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} statisticsTask()`)

        const response = await userService.statisticsTask(req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} statisticsTask() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} statisticsTask() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function getAllUser(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} getAllUser()`)

        const response = await userService.getAllUser(req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} getAllUser() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} getAllUser() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function updateUserStatus(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} updateUserStatus()`)

        const response = await userService.updateUserStatus(req.params, req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} updateUserStatus() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} updateUserStatus() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function assignmentList(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} assignmentList()`)

        const response = await userService.assignmentList(req.user)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} assignmentList() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} assignmentList() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}

async function fetchUserById(req, res) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_CONTROLLER} assignmentList()`)

        const response = await userService.fetchUserById(req.params.id)

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} assignmentList() ${func.msgCons.WITH_SUCCESS}`)
        res.status(200).json(response);
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_CONTROLLER} assignmentList() ${func.msgCons.WITH_ERROR}`)
        res.status(500).json(error);
    }
}
