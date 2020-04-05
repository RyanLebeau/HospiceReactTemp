/*
===================================================
This file contorls the logging of each js file
Any module that will need a log or an append from
the console is handled here
===================================================
*/

const log4js = require("log4js");

log4js.configure({
    appenders: {
        console: { type: 'console' },
    },
    categories: {
        main: { appenders: ['console'], level: 'info' },
        jwt: { appenders: ['console'], level: 'info' },
        users: { appenders: ['console'], level: 'info' },
        surveys: { appenders: ['console'], level: 'info' },
        memberSurveys: { appenders: ['console'], level: 'info' },
        facilities: { appenders: ['console'], level: 'info' },
        stickynotes: { appenders: ['console'], level: 'info' },
        addresses: { appenders: ['console'], level: 'info' },
        passport: { appenders: ['console'], level: 'info' },
        default: { appenders: ['console'], level: 'info' }
    }
});

module.exports = {
    main: log4js.getLogger("main"),
    jwt: log4js.getLogger("jwt"),
    users: log4js.getLogger("users"),
    survey: log4js.getLogger("surveys"),
    memberSurvey: log4js.getLogger("memberSurveys"),
    facilities: log4js.getLogger("facilities"),
    stickynote: log4js.getLogger("stickynotes"),
    address: log4js.getLogger("addresses"),
    passport: log4js.getLogger("passport"),
    express: log4js.connectLogger(log4js.getLogger('access'), {level: log4js.levels.INFO})
};