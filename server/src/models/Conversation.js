const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    repositoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        relevantChunks: [{
            content: String,
            metadata: {
                location: String,
                type: String,
                name: String
            }
        }]
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Conversation', conversationSchema);