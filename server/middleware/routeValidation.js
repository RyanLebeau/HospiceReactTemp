const Joi = require('joi');

module.exports = {
    validateBody: (schema) => {
        return (req, res, next) => {
            const result = Joi.validate(req.body, schema);

            if(result.error)
            {
                console.log(result.error)
                return res.status(400).json({
                    message: result.error
                });
            }
           
            next();
        }
    },
    schemas: {
        address: {
            create: Joi.object().keys({
                street: Joi.string().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                code: Joi.string().required(),
                country: Joi.string().required()
            })
        },
        auth: {
            register: Joi.object().keys({
                email: Joi.string().email().required(),
                password: Joi.string().required(),
                enabled: Joi.bool().required(),
                role: Joi.string().required(),
                facilityId: Joi.string().required(),
                info: Joi.object().keys({
                    name: Joi.string().required(),
                    phone: Joi.string().allow(''),
                    address: Joi.object().keys({
                        street: Joi.string().required(),
                        city: Joi.string().required(),
                        state: Joi.string().required(),
                        code: Joi.string().required(),
                        country: Joi.string().required()
                    })
                    
                })
            }),
            login: Joi.object().keys({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            })
        },
        facility: {
            create: Joi.object().keys({
                name: Joi.string().required(),
                prefix: Joi.string().required()
            })
        },
        memberSurvey: {
            create: Joi.object().keys({
                name: Joi.string().required(),
                patientId: Joi.string().required(),
                surveyJSON: Joi.string().required(),
                responseJSON: Joi.string().allow(''),
                approved: Joi.boolean().required(),
                approvedBy: Joi.string().allow(''),
                createdBy: Joi.string().required(),
                modifiedBy: Joi.string().required()
            })
        },
        stickyNote: {
            create: Joi.object().keys({
                patientId: Joi.string().required(),
                level: Joi.string().required(),
                message: Joi.string().required(),
                open: Joi.boolean().required(),
                createdBy: Joi.string().required(),
                modifiedBy: Joi.string().required()
            })
        },
        survey: {
            create: Joi.object().keys({
                name: Joi.string().required(),
                surveyJSON: Joi.string().allow(''),
                createdBy: Joi.string().required(),
                modifiedBy: Joi.string().required(),
            })
        }
    }
};