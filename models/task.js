const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'Please input task title']
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Tell us what this task is'],
    },
    status: {
        type: String,
        required: true,
        enum: ["Assigned", "Pending", "Completed"],
        default: 'Assigned'
    },
    assignedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document'
    },
    submissionNote: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
},
{timestamps: true});

taskSchema.index ({ taskId: 1})
taskSchema.index ({ assignedUsers: 1})
taskSchema.index ({ status: 1})

taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Task', taskSchema);