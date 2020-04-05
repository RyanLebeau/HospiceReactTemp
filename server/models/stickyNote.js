/*
===========================================================
This sets the model for a sticky note created by mongoose

"Patient's ID, Level of Sticky, Message, Open?, CreatedBy,
ModifiedBy, timestamp"
===========================================================
*/


const mongoose = require('mongoose');

const stickyNotesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    level: { 
        type: String,
        enum: ["Info", "Warning", "Danger"],
        required: true,
    },
    message: {
        type: String, 
        required: true,
        unique: true
    },
    open: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    }
},
{
    timestamps: true
});

module.exports = mongoose.model('StickyNote', stickyNotesSchema);