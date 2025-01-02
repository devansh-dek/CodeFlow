const { GoogleGenerativeAI } = require('@google/generative-ai');
const Repository = require('../models/Repository'); // Add this import

class VectorStoreRepository {
    constructor() {
        this.embeddingModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        .getGenerativeModel({ model: 'embedding-001' });
    }

    async addChunks(chunks, repositoryId) {
        if (!chunks.length) return;

        try {
            const repository = await Repository.findById(repositoryId);
            if (!repository) {
                throw new Error('Repository not found');
            }

            const BATCH_SIZE = 10;
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + BATCH_SIZE);
                const embeddings = await Promise.all(
                    batchChunks.map(chunk => this.generateEmbedding(chunk.content))
                );

                const vectorEmbeddings = batchChunks.map((chunk, j) => ({
                    document: chunk.content,
                    embedding: embeddings[j],
                    metadata: {
                        type: chunk.type,
                        name: chunk.name,
                        location: chunk.location
                    }
                }));

                repository.vectorEmbeddings.push(...vectorEmbeddings);
                await repository.save();

                if (i + BATCH_SIZE < chunks.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error('Error in addChunks:', error);
            throw new Error(`Failed to add chunks to vector store: ${error.message}`);
        }
    }

    async findSimilarChunks(question, repositoryId, limit = 5) {
        try {
            const repository = await Repository.findById(repositoryId);
            if (!repository) {
                throw new Error('Repository not found');
            }

            const questionEmbedding = await this.generateEmbedding(question);
            const similarities = repository.vectorEmbeddings.map(vec => ({
                similarity: this.cosineSimilarity(questionEmbedding, vec.embedding),
                content: vec.document,
                metadata: vec.metadata
            }));

            return similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
        } catch (error) {
            console.error('Error in findSimilarChunks:', error);
            throw new Error(`Failed to find similar chunks: ${error.message}`);
        }
    }

    async generateEmbedding(text) {
        try {
            const truncatedText = text.substring(0, 5000);
            const result = await this.embeddingModel.embedContent(truncatedText);
            return result.embedding.values;
        } catch (error) {
            console.error('Error in generateEmbedding:', error);
            throw new Error(`Failed to generate embedding: ${error.message}`);
        }
    }

    cosineSimilarity(vector1, vector2) {
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitude1 * magnitude2);
    }
}

module.exports = VectorStoreRepository;