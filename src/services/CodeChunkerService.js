const CodeChunk = require('../models/CodeChunk');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class CodeChunkerService {
    constructor() {
        this.CHUNK_TYPES = {
            FUNCTION: 'function',
            CLASS: 'class',
            METHOD: 'method',
            FILE: 'file'
        };
    }

    async chunkCode(filePath, content) {
        try{
            console.log("Cam in chunk Code")
            if (this.isBinaryFile(content) || content.length > 1000000) {
                return [];
            }
            console.log("Came in here 22")
            const ext = path.extname(filePath).toLowerCase();
            if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
                return this.chunkJavaScript(filePath, content);
            }
            console.log("Came here too bruh")
            return this.chunkGeneric(filePath, content);
        }
        catch(error){
            console.log("error in chunk COde ",error)
            throw(error)

        }
    }

    isBinaryFile(content) {
        return Buffer.from(content).slice(0, 24).toString().includes('\u0000');
    }

    async chunkJavaScript(filePath, content) {
        try {
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript'],
                errorRecovery: true
            });

            const chunks = [];
            let currentClass = null;

            traverse(ast, {
                FunctionDeclaration: path => {
                    if (path.node.id?.name) {
                        chunks.push(new CodeChunk(
                            this.CHUNK_TYPES.FUNCTION,
                            path.node.id.name,
                            content.slice(path.node.start, path.node.end),
                            filePath
                        ));
                    }
                },
                ClassDeclaration: path => {
                    if (path.node.id?.name) {
                        currentClass = path.node.id.name;
                        chunks.push(new CodeChunk(
                            this.CHUNK_TYPES.CLASS,
                            currentClass,
                            content.slice(path.node.start, path.node.end),
                            filePath
                        ));
                    }
                },
                ClassMethod: path => {
                    if (path.node.key?.name) {
                        chunks.push(new CodeChunk(
                            this.CHUNK_TYPES.METHOD,
                            `${currentClass}.${path.node.key.name}`,
                            content.slice(path.node.start, path.node.end),
                            filePath
                        ));
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
                chunks.push(new CodeChunk(
                    this.CHUNK_TYPES.FILE,
                    `${path.basename(filePath)}-chunk-${chunks.length + 1}`,
                    currentChunk.trim(),
                    filePath
                ));
                currentChunk = line;
                currentSize = line.length;
            } else {
                currentChunk += (currentChunk ? '\n' : '') + line;
                currentSize += line.length + 1;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(new CodeChunk(
                this.CHUNK_TYPES.FILE,
                `${path.basename(filePath)}-chunk-${chunks.length + 1}`,
                currentChunk.trim(),
                filePath
            ));
        }

        return chunks;
    }
}
module.exports = CodeChunkerService