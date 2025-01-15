const { GoogleGenerativeAI } = require('@google/generative-ai');
const Repository = require('../models/Repository');
const Conversation = require('../models/Conversation');
const Commit = require('../models/Commits'); // Add this import

class CodeAnalysisController {
    constructor(repositoryService, chunkerService, vectorStoreRepository, documentationService,commitService) {
        this.repositoryService = repositoryService;   
        this.chunkerService = chunkerService;  
        this.vectorStoreRepository = vectorStoreRepository;  
        this.documentationService = documentationService;  
        this.commitAnalysisService = commitService; 
        this.model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)  
        .getGenerativeModel({model : 'gemini-pro'});
        this.getUserRepositories = this.getUserRepositories.bind(this);

    }
    async getUserRepositories(req, res) {
        try {
            console.time('getUserRepositories');
            const userId = req.user.userId;
            const { page = 1, limit = 10, sort = 'createdAt' } = req.query;
            
            console.log(`Fetching repositories for user: ${userId}, page: ${page}, limit: ${limit}`);
    
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const repositories = await Repository.find(
                { user: userId },
                {
                    title: 1,
                    repoUrl: 1,
                    createdAt: 1,
                    'documentation.overview': 1
                }
            )
            .lean()
            .sort({ [sort]: sort === 'title' ? 1 : -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .exec(); // Add explicit exec()
    
            console.log(`Found ${repositories.length} repositories`);
    
            const total = await Repository.countDocuments({ user: userId });
    
            const repositoryIds = repositories.map(repo => repo._id);
            const commitCounts = await Commit.aggregate([
                {
                    $match: {
                        repositoryId: { $in: repositoryIds }
                    }
                },
                {
                    $group: {
                        _id: '$repositoryId',
                        commitCount: { $sum: 1 }
                    }
                }
            ]).exec(); 
            const commitCountMap = new Map(
                commitCounts.map(item => [item._id.toString(), item.commitCount])
            );
    
            const repositoriesWithStats = repositories.map(repo => ({
                ...repo,
                commitCount: commitCountMap.get(repo._id.toString()) || 0
            }));
    
            console.timeEnd('getUserRepositories');
    
            res.json({
                repositories: repositoriesWithStats,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error fetching user repositories:', error);
            res.status(500).json({ 
                error: 'Failed to fetch repositories',
                message: error.message 
            });
        }
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
            const commits = await this.commitAnalysisService.analyzeAllCommits(repoPath, repository._id);

            await repository.save();
            
            await this.vectorStoreRepository.addChunks(allChunks, repository._id);

            res.json({ 
                status: 'success', 
                repositoryId: repository._id,
                documentation,
                totalFiles: files.length,
                totalChunks: allChunks.length,
                totalCommits: commits.length
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
            const {page =1,limit =10} = req.query;
            const userId = req.user.userId;

            const repository = await Repository.findOne({ user: userId, title: repositoryTitle });
            if (!repository) {
                return res.status(404).json({ error: 'Repository not found' });  
            }
            console.log(repository._id,"is our repository ");
            const commits = await Commit.find(
                {repositoryId : repository._id},
                {documentation: 0} 
            )
            .select('-files -documentation')
            .sort({'author.date': -1})
            .skip((parseInt(page) - 1) * parseInt(limit))
                .limit(parseInt(limit));

                const totalCommits = await Commit.countDocuments({ repositoryId: repository._id });

                res.json({
                    documentation: repository.documentation,
                    commits: {
                        data: commits,
                        pagination: {
                            total: totalCommits,
                            totalPages: Math.ceil(totalCommits / parseInt(limit)),
                            currentPage: parseInt(page),
                            limit: parseInt(limit)
                        }
                    }
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