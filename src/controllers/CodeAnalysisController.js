const { GoogleGenerativeAI } = require('@google/generative-ai');

class CodeAnalysisController {
    constructor(
        repositoryService,
        chunkerService,
        vectorStoreRepository,
        documentationService
    ) {
        this.repositoryService = repositoryService;
        this.chunkerService = chunkerService;
        this.vectorStoreRepository = vectorStoreRepository;
        this.documentationService = documentationService;
    }

    async processRepository(req, res) {
        let repoPath = null;
        try {
            const { repoUrl } = req.body;
            
            if (!repoUrl) {
                return res.status(400).json({ error: 'Repository URL is required' });
            }

            if (!repoUrl.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)) {
                return res.status(400).json({ error: 'Invalid repository URL' });
            }

            repoPath = await this.repositoryService.cloneRepository(repoUrl);
            const files = await this.repositoryService.getAllFiles(repoPath);
            const allChunks = [];

            for (const file of files) {
                const chunks = await this.chunkerService.chunkCode(file.path, file.content);
                allChunks.push(...chunks);
            }

            await this.vectorStoreRepository.addChunks(allChunks);

            res.json({ 
                status: 'success', 
                message: 'Repository processed successfully',
                totalFiles: files.length,
                totalChunks: allChunks.length
            });
        } catch (error) {
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

    async generateDocumentation(req, res) {
        let repoPath = null;
        try {
            console.log("CAME HERE ")
            const { repoUrl } = req.body;
            
            if (!repoUrl) {
                return res.status(400).json({ error: 'Repository URL is required' });
            }

            if (!repoUrl.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)) {
                return res.status(400).json({ error: 'Invalid repository URL' });
            }

            repoPath = await this.repositoryService.cloneRepository(repoUrl);
            const files = await this.repositoryService.getAllFiles(repoPath);
            const allChunks = [];
            console.log("CAME HERE 2")
            for (const file of files) {
                const chunks = await this.chunkerService.chunkCode(file.path, file.content);
                allChunks.push(...chunks);
            }
            console.log("CAME HERE 3")
            const documentation = await this.documentationService.generateDocumentation(allChunks);
            await this.vectorStoreRepository.addChunks(allChunks);

            res.json({ 
                status: 'success',
                documentation,
                totalFiles: files.length,
                totalChunks: allChunks.length
            });
        } catch (error) {
            console.log("FINALLY error ",error)
            res.status(500).json({ 
                error: 'Error generating documentation', 
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
            const { question } = req.body;
            
            if (!question) {
                return res.status(400).json({ error: 'Question is required' });
            }

            if (question.length > 1000) {
                return res.status(400).json({ error: 'Question is too long (max 1000 characters)' });
            }

            const relevantChunks = await this.vectorStoreRepository.findSimilarChunks(question);
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
}

module.exports = CodeAnalysisController