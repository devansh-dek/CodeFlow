const mongoose = require('mongoose');
const fileChangeSchema = new mongoose.Schema({
    filename: String,
    oldPath: String,
    newPath: String,
    type: {
        type: String,
        enum: ['add', 'modify', 'delete', 'rename'],
        required: true
    },
    hunks: [{
        oldStart: Number,
        oldLines: Number,
        newStart: Number,
        newLines: Number,
        content: String,
        changes: [{
            type: {
                type: String,
                enum: ['add', 'delete', 'context'],
                required: true
            },
            lineNumber: {
                old: Number,
                new: Number
            },
            content: String
        }]
    }],
    stats: {
        additions: Number,
        deletions: Number,
        changes: Number
    }
})
const commitSchema = new mongoose.Schema({
    repositoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repository',
        required: true
    },
    sha: {
        type: String,
        required: true,
        index: true
    },
    parentSha: String,
    message: String,
    author: {
        name: String,
        email: String,
        date: Date
    },
    stats: {
        totalFiles: Number,
        additions: Number,
        deletions: Number,
        changes: Number
    },
    files: [fileChangeSchema],
    documentation: {
        overview: String,
        architecture: String,
        impact: String
    }
});
module.exports = mongoose.model('Commit',commitSchema);
