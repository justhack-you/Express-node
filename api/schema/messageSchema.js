const { body } = require('express-validator');

const sendMessage = [
    body('receiver')
        .notEmpty().withMessage('receiver is required')
        .isMongoId().withMessage('receiver must be a valid MongoDB ObjectId'),

    body('content')
        .notEmpty().withMessage('content is required')
        .isString().withMessage('content must be a string')
        .isLength({ min: 1, max: 200 }).withMessage('content must be between 1 and 200 characters'),
];

module.exports = {
    sendMessage
}