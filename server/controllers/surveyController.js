/*
==============================================
Survey Controller
----------------------------------------------
Methods:
- Create
- Read
- Readall
- Query
- Update
- Delete
==============================================
*/

const mongoose = require("mongoose");
const Survey = require("../models/survey");
const config = require("../config/config");
const logger = require("../config/logging");
const log = logger.survey;

// ====================================================
// Create a new Survey
// ====================================================

exports.create = (req, res, next) => 
{
    const survey = new Survey({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        surveyJSON: req.body.surveyJSON,
        createdBy: req.body.createdBy,
        modifiedBy: req.body.modifiedBy
    });

    survey.save()
    .then(newSurvey => {
        return res.status(201).json({
            survey: newSurvey,
            request: { 
                type: 'GET',
                url: 'http://localhost:3000/api/surveys/' + newSurvey._id
            }
        });           
    })
    .catch(error => {
        log.error(error.message);

        return res.status(500).json({
            message: error.message
        });
    });
};

// ====================================================
// Read
// ====================================================
exports.read = (req, res, next) => 
{
    const id = req.params.surveyID;

    log.info("Incoming read for Survey with id " + id);

    Survey.findById(id)
    .exec()
    .then(survey => {
        if(survey)
        {
            res.status(200).json({
                survey: survey,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/surveys/' + survey._id
                }
            });
        }
        else
        {
            res.status(404).json({
                message: "Survey not found."
            });
        }
    })
    .catch(error => {
        log.error(error.message);

        return res.status(500).json({
            message: error.message
        });
    });
};

// ====================================================
// Readall
// ====================================================
exports.readall = (req, res, next) => 
{
    log.info("Incoming readall request");

    Survey.find()
    .exec()
    .then(surveys => {
        const response = {
            count: surveys.length,
            surveys: surveys.map(survey => {
                return {
                    _id: survey._id,
                    name: survey.name,
                    surveyJSON: survey.surveyJSON,
                    createdBy: survey.createdBy,
                    modifiedBy: survey.modifiedBy,
                    createdAt: survey.createdAt,
                    updatedAt: survey.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/surveys/' + survey._id
                    }
                }
            })
        }

        res.status(200).json({response});
    })
    .catch(error => {
        log.error(error.message);

        return res.status(500).json({
            message: error.message
        });
    });
};

// ====================================================
// Query
// ====================================================
exports.query = (req, res, next) => 
{
    const query = req.body;

    log.info("Incoming query");
    log.info(query);

    Survey.find(query)
    .exec()
    .then(surveys => {
        const response = {
            count: surveys.length,
            surveys: surveys.map(survey => {
                return {
                    _id: survey._id,
                    name: survey.name,
                    surveyJSON: survey.surveyJSON,
                    createdBy: survey.createdBy,
                    modifiedBy: survey.modifiedBy,
                    createdAt: survey.createdAt,
                    updatedAt: survey.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/surveys/' + survey._id
                    }
                }
            })
        }

        res.status(200).json({response});
    })
    .catch(error => {
        log.error(error.message);

        return res.status(500).json({
            message: error.message
        });
    });
}

// ====================================================
// Update
// ====================================================
exports.update = (req, res, next) => 
{
    const id = req.params.surveyID;
    const query = req.body;

    log.info("Incoming update query");
    log.info(query);

    Survey.findById(id, (error, survey) => {
        if(error)
        {
            log.error(error.message);

            return res.status(404).json({
                message: error.message
            });
        }

        survey.set(query);
        survey.save(function(saveError, updatedSurvey) {
            if(saveError)
            {
                log.error(saveError.message);

                return res.status(500).json({
                    message: saveError.message
                });
            }

            log.info("Survey with id " + id + " updated");

            return res.status(200).json({
                survey: updatedSurvey,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/surveys/' + updatedSurvey._id
                }
            })
        });
    });
};

// ====================================================
// Delete
// ====================================================
exports.delete = (req, res, next) => 
{
    const id = req.params.surveyID;

    Survey.findByIdAndDelete(id)
    .exec()
    .then(result => {
        if(result)
        {
            log.info("Survey with id " + id + " deleted");

            res.status(200).json({
                message: "Survey deleted"
            });
        }
        else
        {
            log.warn("Unable to delete Survey with id " + id);

            res.status(401).json({
                message: "Unable to delete Survey"
            });
        }
    })
    .catch(error => {
        log.error(error.message);

        return res.status(500).json({
            message: error.message
        });
    });
};