/*
==============================================
StickyNote Controller
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
const StickyNote = require("../models/stickyNote");
const config = require("../config/config");
const logger = require("../config/logging");
const log = logger.stickynote;

// ====================================================
// Create a new StickyNote
// ====================================================
exports.create = (req, res, next) => 
{
    const stickyNote = new StickyNote({
        _id: new mongoose.Types.ObjectId(),
        patientId: req.body.patientId,
        level: req.body.level,
        message: req.body.message,
        open: req.body.open,
        createdBy: req.body.createdBy,
        modifiedBy: req.body.modifiedBy
    });

    stickyNote.save()
    .then(newStickyNote => {
        return res.status(201).json({
            stickyNote: newStickyNote,
            request: { 
                type: 'GET',
                url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/stickynotes/' + newStickyNote._id
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
    const id = req.params.sitckNoteID;

    log.info("Incoming read for StickyNote with id " + id);

    StickyNote.findById(id)
    .exec()
    .then(stickyNote => {
        if(stickyNote)
        {
            res.status(200).json({
                stickyNote: stickyNote,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/stickynotes/' + stickyNote._id
                }
            });
        }
        else
        {
            res.status(404).json({
                message: "StickyNote not found."
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

    StickyNote.find()
    .exec()
    .then(stickyNotes => {
        const response = {
            count: stickyNotes.length,
            stickyNotes: stickyNotes.map(stickyNote => {
                return {
                    _id: stickyNote._id,
                    patientId: stickyNote.patientId,
                    level: stickyNote.level,
                    message: stickyNote.message,
                    open: stickyNote.open,
                    createdBy: stickyNote.createdBy,
                    modifiedBy: stickyNote.modifiedBy,
                    createdAt: stickyNote.createdAt,
                    updatedAt: stickyNote.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/stickynotes/' + stickyNote._id
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

    StickyNote.find(query)
    .exec()
    .then(stickyNotes => {
        const response = {
            count: stickyNotes.length,
            stickyNotes: stickyNotes.map(stickyNote => {
                return {
                    _id: stickyNote._id,
                    patientId: stickyNote.patientId,
                    level: stickyNote.level,
                    message: stickyNote.message,
                    open: stickyNote.open,
                    createdBy: stickyNote.createdBy,
                    modifiedBy: stickyNote.modifiedBy,
                    createdAt: stickyNote.createdAt,
                    updatedAt: stickyNote.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/stickynotes/' + stickyNote._id
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
    const id = req.params.stickyNoteID;
    const query = req.body;

    log.info("Incoming update query");
    log.info(query);

    StickyNote.findById(id, (error, stickyNote) => {
        if(error)
        {
            log.error(error.message);

            return res.status(404).json({
                message: error.message
            });
        }

        stickyNote.set(query);
        stickyNote.save(function(saveError, updatedStickyNote) {
            if(saveError)
            {
                log.error(saveError.message);

                return res.status(500).json({
                    message: saveError.message
                });
            }

            log.info("StickyNote with id " + id + " updated");

            return res.status(200).json({
                stickyNote: updatedStickyNote,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/stickynotes/' + updatedStickyNote._id
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
    const id = req.params.stickyNoteID;

    StickyNote.findByIdAndDelete(id)
    .exec()
    .then(result => {
        if(result)
        {
            log.info("StickyNote with id " + id + " deleted");

            res.status(200).json({
                message: "StickyNote deleted"
            });
        }
        else
        {
            log.warn("Unable to delete StickyNote with id " + id);

            res.status(401).json({
                message: "Unable to delete StickyNote"
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