const { GoogleGenerativeAI } = require('@google/generative-ai');
const Repository = require('../models/Repository');
const Conversation = require('../models/Conversation');

class CodeAnalysisController {
    constructor(repositoryService, chunkerService, vectorStoreRepository, documentationService) {
        this.repositoryService = repositoryService;
        this.chunkerService = chunkerService;
        this.vectorStoreRepository = vectorStoreRepository;
        this.documentationService = documentationService;
        this.model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        .getGenerativeModel({model : 'gemini-pro'});
    }
    
    constructPrompt(question, context, repository) {
        const systemContext = repository.documentation?.overview 
            ? `Project Overview:\n${repository.documentation.overview}\n`
            : 'You are analyzing a software project. ';

        const codeContext = context.codeContext.length > 0 
            ? `\n=== RELEVANT CODE SECTIONS ===\n${context.codeContext.map(chunk => `
                === File: ${chunk.metadata.location} ===
                ${chunk.content}
            `).join('\n\n')}`
            : '\nNo specific code sections were found highly relevant to this question.';

        const conversationContext = context.conversationContext.length > 0
            ? `\n=== RELEVANT PAST CONVERSATIONS ===\n${context.conversationContext.map(conv => conv.content).join('\n\n')}`
            : '';

        const instructions = `
Please analyze the above context and provide a focused answer to the following question. 
If the question cannot be answered from the provided context, explicitly state what information is missing. 
Base your answer only on the information available in the context and visible code patterns.
        
Question: "${question}"

Remember:
- Only make statements that are supported by the provided context
- If something isn't clear from the context, acknowledge the uncertainty
- Focus on the specific question asked`;

        return `${systemContext}${codeContext}${conversationContext}${instructions}`;
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
            const { question, repositoryTitle,conversationId } = req.body;
            const userId = req.user.userId;
            
            if (!question || !repositoryTitle) {
                return res.status(400).json({ error: 'Question and repository title are required' });
            }

            const repository = await Repository.findOne({ user: userId, title: repositoryTitle });
            if (!repository) {
                return res.status(404).json({ error: 'Repository not found' });
            }
            let conversation = conversationId ? await Conversation.findById(conversationId) : new Conversation({repositoryId : repository._id, userId : userId , messages :[]});
            const context = await this.vectorStoreRepository.findRelevantContext(question,repository._id,conversation._id);
            const prompt  = this.constructPrompt(question,context,repository);
            console.log(prompt , "is our promt");
            const result = await this.model.generateContent(prompt);
            const answer = result.response.text();
            conversation.messages.push(
                {role:'user', content : question},
                {role : 'assistant', content : answer}
            )
            await conversation.save();
            await this.vectorStoreRepository.addConversationEmbedding(
                conversation,
                repository._id
            );

            res.json({
                answer,
                conversationId: conversation._id,
                relevantContext: {
                    codeSnippets: context.codeContext.length,
                    conversations: context.conversationContext.length
                }
            });  
            
        } catch (error) {
            console.log("error is ",error);
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