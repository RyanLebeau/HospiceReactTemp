const dotenv = require('dotenv');

const result = dotenv.config({ path: './config.env' });

if (result.error) {
    throw result.error;
}

console.log(result.parsed);

const env = process.env.NODE_ENV;

module.exports = {
    server: {
        protocol: process.env.PROTOCOL,
        port: process.env.PORT,
        hostname: process.env.HOSTNAME,
        extension: process.env.EXTENSION,
        tokenKey: process.env.TOKENKEY,
        tokenExpireTime: process.env.TOKENEXPIRETIME,
        tokenIssuer: process.env.TOKENISSUER,
        default: {
            admin: {
                email: process.env.EMAIL || 'admin@admin.com',
                password: process.env.PASSWORD || 'admin',
                name: process.env.NAME || 'Administrator Default Profile'
            },
            facility: {
                name: process.env.FACILITY || 'Palliative IMS Facility',
                prefix: process.env.PREFIX || 'YQG',
            }
        }
    },
    mongoDB : {
        mongoURL : process.env.MONGO_URL,
        port : process.env.MONGO_PORT,
        options : process.env.MONGO_OPTIONS,
        username : process.env.MONGO_USER,
        password : process.env.MONGO_PASS,
    }
}