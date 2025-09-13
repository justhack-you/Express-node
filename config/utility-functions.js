const { validationResult } = require('express-validator');


module.exports = {
    validateRequest: function (schema) {
        return [
            ...schema,
            (req, res, next) => {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    res.send(this.responseGenerator('The request fulfilled successfully', 'VALIDATION_MSG_CODE_400', true, errors.array()));
                } else {
                    next();
                }
            }
        ]
    },
    responseGenerator: function (msg, code, isError, data) {
        const responseJson = {};
        responseJson['error_status'] = (isError) ? true : false;
        responseJson['code'] = (code) ? code : 'REPO_200';
        responseJson['message'] = (msg) ? msg : 'The request fulfilled successfully';
        if (data && data.length !== 0) responseJson['data'] = data;
        return responseJson;
    }
}