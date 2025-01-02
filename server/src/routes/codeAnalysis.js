const express = require('express');
const router = express.Router();

module.exports = (controller) => {
    router.post('/process-repository', (req, res) => controller.processRepository(req, res));
    router.post('/ask', (req, res) => controller.answerQuestion(req, res));
    router.get('/repository/:repositoryTitle/docs', (req, res) => controller.getRepositoryDocs(req, res));
    router.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    return router;
};