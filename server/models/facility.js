/*
=============================================================
This sets the model for which facility is entered by mongoose

"Name of facility, Prefix"
=============================================================
*/

const mongoose = require('mongoose');

const facilitySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { 
        type: String, 
        required: true,
        unique: true
    },
    prefix: { 
        type: String, 
        required: true,
        unique: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Facility', facilitySchema);