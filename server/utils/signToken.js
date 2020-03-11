const jwt = require("jsonwebtoken");
const config = require("../config/config");
const logger = require("../config/logging");
const log = logger.jwt;

module.exports = (user) => 
{
    var timeSinceEpoch = new Date().getTime();
    var expirationTime = timeSinceEpoch + (config.server.tokenExpireTime * 1000);
    var expirationTimeInSeconds = Math.floor(expirationTime / 1000);
    
    log.info("Signing Token for: " + user._id + ". Current Time: " + timeSinceEpoch);
    log.info("Signing Token for: " + user._id + ". Expiration Time: " + expirationTime);
    log.info("Signing Token for: " + user._id + ". Expiration Time in Seconds: " + expirationTimeInSeconds);

    const token = jwt.sign(
        {
            iss: config.server.tokenIssuer,
            sub: user._id,
            iat: timeSinceEpoch,
            exp: expirationTimeInSeconds,
        },
        config.server.tokenKey
    );

    return token;
}