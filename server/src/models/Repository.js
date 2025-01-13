const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    repoUrl: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentation: {
        overview: String,
        architecture: String,
        components: [{
            name: { type: String },
            type: { type: String },
            documentation: { type: String }
        }]
    },
    vectorEmbeddings: [{
        document: String,
        embedding: [Number],
        metadata: {
            type: { type: String },
            name: { type: String },
            location: { type: String }
        }
    }],
    conversationEmbeddings: [{
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation'
        },
        messageContent: String,
        embedding: [Number],
        timestamp: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Add these indexes to Repository.js
repositorySchema.index({ user: 1, createdAt: -1 });
repositorySchema.index({ user: 1, title: 1 });
repositorySchema.index({ title: 1, user: 1 }, { unique: true });
module.exports = mongoose.model('Repository', repositorySchema);