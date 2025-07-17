const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Enter name of document'],
        trim: true,
        unique: true
    },
    content: {
        type: String,
        required: [true, 'Enter document content']
    },
    taskId: {
        type: Schema.Types.ObjectId,
        ref: 'Task'
    },
    collaborators: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    versionHistory: [{
        content: String,
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    }],
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

documentSchema.index ({ documentId: 1 })
documentSchema.index ({ taskId: 1 })

documentSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next();
});
module.exports = mongoose.model('Document', documentSchema);