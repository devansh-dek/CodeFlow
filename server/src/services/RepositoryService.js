const simpleGit = require('simple-git');
const fs = require('fs/promises');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class RepositoryService {
    constructor(tempDir) {
        this.TEMP_DIR = tempDir;
    }

    async cloneRepository(repoUrl) {
        try {
            const repoName = this.sanitizeId(repoUrl.split('/').pop().replace('.git', ''));
            const repoPath = path.join(this.TEMP_DIR, repoName);
            
            await fs.mkdir(this.TEMP_DIR, { recursive: true });
            await simpleGit().clone(repoUrl, repoPath);
            
            return repoPath;
        } catch (error) {
            throw new Error(`Failed to clone repository: ${error.message}`);
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

    sanitizeId(id) {
        return id.replace(/[^a-zA-Z0-9-]/g, '-').substring(0, 64);
    }
}
module.exports = RepositoryService  