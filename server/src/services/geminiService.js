const {GoogleGenerativeAI} = require('@google/generative-ai');
class GeminiService {
    constructor(){
        this.api = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        this.rateLimiter = {
            queue : [],
            processing : false,
            lastRequest : 0,
            minDelay : 1000,
            maxConcurrent : 0
        };
    }


    async generateContent(prompt, model = 'gemini-pro') {
        return this.executeWithRateLimit(async () => {
            const genModel = this.api.getGenerativeModel({ model });
            const result = await genModel.generateContent(prompt);
            return result.response.text();
        });
    }

    async generateEmbedding(text, maxLength = 5000) {
        return this.executeWithRateLimit(async () => {
            const truncatedText = text.substring(0, maxLength);
            const embeddingModel = this.api.getGenerativeModel({ model: 'embedding-001' });
            const result = await embeddingModel.embedContent(truncatedText);
            return result.embedding.values;
        });
    }

    async executeWithRateLimit(operation) {
        return new Promise((resolve, reject) => {
            this.rateLimiter.queue.push({ operation, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (
            this.rateLimiter.processing || 
            this.rateLimiter.queue.length === 0 ||
            this.rateLimiter.currentConcurrent >= this.rateLimiter.maxConcurrent
        ) {
            return;
        }

        this.rateLimiter.processing = true;
        const now = Date.now();
        const timeToWait = Math.max(0, this.rateLimiter.lastRequest + this.rateLimiter.minDelay - now);

        await new Promise(resolve => setTimeout(resolve, timeToWait));

        const { operation, resolve, reject } = this.rateLimiter.queue.shift();
        this.rateLimiter.currentConcurrent++;
        this.rateLimiter.lastRequest = Date.now();

        try {
            const result = await operation();
            resolve(result);
        } catch (error) {
            if (error.message.includes('429')) {
                // Re-queue the request on rate limit
                this.rateLimiter.queue.unshift({ operation, resolve, reject });
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer on rate limit
            } else {
                reject(error);
            }
        } finally {
            this.rateLimiter.currentConcurrent--;
            this.rateLimiter.processing = false;
            this.processQueue();
        }
    }



}
module.exports = new GeminiService();