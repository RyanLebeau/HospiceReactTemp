const config = require("./config");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const logger = require("./logging");
const log = logger.passport;

const User = require("../models/user");

passport.use('Local', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ email: email })
    .populate('facilityId', '_id name enabled prefix')
    .exec()
    .then(user => {
        if(user)
        {
            bcrypt.compare(password, user.password, (error, result) => 
            {
                if(error)
                {
                    log.warn("Bad login attempt for " + email);
                    done(error, false);
                }
                else
                {
                    if(result)
                    {
                        log.info("Login attempt for " + email + " succesful, generating token ...");
                        done(null, user);
                    }
                    else
                    {
                        log.warn("Unsuccesful login attempt for " + email);
                        done(null, false);
                    }
                }
            });
        }
        else
        {
            log.warn("Bad login attempt for " + email);
            done(null, false);
        }
    })
    .catch(error => {
        log.error("Error authenticating " + email + " through local strategy: " + error.message);
        done(error, false);
    })
}));

passport.use('JwtToken', new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.server.tokenKey
}, (payload, done) => {
    User.findById(payload.sub)
    .exec()
    .then(user => {
        if(user)
        {
            log.info("Token for ID: " + payload.sub + " is valid.");
            return done(null, user);
        }
        else
        {
            log.warn("Token for ID: " + payload.sub + " is invalid.");
            return done(null, false);
        }
    })
    .catch(error => {
        log.error("Token for ID: " + payload.sub + " resulted in an error.");
        return done(error, false)
    })
}));