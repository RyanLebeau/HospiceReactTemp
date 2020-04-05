/*
====================================================================
This sets the model for a created survey by mongoose

"Name of Survey, SurveyQuestions, CreatedBy, ModifiedBy, timestamp"
====================================================================
*/


const mongoose = require('mongoose');

const surveySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    surveyJSON: {
        type: String,
        default: ""
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Survey', surveySchema);