const { GoogleGenerativeAI } = require('@google/generative-ai');
const Documentation = require('../models/Documentation');



class DocumentationService {
    constructor() {
        this.model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            .getGenerativeModel({ model: 'gemini-pro' });
    }

    async generateDocumentation(chunks) {
        try {
            console.log("Entered generateDoc func");
            const overview = await this.generateOverview(chunks);
            const architecture = await this.generateArchitectureDiagram(chunks);
            const components = await this.generateComponentDocs(chunks);

            return new Documentation(overview, architecture, components);
        } catch (error) {
            throw new Error(`Failed to generate documentation: ${error.message}`);
        }
    }
   
    async generateOverview(chunks) {
        try{
            console.log("chuks are ",chunks);
            const prompt = `Analyze these code chunks and provide a comprehensive overview of the project:
            ${this.formatChunksForPrompt(chunks)}
            
            Include:
            1. Project purpose and main features
            2. Technologies used
            3. High-level architecture
            4. Key components and their responsibilities`;

        const result = await this.model.generateContent(prompt);
        console.log("result is ",result);
        return result.response.text();
    }
        catch(error){
            throw new Error(`Error at genoveriew func: ${error.message} `)
        }
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
            chunk.type === 'class' || chunk.type === 'function'
        );

        return Promise.all(componentChunks.map(async chunk => {
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

module.exports = DocumentationService