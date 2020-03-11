const proxy = require('http-proxy-middleware');
const dotenv = require('dotenv');
const result = dotenv.config({ path: './config.env' });

if (result.error) {
    throw result.error;
}

module.exports = function(app) {
    app.use(proxy(process.env.REACT_APP_API_PROXY, { target: process.env.REACT_APP_API_PROTOCOL + '://' + process.env.REACT_APP_API_HOSTNAME +':'+ process.env.REACT_APP_API_PORT +'/' }));
};