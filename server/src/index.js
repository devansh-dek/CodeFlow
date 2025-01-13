//Agnish bruh came here :)

require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// Import services and repositories
const VectorStoreRepository = require('./repositories/VectorStoreRepository');
const CodeChunkerService = require('./services/CodeChunkerService');
const DocumentationService = require('./services/DocumentationService');
const RepositoryService = require('./services/RepositoryService');
const CodeAnalysisController = require('./controllers/CodeAnalysisController.js');
const CommitController = require('./controllers/CommitController.js');
const codeAnalysisRoutes = require('./routes/codeAnalysis');
const commitRoutes = require('./routes/commits.js');
const authRoutes = require('./routes/auth.js');
const authMiddleware = require('./middleware/auth.js')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fs = require('fs/promises');
const CommitService = require('./services/commitService.js');

// Validate environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.log("entire env is ",process.env)
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}
// if (process.env.NODE_ENV === 'development') {
    // mongoose.set('debug', true);
// }


// using mongoose instead
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
const app = express();
app.use(express.json({ limit: '500mb' }));
app.use(cookieParser()); 

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));


// Initialize services and repositories
const TEMP_DIR = path.join(__dirname, 'temp');
const vectorStoreRepository = new VectorStoreRepository();
const codeChunkerService = new CodeChunkerService();
const documentationService = new DocumentationService();
const repositoryService = new RepositoryService(TEMP_DIR);
const commitService = new CommitService();
// Initialize controller
const codeAnalysisController = new CodeAnalysisController(
    repositoryService,
    codeChunkerService,
    vectorStoreRepository,
    documentationService,
    commitService
);
const commitController = new CommitController(
    commitService
);
// import GitHubPRService from './services/githubService.js';
const GitHubPRService = require('./services/githubService.js')
app.use('/api', require('./routes/github')(new GitHubPRService(TEMP_DIR)));

// Setup routes
app.use('/api/auth', authRoutes);

app.use('/api', authMiddleware,codeAnalysisRoutes(codeAnalysisController));
app.use('/api/repo/',authMiddleware,commitRoutes(commitController));
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown handling
async function cleanup() {
    try {
        await fs.rm(TEMP_DIR, { recursive: true, force: true }).catch(() => {});
        console.log('Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Closing HTTP server...');
    server.close(async () => {
        await cleanup();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received. Closing HTTP server...');
    server.close(async () => {
        await cleanup();
        process.exit(0);
    });
});

module.exports = app;



