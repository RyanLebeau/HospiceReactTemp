/*
=====================================================
Sets the model for an adress to be logged by mongoose

"Street, City, State, ZIP, Country"
=====================================================
*/

const mongoose = require('mongoose');

const addressSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    street: { 
        type: String
    },
    city: { 
        type: String
    },
    state: { 
        type: String
    },
    code: { 
        type: String
    },
    country: { 
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);