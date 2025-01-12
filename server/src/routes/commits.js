const express = require('express');
const router = express.Router();

module.exports = (controller) => {
    router.get('/repository/:repositoryId/commits', controller.getCommits);
    router.get('/commits/:commitId', controller.getCommitDetail);
    return router;
};