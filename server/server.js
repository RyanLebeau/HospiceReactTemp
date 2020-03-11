/*
==============================================
Hospice API Server
Saman Arif
December 14, 2018
==============================================
Dependencies:
- Express
- Mongoose
- Morgan (Replacing with Log4js soon)
- Body-Parser
- Mongoose

Contributers:
- Saman (Joey The Lantern)
- Tong Li
==============================================
*/

// ============================================
// Route Requirements
// ============================================
const express = require("express");
const passport = require('passport');
const app = express();
const bodyParser = require("body-parser");
const logger = require("./config/logging");
const log = logger.main;
const mongoose = require("mongoose");
const http = require('http');
const config = require('./config/config');

const userRoutes = require("./routes/userRoutes");
const surveyRoutes = require('./routes/surveyRoutes');
const memberSurveyRoutes = require('./routes/memberSurveyRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const stickyNoteRoutes = require('./routes/stickyNoteRoutes');
const addressRoutes = require('./routes/addressRoutes');

// ============================================
// Mongoose Setup
// ============================================
mongoose.connect(
    "mongodb+srv://" + config.mongoDB.username + ":" + config.mongoDB.password + "@" + config.mongoDB.mongoURL + "/" + config.mongoDB.options,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

app.use(passport.initialize());
app.use(logger.express);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ============================================
// API Request Setup
// ============================================
app.use((req, res, next) => 
{
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method == "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }

    next();
});

// ============================================
// API Routes
// ============================================
app.use("/api/users", userRoutes);
app.use("/api/surveys", surveyRoutes);
app.use("/api/membersurveys", memberSurveyRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/stickynotes", stickyNoteRoutes);
app.use("/api/addresses", addressRoutes);

// ============================================
// Error Routes
// ============================================
app.use((req, res, next) => 
{
    const error = new Error("Not found");
    log.warn(error);
    error.status = 404;

    next(error);
});

app.use((error, req, res, next) => 
{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const server = http.createServer(app);
server.listen(process.env.PORT);