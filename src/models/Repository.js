const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
    },
    repoUrl : {
        type : String,
        required : true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vectorEmbeddings: [{
        document: String,
        embedding: [Number],
        metadata: {
            type: String,
            name: String,
            location: String
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

repositorySchema.index({ title: 1, user: 1 }, { unique: true });
module.exports = mongoose.model('Repository', repositorySchema);