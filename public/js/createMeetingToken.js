const jwt = require('jsonwebtoken');
const config = require('./config');

const payload = {
    iss: config.APIKey,
    exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(payload, config.APISecret);

module.exports = token;
