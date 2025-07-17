const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['task-assigned', 'task-submitted', 'document-updated', 'new-message'],
        required: true,
    },
    taskId: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
    },
    documentId: {
        type: Schema.Types.ObjectId,
        ref: 'Document',
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);