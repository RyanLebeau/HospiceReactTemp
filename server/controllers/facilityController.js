/*
==============================================
Facility Controller
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
const Facility = require("../models/facility");
const config = require("../config/config");
const logger = require("../config/logging");
const log = logger.facilities;

// ====================================================
// Create a new Facility
// ====================================================

exports.create = (req, res, next) => 
{
    const facility = new Facility({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        prefix: req.body.prefix
    });

    facility.save()
    .then(newFacility => {
        return res.status(201).json({
            facility: newFacility,
            request: { 
                type: 'GET',
                url: 'http://localhost:3000/api/facilities/' + newFacility._id
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
    const id = req.params.facilityID;

    log.info("Incoming read for Facility with id " + id);

    Facility.findById(id)
    .exec()
    .then(facility => {
        if(facility)
        {
            res.status(200).json({
                facility: facility,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/facilities/' + facility._id
                }
            });
        }
        else
        {
            res.status(404).json({
                message: "Facility not found."
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

    Facility.find()
    .exec()
    .then(facilities => {
        const response = {
            count: facilities.length,
            facilities: facilities.map(facility => {
                return {
                    _id: facility._id,
                    name: facility.name,
                    prefix: facility.prefix,
                    createdAt: facility.createdAt,
                    updatedAt: facility.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/facilities/' + facility._id
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

    Facility.find(query)
    .exec()
    .then(facilities => {
        const response = {
            count: facilities.length,
            facilities: facilities.map(facility => {
                return {
                    _id: facility._id,
                    name: facility.name,
                    prefix: facility.prefix,
                    createdAt: facility.createdAt,
                    updatedAt: facility.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/facilities/' + facility._id
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
    const id = req.params.facilityID;
    const query = req.body;

    log.info("Incoming update query");
    log.info(query);

    Facility.findById(id, (error, facility) => {
        if(error)
        {
            log.error(error.message);

            return res.status(404).json({
                message: error.message
            });
        }

        facility.set(query);
        facility.save(function(saveError, updatedFacility) {
            if(saveError)
            {
                log.error(saveError.message);

                return res.status(500).json({
                    message: saveError.message
                });
            }

            log.info("Facility with id " + id + " updated");

            return res.status(200).json({
                facility: updatedFacility,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/facilities/' + updatedFacility._id
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
    const id = req.params.facilityID;

    Facility.findByIdAndDelete(id)
    .exec()
    .then(result => {
        if(result)
        {
            log.info("Facility with id " + id + " deleted");

            res.status(200).json({
                message: "Facility deleted"
            });
        }
        else
        {
            log.warn("Unable to delete Facility with id " + id);

            res.status(401).json({
                message: "Unable to delete Facility"
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