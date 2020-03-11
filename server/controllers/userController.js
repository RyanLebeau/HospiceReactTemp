/*
==============================================
User Controller
----------------------------------------------
Standard Methods:
- Check
- Signup
- Patient Creation
- Login
- Read
- Readall
- Query
- Update
- Delete

Complex Methods:
- Total Reads
==============================================
*/

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const StickyNote = require("../models/stickyNote");
const MemberSurvey = require("../models/memberSurvey");
const Facility = require("../models/facility");
const Address = require("../models/address");
const signToken = require("../utils/signToken");
const axios = require('axios')
const config = require("../config/config");
const logger = require("../config/logging");
const log = logger.users;

// ====================================================
// Add Administration User if no Users Exist
// ====================================================
exports.install = (req, res, next) => 
{
    Facility.find()
    .exec()
    .then(facilities => {
        if(facilities.length > 0)
        {
            return res.status(404).json({
                message: "Route not found."
            });
        }
        else
        {
            /* Create Default Facility */
            const facility = new Facility({
                _id: new mongoose.Types.ObjectId(),
                name: config.server.default.facility.name,
                prefix: config.server.default.facility.prefix
            });
        
            facility.save()
            .then(newFacility => {
                /* Create Default User */
                bcrypt.hash(config.server.default.admin.password, 10, (hashError, hash) => 
                {
                    if (hashError) 
                    {
                        log.error("There was an error hashing a signup password")

                        return res.status(401).json({
                            message: hashError
                        });
                    }

                    /* User Object */
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: config.server.default.admin.email,
                        password: hash,
                        enabled: true,
                        role: 'Admin',
                        facilityId: newFacility._id,
                        info: {
                            name: config.server.default.admin.name
                        }
                    });

                    /* Save User */
                    user.save()
                    .then(newUser => {
                        if(newUser)
                        {
                            log.info("Administration User Set");
                            return res.status(201).json({
                                _id: newUser._id,
                                request: { 
                                    type: 'GET',
                                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + newUser._id
                                }
                            });
                        }
                        else
                        {
                            return res.status(401).json({
                                message: "Email or password is invalid."
                            });
                        }
                    })
                    .catch(error => {
                        log.error(error.message);
                
                        return res.status(500).json({
                            message: error.message
                        });
                    })
                });   
            })
            .catch(error => {
                log.error(error.message);
        
                return res.status(500).json({
                    message: error.message
                });
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
// Check if User is authenticated
// ====================================================
exports.check = (req, res, next) => 
{
    return res.status(200).json({
        message: "Token Valid"
    });
};

// ====================================================
// Create a new user
// ----------------------------------------------------
// Input:
// - Email
// - Password
// ====================================================
exports.signup = (req, res, next) => 
{
    const email = req.body.email;
    const password = req.body.password;
    const enabled = req.body.enabled;
    const role = req.body.role;
    const facility = req.body.facilityId;
    const name = req.body.info.name;
    const phone = req.body.info.phone;
    const _address = {
        street: req.body.info.address.street,
        city: req.body.info.address.city,
        state: req.body.info.address.state,
        code: req.body.info.address.code,
        country: req.body.info.address.country
    }

    const address = new Address({
        _id: new mongoose.Types.ObjectId(),
        street: _address.street,
        city: _address.city,
        state: _address.state,
        code: _address.code,
        country: _address.country
    })

    address.save()
    .then(newAddress => {
        User.find({ email: email })
        .exec()
        .then(emailQuery => {
            if(emailQuery.length == 0)
            {
                bcrypt.hash(password, 10, (hashError, hash) => 
                {
                    if (hashError) 
                    {
                        log.error("There was an error hashing a signup password")

                        return res.status(401).json({
                            message: hashError
                        });
                    }

                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: email,
                        password: hash,
                        enabled: enabled,
                        role: role,
                        facilityId: facility,
                        research: {
                            full: ""
                        },
                        info: {
                            name: name,
                            phone: phone,
                            currentAddress: newAddress._id
                        }
                    });

                    user.save()
                    .then(newUser => {
                        if(newUser)
                        {
                            log.info("New user for email " + newUser.email + " created");

                            return res.status(201).json({
                                _id: newUser._id,
                                request: { 
                                    type: 'GET',
                                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + newUser._id
                                }
                            });
                        }
                        else
                        {
                            return res.status(401).json({
                                message: "Email or password is invalid."
                            });
                        }
                    })
                    .catch(error => {
                        log.error(error.message);
                
                        return res.status(500).json({
                            message: error.message
                        });
                    })
                });
            }
            else
            {
                log.warn("Email " + email + " already exists in the database");

                return res.status(401).json({
                    message: "The email " + email + " is already in use."
                });
            }
        })
        .catch(error => {
            log.error(error.message);

            return res.status(500).json({
                message: error.message
            });
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
// Login
// ----------------------------------------------------
// The main authorization is handled by Passport, so
// just generate a JWT!
// ====================================================
exports.login = (req, res, next) => 
{
    if(req.user == null)
    {
        log.warn("User was not part of the request.  Unauthorized.");

        return res.status(401).json({
            message: "Unauthorized"
        }); 
    }

    try 
    {
        if(req.user.enabled)
        {
            const token = signToken(req.user);

            log.info("User " + req.user.email + " succesful authenticated.");
    
            return res.status(200).json({
                message: "Authorized",
                user: req.user,
                token: token
            }); 
        }
        else
        {
            log.warn("User " + req.user.email + " account disabled.  Unauthorized.");

            return res.status(401).json({
                message: "Account disabled"
            });
        }
    } 
    catch (error) 
    {
        log.error("Unable to sign token: " + error.message);

        return res.status(500).json({
            message: "Unable to sign token"
        });
    }
};

exports.WECClogin = (req, res, next) =>
{
    log.info('Accessing WECC login server.  Authenticating ......');

    let _token = req.body.token;
    let token = _token.split(' ')[1];
    let url = 'https://weccc.dev/api/users/validatetoken';

    let email = req.body.email;

    axios({
        method: 'post',        
        url: url,
        headers: { 
            'Content-Type': 'application/json'
        },
        data: {
            token: token
        },
        timeout: 5000
    })
    .then(response => {
        if(response.status === 200 || response.status === 304)
        {
            log.info('Token verified VIA WECC API for ' + email);

            return User.findOne({ email: email })
            .select('-password')
            .populate('facilityId', '_id name enabled prefix')
            .exec()
            .then(user => {
                if(user)
                {
                    const __token = signToken(user);
                    log.info("User " + email + " succesful authenticated.");
                    
                    return res.status(200).json({
                        message: "Authorized",
                        user: user,
                        token: __token
                    });
                }
                else
                {
                    log.warn("Email not found for WECC: " + email);

                    return res.status(401).json({
                        message: "Unauthorized"
                    });
                }
                
            })
            .catch(error => {
                log.error("Unable to sign in via WECC: " + error.message);
        
                return res.status(500).json({
                    message: "Unable to sign in via WECC."
                });
            });
        }
        else
        {
            log.warn('Token unverified VIA WECC API for ' + email);

            return res.status(401).json({
                message: "Unauthorized"
            });
        }
    })
    .catch(error => {
        log.error("Unable to sign in via WECC: " + error.message);

        return res.status(500).json({
            message: "Unable to sign in via WECC."
        });
    });
}

// ====================================================
// Read
// ====================================================
exports.read = (req, res, next) => 
{
    const id = req.params.userID;

    log.info("Incoming read for user with id " + id);

    User.findById(id)
    .select('-password')
    .exec()
    .then(user => {
        if(user)
        {
            res.status(200).json({
                user: user,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + user._id
                }
            });
        }
        else
        {
            res.status(404).json({
                error: "User not found."
            });
        }
    })
    .catch(error => {
        log.error(error.message);

        res.status(500).json({
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
    
    User.find()
    .exec()
    .then(users => {
        const response = {
            count: users.length,
            users: users.map(user => {
                return {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    patients: user.patients,
                    workers: user.workers,
                    enabled: user.enabled,
                    info: user.info,
                    research: user.research,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + user._id
                    }
                }
            })
        }

        res.status(200).json({response});
    })
    .catch(error => {
        log.error(error.message);

        res.status(500).json({
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

    User.find(query)
    .exec()
    .then(users => {
        const response = {
            count: users.length,
            users: users.map(user => {
                return {
                    _id: user._id,
                    email: user.email,
                    role: user.role,
                    enabled: user.enabled,
                    info: user.info,
                    research: user.research,
                    patients: user.patients,
                    workers: user.workers,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + user._id
                    }
                }
            })
        }
        
        res.status(200).json({response});
    })
    .catch(error => {
        log.error(error.message);

        res.status(500).json({
            message: error.message
        });
    });
};

// ====================================================
// Update
// ====================================================
exports.update = (req, res, next) => 
{
    const id = req.params.userID;
    const query = req.body;

    log.info("Incoming update query");
    log.info(query);

    User.findById(id, (error, user) => 
    {
        if(error)
        {
            log.error(error.message);

            return res.status(404).json({
                message: error.message
            });
        }

        user.set(query);
        user.save((saveError, updatedUser) =>
        {
            if(saveError)
            {
                log.error(saveError.message);

                return res.status(500).json({
                    message: saveError.message
                });
            }

            log.info("User with id " + id + " updated");

            return res.status(200).json({
                user: updatedUser,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + updatedUser._id
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
    const id = req.params.userID;

    User.findByIdAndDelete(id)
    .exec()
    .then(result => {
        if(result)
        {
            log.info("User with id " + id + " deleted");

            res.status(200).json({
                message: "User deleted"
            });
        }
        else
        {
            log.warn("Unable to delete user with id " + id);

            res.status(401).json({
                message: "Unable to delete user"
            });
        }
    })
    .catch(error => {
        log.error(error.message);

        res.status(500).json({
            message: error.message
        });
    });
};

// ====================================================
// Full Read (Retrieves 1 extra Layer)
// ----------------------------------------------------
// This read will retrieve additional information
// 1 extra layer deep, retrieving anything with a 
// mongoID in the user document.
// ====================================================
exports.fullread = (req, res, next) => 
{
    const id = req.params.userID;

    log.info("Incoming layer read (1) for user with id " + id);

    User.findById(id)
    .select('-password')
    .populate('info.currentAddress', '_id street city state code country createdAt updatedAt')
    .populate('patients', '_id email role info research enabled facilityId patients workers createdAt updatedAt')
    .populate('workers', '_id email role info research enabled facilityId patients workers createdAt updatedAt')
    .exec()
    .then(user => {
        if(user)
        {
            if(user.role === "Patient")
            {
                return StickyNote.find({ patientId: user._id })
                .populate('createdBy', '_id info.name')
                .populate('modifiedBy', '_id info.name')
                .exec()
                .then(stickyNotes =>{
                    return MemberSurvey.find({ patientId: user._id })
                    .exec()
                    .then(memberSurveys =>{
                        res.status(200).json({
                            user: user,
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
                            }),
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
                            }),
                            request: { 
                                type: 'GET',
                                url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + user._id
                            }
                        });
                    })
                    .catch(error => {
                        log.error(error.message);
                
                        res.status(500).json({
                            message: error.message
                        });
                    });
                })
                .catch(error => {
                    log.error(error.message);
            
                    res.status(500).json({
                        message: error.message
                    });
                });
            }
            else
            {
                res.status(200).json({
                    user: user,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + user._id
                    }
                });
            }
        }
        else
        {
            res.status(404).json({
                error: "User not found."
            });
        }
    })
    .catch(error => {
        log.error(error.message);

        res.status(500).json({
            message: error.message
        });
    });
};

// ====================================================
// Research ID Controllers
// ----------------------------------------------------
// 1) Create Research ID
// 2) Check Research ID 
// 3) Enable / Disable
// ====================================================
exports.createResearchID = (req, res, next) => 
{
    const id = req.params.userID;

    log.info("Incoming research creation for user with ID " + id);

    User.findById(id)
    .select('_id info email role info research enabled facilityId patients workers createdAt updatedAt')
    .populate('facilityId', '_id name prefix')
    .exec()
    .then(user => {
        if(user)
        {
            if(user.research.full === "" || user.research.full === undefined || user.research.full === null)
            {
                let _now = Date.now();

                var research = {
                    research: {
                        full: user.facilityId.prefix + "-" + _now,
                        prefix: user.facilityId.prefix,
                        u_no: _now
                    }
                }

                user.set(research);
                user.save()
                .then(updatedUser => {
                    log.info("User with id " + id + " updated.  New research ID: " + user.facilityId.prefix + "-" + _now);

                    return res.status(200).json({
                        user: updatedUser,
                        request: { 
                            type: 'GET',
                            url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/users/' + updatedUser._id
                        }
                    })
                })
                .catch(error => {
                    log.error(error.message);
            
                    res.status(500).json({
                        message: error.message
                    });
                });
            }
            else
            {
                log.warn("User with ID " + id + " already has a Research ID.");

                res.status(401).json({
                    message: "This user already has a Research ID."
                });
            }
        }
        else
        {
            res.status(404).json({
                message: "User not found."
            });
        }
    })
    .catch(error => {
        log.error(error.message);

        res.status(500).json({
            message: error.message
        });
    });
};