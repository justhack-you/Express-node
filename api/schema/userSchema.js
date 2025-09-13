const { body } = require('express-validator');

const userRegistrationSchema = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('skills')
        .isArray({ min: 1, max: 5 }).withMessage('Skills must be an array with 1 to 5 items')
        .custom((arr) => arr.every(skill => typeof skill === 'string')).withMessage('Each skill must be a string')
]

const userLoginSchema = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
]
module.exports = { userRegistrationSchema, userLoginSchema }