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
    documentation : {
        overview: String,
        architecture : String,
        components: [{
            name : String,
            type : String,
            documentation : String
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

repositorySchema.index({ title: 1, user: 1 }, { unique: true });
module.exports = mongoose.model('Repository', repositorySchema);