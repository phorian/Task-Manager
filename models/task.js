const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: [true, 'Please input task title']
    },
    description: {
        type: String,
        required: [true, 'Tell us what this task is'],
    },
    status: {
        type: String,
        required: true,
        enum: ["open", "assigned", "ongoing","submitted", "reviewing", "completed"],
        default: 'open'
    },
    assignee: {

    },
},
{timestamps: true});

module.exports = mongoose.model('Task', taskSchema);