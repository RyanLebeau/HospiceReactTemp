/*
==============================================
Address Controller
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
const Address = require("../models/address");
const config = require("../config/config");
const logger = require("../config/logging");
const log = logger.address;

// ====================================================
// Create a new Address
// ====================================================

exports.create = (req, res, next) => 
{
    const address = new Address({
        _id: new mongoose.Types.ObjectId(),
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        code: req.body.code,
        country: req.body.country
    });

    address.save()
    .then(newAddress => {
        return res.status(201).json({
            address: newAddress,
            request: { 
                type: 'GET',
                url: 'http://localhost:3000/api/addresses/' + newAddress._id
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
    const id = req.params.addressID;

    log.info("Incoming read for Address with id " + id);

    Address.findById(id)
    .exec()
    .then(address => {
        if(address)
        {
            res.status(200).json({
                address: address,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/addresses/' + address._id
                }
            });
        }
        else
        {
            res.status(404).json({
                message: "Address not found."
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

    Address.find()
    .exec()
    .then(addresses => {
        const response = {
            count: addresses.length,
            addresses: addresses.map(address => {
                return {
                    _id: address._id,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    code: address.code,
                    country: address.country,
                    createdAt: address.createdAt,
                    updatedAt: address.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/addresses/' + address._id
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

    Address.find(query)
    .exec()
    .then(addresses => {
        const response = {
            count: addresses.length,
            addresses: addresses.map(address => {
                return {
                    _id: address._id,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    code: address.code,
                    country: address.country,
                    createdAt: address.createdAt,
                    updatedAt: address.updatedAt,
                    request: { 
                        type: 'GET',
                        url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/addresses/' + address._id
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
    const id = req.params.addressID;
    const query = req.body;

    log.info("Incoming update query");
    log.info(query);

    Address.findById(id, (error, address) => {
        if(error)
        {
            log.error(error.message);

            return res.status(404).json({
                message: error.message
            });
        }

        address.set(query);
        address.save(function(saveError, updatedAddress) {
            if(saveError)
            {
                log.error(saveError.message);

                return res.status(500).json({
                    message: saveError.message
                });
            }

            log.info("Address with id " + id + " updated");

            return res.status(200).json({
                address: updatedAddress,
                request: { 
                    type: 'GET',
                    url: config.server.protocol + '://' + config.server.hostname +':' + config.server.port + config.server.extension + '/addresses/' + updatedAddress._id
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
    const id = req.params.addressID;

    Address.findByIdAndDelete(id)
    .exec()
    .then(result => {
        if(result)
        {
            log.info("Address with id " + id + " deleted");

            res.status(200).json({
                message: "Address deleted"
            });
        }
        else
        {
            log.warn("Unable to delete Address with id " + id);

            res.status(401).json({
                message: "Unable to delete Address"
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