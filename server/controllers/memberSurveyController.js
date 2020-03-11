/*
==============================================
MemberSurvey Controller
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
const MemberSurvey = require("../models/memberSurvey");
const config = require("../config/config");
const logger = require("../config/logging");
const log = logger.memberSurvey;

// ====================================================
// Create a new MemberSurvey
// ====================================================
exports.create = (req, res, next) => 
{
    const memberSurvey = new MemberSurvey({
        _id: new mongoose.Types.ObjectId(),
        patientId: req.body.patientId,
        name: req.body.name,
        surveyJSON: req.body.surveyJSON,
        responseJSON: req.body.responseJSON,
        approved: req.body.approved,
        approvedBy: req.body.approvedBy,
        approvedByName: req.body.approvedByName,
        createdBy: req.body.createdBy,
        createdByName: req.body.createdByName,
        modifiedBy: req.body.modifiedBy,
        modifiedByName: req.body.modifiedByName
    });

    memberSurvey.save()
    .then(newMemberSurvey => {
        return res.status(201).json({
            memberSurvey: newMemberSurvey,
            request: { 
                type: 'GET',
                url: 'http://localhost:3000/api/membersurveys/' + newMemberSurvey._id
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
    const id = req.params.memberSurveyID;

    log.info("Incoming read for MemberSurvey with id " + id);

    MemberSurvey.findById(id)
    .exec()
    .then(memberSurvey => {
        if(memberSurvey)
        {
            res.status(200).json({
                memberSurvey: memberSurvey,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/membersurveys/' + memberSurvey._id
                }
            });
        }
        else
        {
            res.status(404).json({
                message: "MemberSurvey not found."
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

    MemberSurvey.find()
    .exec()
    .then(memberSurveys => {
        const response = {
            count: memberSurveys.length,
            memberSurveys: memberSurveys.map(memberSurvey => {
                return {
                    _id: memberSurvey._id,
                    patientId: memberSurvey.patientId,
                    name: memberSurvey.name,
                    surveyJSON: memberSurvey.surveyJSON,
                    responseJSON: memberSurvey.responseJSON,
                    approved: memberSurvey.approved,
                    approvedBy: memberSurvey.approvedBy,
                    createdBy: memberSurvey.createdBy,
                    modifiedBy: memberSurvey.modifiedBy,
                    createdAt: memberSurvey.createdAt,
                    updatedAt: memberSurvey.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/membersurveys/' + memberSurvey._id
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

    MemberSurvey.find(query)
    .exec()
    .then(memberSurveys => {
        const response = {
            count: memberSurveys.length,
            memberSurveys: memberSurveys.map(memberSurvey => {
                return {
                    _id: memberSurvey._id,
                    patientId: memberSurvey.patientId,
                    name: memberSurvey.name,
                    surveyJSON: memberSurvey.surveyJSON,
                    responseJSON: memberSurvey.responseJSON,
                    approved: memberSurvey.approved,
                    approvedBy: memberSurvey.approvedBy,
                    createdBy: memberSurvey.createdBy,
                    modifiedBy: memberSurvey.modifiedBy,
                    createdAt: memberSurvey.createdAt,
                    updatedAt: memberSurvey.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/membersurveys/' + memberSurvey._id
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
    const id = req.params.memberSurveyID;
    const query = req.body;

    log.info("Incoming update query");
    log.info(query);

    MemberSurvey.findById(id, (error, memberSurvey) => 
    {
        if(error)
        {
            log.error(error.message);

            return res.status(404).json({
                message: error.message
            });
        }

        memberSurvey.set(query);
        memberSurvey.save((saveError, updatedSurvey) => 
        {
            if(saveError)
            {
                log.error(saveError.message);

                return res.status(500).json({
                    message: saveError.message
                });
            }

            log.info("MemberSurvey with id " + id + " updated");

            return res.status(200).json({
                memberSurvey: updatedSurvey,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/membersurveys/' + updatedSurvey._id
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
    const id = req.params.memberSurveyID;

    MemberSurvey.findByIdAndDelete(id)
    .exec()
    .then(result => {
        if(result)
        {
            log.info("MemberSurvey with id " + id + " deleted");

            res.status(200).json({
                message: "MemberSurvey deleted"
            });
        }
        else
        {
            log.warn("Unable to delete MemberSurvey with id " + id);

            res.status(401).json({
                message: "Unable to delete MemberSurvey"
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