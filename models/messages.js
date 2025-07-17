const mongoose = require("mongoose");
const { required } = require("nodemon/lib/config");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: [true, "What is the update?"],
        trim: true,
    },
    taskId: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
    },
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

messageSchema.index({ taskId: 1, timestamp: -1 });
messageSchema.index({ documentId: 1, timestamp: -1 });

module.exports = mongoose.model('Message', messageSchema);