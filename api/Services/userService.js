
const func = require('../../utilities/utility-functions');
const User = require('../models/user');
const Task = require('../models/task');

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
    assignmentList
}


async function register(body) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} register()`)

        console.log(body);
        const { username, email, password, skills } = body;
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return { code: 'Already_Match_Found', message: existingUser.email === email ? 'Email already registered' : 'Username already taken' };
        }
        const user = new User({ username, email, password, skills });
        await user.save();

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} register() ${func.msgCons.WITH_SUCCESS}`);
        return {
            status: 200, message: 'User registered successfully', user: {
                id: user._id, username: user.username, email: user.email, role: user.role
            }
        };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} register() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { status: 500, message: 'Internal server error' }
    }
}

async function login(reqBody) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} login()`)
        const { email, password } = reqBody;

        // Find user
        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return { code: 'VALID_CREDENTIALS_204', message: 'Invalid credentials' };
        }
        const isMatch = await user.checkPassword(password);
        if (!isMatch) {
            return { code: 'VALID_CREDENTIALS_204', message: 'Invalid credentials' };
        }

        user.lastLogin = new Date();
        await user.save();

        const token = await user.getJwtToken();

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} login() ${func.msgCons.WITH_SUCCESS}`);
        return {
            code: 'VALID_CREDENTIALS_200',
            message: 'Login successful',
            user: {
                id: user._id, username: user.username, email: user.email, role: user.role, lastLogin: user.lastLogin, avatar: user.profile.avatar
            },
            token
        };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} login() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { status: 500, message: 'Internal server error' }
    }
}

async function updateProfile(reqBody) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} updateProfile()`)

        const { id, avatar } = reqBody;

        const user = await User.findByIdAndUpdate(id, {
            $set: { 'profile.avatar': avatar }
        }, { new: true, runValidators: true });

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} updateProfile() ${func.msgCons.WITH_SUCCESS}`);
        return { message: 'Profile updated successfully', user };
    }
    catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} updateProfile() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { status: 500, message: 'Internal server error' }
    }
}

async function createTask(reqBody, reqUser) {
    try {
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} createTask()`);

        const taskValidate = await Task.findOne({ title: reqBody.title })
        if (taskValidate) {
            return { message: 'Title and description are uniques' };
        }

        const task = new Task({
            ...reqBody,
            assignedTo: reqBody.assignedTo || reqUser.id,
            createdBy: reqUser.id
        });

        await task.save();
        await task.populate('assignedTo', 'username email');
        await task.populate('createdBy', 'username email');

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} createTask() ${func.msgCons.WITH_SUCCESS}`);
        return { message: 'Task created successfully', task };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} createTask() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error creating task' };
    }
}

async function createTask(reqBody, reqUser) {
    try {
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} createTask()`);

        const taskValidate = await Task.findOne({ title: reqBody.title })
        if (taskValidate) {
            return { message: 'Title and description are uniques' };
        }

        const task = new Task({
            ...reqBody,
            assignedTo: reqBody.assignedTo || reqUser.id,
            createdBy: reqUser.id
        });

        await task.save();
        await task.populate('assignedTo', 'username email');
        await task.populate('createdBy', 'username email');

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} createTask() ${func.msgCons.WITH_SUCCESS}`);
        return { message: 'Task created successfully', task };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} createTask() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error creating task' };
    }
}

async function updateTask(reqParams, reqBody, reqUser) {
    try {
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} updateTask()`);

        const task = await Task.findById(reqParams.id);

        if (!task) {
            return { message: 'Task not found' };
        }

        if (!task.assignedTo.equals(reqUser._id) && !task.createdBy.equals(reqUser._id)) {
            return { message: 'Access denied' };
        }

        await Task.findByIdAndUpdate(reqParams.id, reqBody, { new: true, runValidators: true })
            .populate('assignedTo', 'username email')
            .populate('createdBy', 'username email');

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} updateTask() ${func.msgCons.WITH_SUCCESS}`);
        return { message: 'Task updated successfully' };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} updateTask() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error creating task' };
    }
}

async function deleteTask(reqParams, reqUser) {
    try {
        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} deleteTask()`);

        const task = await Task.findById(reqParams.id);

        if (!task) {
            return { message: 'Task not found' };
        }

        if (!task.createdBy.equals(reqUser._id)) {
            return { message: 'Only task creator can delete this task' };
        }

        await Task.findByIdAndDelete(reqParams.id);

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} deleteTask() ${func.msgCons.WITH_SUCCESS}`);
        return { message: 'Task deleted successfully' };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} deleteTask() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error creating task' };
    }
}

async function statisticsTask(reqUser) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} statisticsTask()`)
        const stats = await Task.aggregate([
            { $match: { assignedTo: reqUser._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityStats = await Task.aggregate([
            { $match: { assignedTo: reqUser._id } },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        const overdueTasks = await Task.countDocuments({
            assignedTo: reqUser._id,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} statisticsTask() ${func.msgCons.WITH_SUCCESS}`);
        return {
            statusStats: stats,
            priorityStats,
            overdueTasks,
            totalTasks: stats.reduce((sum, stat) => sum + stat.count, 0)
        };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} statisticsTask() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error fetching task statistics' };
    }
}

async function getAllUser(reqQuery) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} getAllUser()`)
        const { page = 1, limit = 10, search } = reqQuery;

        const query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} getAllUser() ${func.msgCons.WITH_SUCCESS}`)
        return {
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} statisticsTask() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error fetching users' };
    }
}


async function updateUserStatus(reqParams, reqBody) {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} updateUserStatus()`)
        const { isActive } = reqBody;

        const user = await User.findByIdAndUpdate(
            reqParams.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return { message: 'User not found' };
        }

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} updateUserStatus() ${func.msgCons.WITH_SUCCESS}`);
        return {
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        };
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} updateUserStatus() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error fetching users' };
    }
}

async function assignmentList() {
    try {
        logger.info(`${func.msgCons.LOG_ENTER} ${func.msgCons.LOG_SERVICE} assignmentList()`);
        const users = await User.find({ isActive: true })
            .select('username email profile.firstName profile.lastName')
            .sort({ username: 1 });

        logger.info(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} assignmentList() ${func.msgCons.WITH_SUCCESS}`);
        return users
    } catch (error) {
        logger.error(`${func.msgCons.LOG_EXIT} ${func.msgCons.LOG_SERVICE} assignmentList() ${func.msgCons.WITH_ERROR} =>`, error);
        throw { message: 'Error fetching assignment list' };
    }
}