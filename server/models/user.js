/*
=====================================================
This sets the model for each user by mongoose

"Facility They Belong To, Enabled?, Email, Password,
Their Role, Personal Info, Research Type, timestamp"
=====================================================
*/

const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    facilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: true
    },
    enabled: {
        type: Boolean,
        required: true
    },
    email: { 
        type: String,         
        unique: true,
        required: function() {
            return this.role != "Patient";
        }
    },
    password: { 
        type: String
    },
    role: {
        type: String,
        enum: ["Admin", "Coordinator", "Worker", "Patient", "Unknown"],
        required: true,        
    },
    patients: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
    },
    workers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    info: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
        },
        currentAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address'
        },
        pastAddresses: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Address'
        }
    },
    research: {
        full : {
            type: String
        },
        prefix: {
            type: String
        },
        u_no: {
            type: Number
        },
        enabled: {
            type: Boolean,
            default: false
        }
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);