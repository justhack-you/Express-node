const express = require('express');
const router = express.Router();
const Constroller = require('../api/controllers/controller');
const { auth, adminAuth } = require('../api/schema/auth');
const schemas = require('../api/schema/validateSchema');
const func = require('../config/utility-functions');

// task management
router.post('/register', func.validateRequest(schemas.userSchema.userRegistrationSchema), Constroller.userController.register)
router.post('/login', func.validateRequest(schemas.userSchema.userLoginSchema), Constroller.userController.login)
router.get('/user/detail/:id', auth, Constroller.userController.fetchUserById)

router.put('/profile', Constroller.userController.updateProfile)
router.post('/tasks', auth, Constroller.userController.createTask)
router.post('/tasks/:id', auth, Constroller.userController.updateTask)
router.delete('/tasks/delete/:id', auth, Constroller.userController.deleteTask)
router.get('/stats/overview', auth, Constroller.userController.statisticsTask)
router.get('/', auth, Constroller.userController.getAllUser)
router.get('/:id/status', auth, Constroller.userController.updateUserStatus)
router.get('/list/for/assignment', auth, Constroller.userController.assignmentList)

// message
router.post('/message', auth, func.validateRequest(schemas.messageSchema.sendMessage), Constroller.messageController.sendMessage)
router.get('/message/:id', auth, Constroller.messageController.getMessage)
router.get('/user/feed/:id', auth, Constroller.messageController.getAllUsers)
// router.get('/message/conversation/:id', auth, Constroller.messageController.getConversation)
router.post('/subscribe', auth, Constroller.messageController.userSubscription)

module.exports = router;