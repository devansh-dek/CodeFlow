const express = require('express');
const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const simpleGit = require('simple-git');
const fs = require('fs/promises');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const dotenv = require('dotenv');

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['GEMINI_API_KEY', 'PORT'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const app = express();
app.use(express.json({ limit: '50mb' })); // Increased limit for large code files

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });

// Constants
const COLLECTION_NAME = 'code-chunks';
const TEMP_DIR = path.join(__dirname, 'temp');
const CHUNK_TYPES = {
    FUNCTION: 'function',
    CLASS: 'class',
    METHOD: 'method',
    FILE: 'file'
};

// Utility functions
const sanitizeId = (id) => id.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 64);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
class SimpleVectorStore {
    constructor() {
        this.documents = [];
        this.embeddings = [];
        this.metadatas = [];
    }

    async addChunks(chunks) {
        if (!chunks.length) return;

        try {
            // Process chunks in batches to avoid rate limiting
            const BATCH_SIZE = 10;
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + BATCH_SIZE);
                const embeddings = await Promise.all(
                    batchChunks.map(chunk => this.generateEmbedding(chunk.content))
                );

                // Store the chunks and their embeddings
                for (let j = 0; j < batchChunks.length; j++) {
                    const chunk = batchChunks[j];
                    this.documents.push(chunk.content);
                    this.embeddings.push(embeddings[j]);
                    this.metadatas.push({
                        type: chunk.type,
                        name: chunk.name,
                        location: chunk.location
                    });
                }

                // Add delay between batches to avoid rate limiting
                if (i + BATCH_SIZE < chunks.length) {
                    await sleep(1000);
                }
            }
        } catch (error) {
            console.error('Error adding chunks to vector store:', error);
            throw new Error('Failed to add chunks to vector store');
        }
    }

    async generateEmbedding(text) {
        try {
            const truncatedText = text.substring(0, 5000);
            const result = await embeddingModel.embedContent(truncatedText);
            return result.embedding.values;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error('Failed to generate embedding');
        }
    }

    async findSimilarChunks(question, limit = 5) {
        try {
            const questionEmbedding = await this.generateEmbedding(question);
            
            // Calculate cosine similarity between question and all stored embeddings
            const similarities = this.embeddings.map(embedding => 
                this.cosineSimilarity(questionEmbedding, embedding)
            );

            // Get indices of top K similar documents
            const topIndices = this.getTopKIndices(similarities, limit);

            // Return the similar documents with their metadata
            return topIndices.map(index => ({
                content: this.documents[index],
                metadata: this.metadatas[index]
            }));
        } catch (error) {
            console.error('Error finding similar chunks:', error);
            throw new Error('Failed to find similar chunks');
        }
    }

    cosineSimilarity(vector1, vector2) {
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitude1 * magnitude2);
    }

    getTopKIndices(arr, k) {
        return arr
            .map((value, index) => ({ value, index }))
            .sort((a, b) => b.value - a.value)
            .slice(0, k)
            .map(item => item.index);
    }

    clear() {
        this.documents = [];
        this.embeddings = [];
        this.metadatas = [];
    }
}
class CodeChunker {
    constructor() {
        this.chunks = [];
    }

    async chunkCode(filePath, content) {
        // Skip binary files and files that are too large
        if (this.isBinaryFile(content) || content.length > 1000000) {
            return [];
        }

        const ext = path.extname(filePath).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
            return this.chunkJavaScript(filePath, content);
        }
        return this.chunkGeneric(filePath, content);
    }

    isBinaryFile(content) {
        // Simple check for binary content
        return Buffer.from(content).slice(0, 24).toString().includes('\u0000');
    }

    async chunkJavaScript(filePath, content) {
        try {
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript'],
                errorRecovery: true // Continue parsing even if there are errors
            });

            const chunks = [];
            let currentClass = null;

            traverse(ast, {
                FunctionDeclaration(path) {
                    if (path.node.id && path.node.id.name) {
                        chunks.push({
                            type: CHUNK_TYPES.FUNCTION,
                            name: path.node.id.name,
                            content: content.slice(path.node.start, path.node.end),
                            location: filePath
                        });
                    }
                },
                ClassDeclaration(path) {
                    if (path.node.id && path.node.id.name) {
                        currentClass = path.node.id.name;
                        chunks.push({
                            type: CHUNK_TYPES.CLASS,
                            name: currentClass,
                            content: content.slice(path.node.start, path.node.end),
                            location: filePath
                        });
                    }
                },
                ClassMethod(path) {
                    if (path.node.key && path.node.key.name) {
                        chunks.push({
                            type: CHUNK_TYPES.METHOD,
                            name: `${currentClass}.${path.node.key.name}`,
                            content: content.slice(path.node.start, path.node.end),
                            location: filePath
                        });
                    }
                }
            });

            return chunks;
        } catch (error) {
            console.warn(`Warning: Error parsing JavaScript file ${filePath}:`, error.message);
            return this.chunkGeneric(filePath, content);
        }
    }

    chunkGeneric(filePath, content) {
        const chunks = [];
        const lines = content.split('\n');
        let currentChunk = '';
        let currentSize = 0;
        const MAX_CHUNK_SIZE = 1000;

        for (const line of lines) {
            if (currentSize + line.length > MAX_CHUNK_SIZE && currentChunk) {
                chunks.push({
                    type: CHUNK_TYPES.FILE,
                    name: `${path.basename(filePath)}-chunk-${chunks.length + 1}`,
                    content: currentChunk.trim(),
                    location: filePath
                });
                currentChunk = line;
                currentSize = line.length;
            } else {
                currentChunk += (currentChunk ? '\n' : '') + line;
                currentSize += line.length + 1;
            }
        }

        if (currentChunk.trim()) {
            chunks.push({
                type: CHUNK_TYPES.FILE,
                name: `${path.basename(filePath)}-chunk-${chunks.length + 1}`,
                content: currentChunk.trim(),
                location: filePath
            });
        }

        return chunks;
    }
}
function generateUniqueId(chunk, index) {
    const base = sanitizeId(`${chunk.location}-${chunk.type}-${chunk.name}`);
    return `${base}-${index}`; // Add index to ensure uniqueness
}
class VectorStore {
    constructor() {
        this.collection = null;
        this.initialized = false;
        this.processedIds = new Set(); // Track processed IDs
    }

    async addChunks(chunks) {
        if (!chunks.length) return;

        try {
            console.log("ENRED ADD CHUNKS")
            // Process chunks in batches to avoid rate limiting
            const BATCH_SIZE = 10;
            let processedCount = 0;

            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + BATCH_SIZE);
                const embeddings = await Promise.all(
                    batchChunks.map(chunk => this.generateEmbedding(chunk.content))
                );

                const documents = batchChunks.map(chunk => chunk.content);
                const metadatas = batchChunks.map(chunk => ({
                    type: chunk.type,
                    name: chunk.name,
                    location: chunk.location
                }));
                console.log("BATCH CHUNKS ARE ",batchChunks);


                // Generate unique IDs using the index
                const ids = batchChunks.map((chunk, idx) => {
                    const id = generateUniqueId(chunk, processedCount + idx);
                    if (this.processedIds.has(id)) {
                        throw new Error(`Duplicate ID generated: ${id}`);
                    }
                    this.processedIds.add(id);
                    return id;
                });

                processedCount += batchChunks.length;
                console.log("HERE 2")

                // Convert embeddings to the correct format
                const processedEmbeddings = embeddings.map(embedding => {
                    if (Array.isArray(embedding)) {
                        return embedding.map(Number);
                    } else if (embedding && typeof embedding === 'object') {
                        return Object.values(embedding).map(Number);
                    } else {
                        throw new Error('Invalid embedding format');
                    }
                });
                console.log("HERE 3")
                console.log("Sending data to Chroma:", {
                    ids,
                    embeddings: processedEmbeddings,
                    documents,
                    metadatas
                });
                
                await this.collection.add({
                    ids,
                    embeddings: processedEmbeddings,
                    documents,
                    metadatas
                });

                // Add delay between batches to avoid rate limiting
                if (i + BATCH_SIZE < chunks.length) {
                    await sleep(1000);
                }
            }
        } catch (error) {
            console.error('Error adding chunks to vector store:', error);
            throw new Error('Failed to add chunks to vector store');
        }
    }

    async initialize() {
        if (this.initialized) return;

        try {
            this.collection = await chroma.getOrCreateCollection({
                name: COLLECTION_NAME
            });
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing vector store:', error);
            throw new Error('Failed to initialize vector store');
        }
    }



    async generateEmbedding(text) {
        try {
            // Truncate text if it's too long
            const truncatedText = text.substring(0, 5000);
            const result = await embeddingModel.embedContent(truncatedText);
            
            // Extract the values array from the embedding result
            const embedding = result.embedding;
            if (!embedding || !Array.isArray(embedding.values)) {
                throw new Error('Invalid embedding format received from API');
            }
            
            // Return the values array directly
            return embedding.values;
        } catch (error) {
            console.error('Error generating embedding:', error);
            throw new Error('Failed to generate embedding');
        }
    }

    async findSimilarChunks(question, limit = 5) {
        try {
            const questionEmbedding = await this.generateEmbedding(question);
            
            const results = await this.collection.query({
                queryEmbeddings: [questionEmbedding],
                nResults: limit
            });

            return results.documents[0].map((doc, i) => ({
                content: doc,
                metadata: results.metadatas[0][i]
            }));
        } catch (error) {
            console.error('Error finding similar chunks:', error);
            throw new Error('Failed to find similar chunks');
        }
    }
}
class DocumentationGenerator {
    constructor(qaSystem) {
        this.qaSystem = qaSystem;
        this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
    }

    async generateDocumentation(chunks) {
        try {
            const documentation = {
                overview: await this.generateOverview(chunks),
                architecture: await this.generateArchitectureDiagram(chunks),
                components: await this.generateComponentDocs(chunks),
            };

            return documentation;
        } catch (error) {
            console.error('Error generating documentation:', error);
            throw new Error('Failed to generate documentation');
        }
    }

    async generateOverview(chunks) {
        const prompt = `Analyze these code chunks and provide a comprehensive overview of the project:
            ${this.formatChunksForPrompt(chunks)}
            
            Include:
            1. Project purpose and main features
            2. Technologies used
            3. High-level architecture
            4. Key components and their responsibilities`;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    async generateArchitectureDiagram(chunks) {
        const prompt = `Based on these code chunks, generate a Mermaid.js flowchart diagram showing the system architecture:
            ${this.formatChunksForPrompt(chunks)}
            
            Include:
            1. Main components and their relationships
            2. Data flow
            3. External services
            4. Key processes
            
            Respond only with the Mermaid.js diagram code.`;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    async generateComponentDocs(chunks) {
        const componentChunks = chunks.filter(chunk => 
            chunk.type === CHUNK_TYPES.CLASS || 
            chunk.type === CHUNK_TYPES.FUNCTION
        );

        const docs = await Promise.all(componentChunks.map(async chunk => {
            const prompt = `Generate detailed documentation for this code:
                ${chunk.content}
                
                Include:
                1. Purpose and responsibility
                2. Parameters and return values
                3. Dependencies
                4. Usage examples
                5. Important methods/properties`;

            const result = await this.model.generateContent(prompt);
            return {
                name: chunk.name,
                type: chunk.type,
                documentation: result.response.text()
            };
        }));

        return docs;
    }

    formatChunksForPrompt(chunks) {
        return chunks.slice(0, 10).map(chunk => `
            File: ${chunk.metadata?.location || 'N/A'}
            Type: ${chunk.type}
            Name: ${chunk.name}
            
            Code:
            ${chunk.content}
        `).join('\n\n');
    }
}

class CodeQASystem {
    constructor() {
        this.chunker = new CodeChunker();
        this.documentationGenerator = new DocumentationGenerator(this);
        this.initialized = false;
        this.vectorStore = new SimpleVectorStore();  // Use new implementation

    }

    async initialize() {
        // console.log("ENTER INITALIZED")
        // if (this.initialized) return;
        // await this.vectorStore.initialize();
        // this.initialized = true;
        // console.log("INITIALIZED CORRECTLY")
    }

    async processRepository(repoUrl) {
        let repoPath = null;
        try {
            console.log("ENTERED PROCESS REPO")
                console.log("THE REPOURL IS ",repoUrl)
            repoPath = await this.cloneRepository(repoUrl);
            console.log("REPO PATH IS ",repoPath)
            const files = await this.getAllFiles(repoPath);
            console.log("FILE AR E",files);
            const allChunks = [];

            for (const file of files) {
                const chunks = await this.chunker.chunkCode(file.path, file.content);
                allChunks.push(...chunks);
            }
            console.log("ALL CHUNKS ARE ",allChunks);
            await this.vectorStore.addChunks(allChunks);
            return { 
                status: 'success', 
                message: 'Repository processed successfully',
                totalFiles: files.length,
                totalChunks: allChunks.length
            };
        } catch (error) {
            console.error('Error processing repository:', error);
            throw new Error(`Failed to process repository: ${error.message}`);
        } finally {
            if (repoPath) {
                await this.cleanup(repoPath);
            }
        }
    }

    async generateDocumentation(repoUrl) {
        let repoPath = null;
        try {
            repoPath = await this.cloneRepository(repoUrl);
            const files = await this.getAllFiles(repoPath);
            const allChunks = [];

            for (const file of files) {
                const chunks = await this.chunker.chunkCode(file.path, file.content);
                allChunks.push(...chunks);
            }

            return await this.documentationGenerator.generateDocumentation(allChunks);
        } finally {
            if (repoPath) {
                await this.cleanup(repoPath);
            }
        }
    }

    async answerQuestion(question) {
        try {
            const relevantChunks = await this.vectorStore.findSimilarChunks(question);
            
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
            return result.response.text();
        } catch (error) {
            console.error('Error answering question:', error);
            throw new Error('Failed to answer question');
        }
    }

    async cloneRepository(repoUrl) {
        try {
            const repoName = sanitizeId(repoUrl.split('/').pop().replace('.git', ''));
            const repoPath = path.join(TEMP_DIR, repoName);
            
            await fs.mkdir(TEMP_DIR, { recursive: true });
            await simpleGit().clone(repoUrl, repoPath);
            
            return repoPath;
        } catch (error) {
            console.error('Error cloning repository:', error);
            throw new Error('Failed to clone repository');
        }
    }

    async getAllFiles(dirPath) {
        const files = [];
        
        async function traverse(currentPath) {
            const entries = await fs.readdir(currentPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                
                if (entry.isDirectory()) {
                    if (!entry.name.startsWith('.') && 
                        !entry.name.includes('node_modules') && 
                        !entry.name.includes('dist') &&
                        !entry.name.includes('build')) {
                        await traverse(fullPath);
                    }
                } else {
                    try {
                        const content = await fs.readFile(fullPath, 'utf-8');
                        files.push({ path: fullPath, content });
                    } catch (error) {
                        console.warn(`Warning: Could not read file ${fullPath}:`, error.message);
                    }
                }
            }
        }
        
        await traverse(dirPath);
        return files;
    }

    async cleanup(repoPath) {
        try {
            await fs.rm(repoPath, { recursive: true, force: true });
        } catch (error) {
            console.warn('Warning: Error during cleanup:', error);
        }
    }
}

// Initialize the QA system
const qaSystem = new CodeQASystem();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Endpoints
app.post('/process-repository', async (req, res) => {
    try {
        const { repoUrl } = req.body;
        
        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }

        if (!repoUrl.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)) {
            return res.status(400).json({ error: 'Invalid repository URL' });
        }

        await qaSystem.initialize();
        console.log("INITALIZED CORRECTLY BRUH")
        const result = await qaSystem.processRepository(repoUrl);
        res.json(result);
    } catch (error) {
        console.error('Error processing repository:', error);
        res.status(500).json({ 
            error: 'Error processing repository', 
            message: error.message 
        });
    }
});

app.post('/generate-documentation', async (req, res) => {
    try {
        const { repoUrl } = req.body;
        
        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }

        if (!repoUrl.match(/^https?:\/\/[^\s/$.?#].[^\s]*$/i)) {
            return res.status(400).json({ error: 'Invalid repository URL' });
        }

        await qaSystem.initialize();
        const documentation = await qaSystem.generateDocumentation(repoUrl);
        res.json({ documentation });
    } catch (error) {
        console.error('Error generating documentation:', error);
        res.status(500).json({ 
            error: 'Error generating documentation', 
            message: error.message 
        });
    }
});

app.post('/ask', async (req, res) => {
    try {
        const { question } = req.body;
        
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        if (question.length > 1000) {
            return res.status(400).json({ error: 'Question is too long (max 1000 characters)' });
        }

        await qaSystem.initialize();
        const answer = await qaSystem.answerQuestion(question);
        res.json({ answer });
    } catch (error) {
        console.error('Error answering question:', error);
        res.status(500).json({ 
            error: 'Error answering question', 
            message: error.message 
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received. Closing HTTP server...');
    await cleanup();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received. Closing HTTP server...');
    await cleanup();
    process.exit(0);
});

async function cleanup() {
    try {
        // Clean up temp directory
        await fs.rm(TEMP_DIR, { recursive: true, force: true }).catch(() => {});
        
        // Additional cleanup if needed
        console.log('Cleanup completed');
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

module.exports = app;