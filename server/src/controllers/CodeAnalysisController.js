const { GoogleGenerativeAI } = require('@google/generative-ai');
const Repository = require('../models/Repository');

class CodeAnalysisController {
    constructor(repositoryService, chunkerService, vectorStoreRepository, documentationService) {
        this.repositoryService = repositoryService;
        this.chunkerService = chunkerService;
        this.vectorStoreRepository = vectorStoreRepository;
        this.documentationService = documentationService;
    }

    async processRepository(req, res) {
        let repoPath = null;
        try {
            const { repoUrl, title } = req.body;
            const userId = req.user.userId;
            
            if (!repoUrl || !title) {
                return res.status(400).json({ error: 'Repository URL and title are required' });
            }

            let repository = await Repository.findOne({ user: userId, title });
            if (repository) {
                return res.status(400).json({ error: 'Repository with this title already exists' });
            }

            repository = new Repository({
                title,
                repoUrl,
                user: userId
            });

            repoPath = await this.repositoryService.cloneRepository(repoUrl);
            const files = await this.repositoryService.getAllFiles(repoPath);
            const allChunks = [];

            for (const file of files) {
                const chunks = await this.chunkerService.chunkCode(file.path, file.content);
                allChunks.push(...chunks);
            }

            const documentation = await this.documentationService.generateDocumentation(allChunks);
            repository.documentation = documentation;
            await repository.save();
            
            await this.vectorStoreRepository.addChunks(allChunks, repository._id);

            res.json({ 
                status: 'success', 
                repositoryId: repository._id,
                documentation,
                totalFiles: files.length,
                totalChunks: allChunks.length
            });
        } catch (error) {
            console.log("erroris ",error);
            res.status(500).json({ 
                error: 'Error processing repository', 
                message: error.message 
            });
        } finally {
            if (repoPath) {
                await this.repositoryService.cleanup(repoPath);
            }
        }
    }

    async answerQuestion(req, res) {
        try {
            const { question, repositoryTitle } = req.body;
            const userId = req.user.userId;
            
            if (!question || !repositoryTitle) {
                return res.status(400).json({ error: 'Question and repository title are required' });
            }

            const repository = await Repository.findOne({ user: userId, title: repositoryTitle });
            if (!repository) {
                return res.status(404).json({ error: 'Repository not found' });
            }

            const relevantChunks = await this.vectorStoreRepository.findSimilarChunks(question, repository._id);
            const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
                .getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `
            Based on the following code sections, please answer this question: "${question}"

            Relevant code sections:
            ${relevantChunks.map(chunk => `
            File: ${chunk.metadata.location}
            Type: ${chunk.metadata.type}
            Name: ${chunk.metadata.name}
            
            Code:
            ${chunk.content}
            `).join('\n\n')}
            `;

            const result = await model.generateContent(prompt);
            res.json({ answer: result.response.text() });
        } catch (error) {
            res.status(500).json({ 
                error: 'Error answering question', 
                message: error.message 
            });
        }
    }

    async getRepositoryDocs(req, res) {
        try {
            const { repositoryTitle } = req.params;
            const userId = req.user.userId;

            const repository = await Repository.findOne({ user: userId, title: repositoryTitle });
            if (!repository) {
                return res.status(404).json({ error: 'Repository not found' });
            }

            res.json({
                documentation: repository.documentation
            });
        } catch (error) {
            res.status(500).json({
                error: 'Error fetching documentation',
                message: error.message
            });
        }
    }
}
module.exports = CodeAnalysisController