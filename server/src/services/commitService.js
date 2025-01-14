
const simpleGit = require('simple-git');
const { parsePatch } = require('diff');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Commit = require('../models/Commits')





class CommitService {
    constructor(documentationsService) {
        this.documentationService = documentationsService;
        this.model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            .getGenerativeModel({ model: 'gemini-pro' });
        this.quotaExceeded = false;
        this.lastReset = Date.now();
    }
    async analyzeAllCommits(repoPath, repositoryId) {
        try {
            console.log("Processing commits...");
            const git = simpleGit(repoPath);
            const logResult = await git.log();
            const commits = [];
            
            // Process commits in smaller batches to prevent memory issues
            const batchSize = 10;
            for (let i = 0; i < logResult.all.length; i += batchSize) {
                const batch = logResult.all.slice(i, i + batchSize);
                
                // Process batch concurrently with limit
                const batchPromises = batch.map(commitInfo => 
                    this.processCommit(git, commitInfo, repositoryId)
                        .catch(error => {
                            console.error(`Error processing commit ${commitInfo.hash}:`, error);
                            return null; // Return null for failed commits
                        })
                );
                
                const batchResults = await Promise.all(batchPromises);
                commits.push(...batchResults.filter(Boolean)); // Filter out failed commits
                
                // Add a small delay between batches to prevent overwhelming the system
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            return commits;
        } catch (error) {
            console.error("Error in analyzeAllCommits:", error);
            throw error;
        }
    }
    async processCommit(git, commitInfo, repositoryId) {
        console.log(`Processing commit ${commitInfo.hash}`);
        
        try {
            // Set timeout for git show command
            const timeoutMs = 30000; // 30 seconds
            const diff = await Promise.race([
                git.show([
                    commitInfo.hash,
                    '--pretty=format:""',
                    '--patch'
                ]),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Git show timeout')), timeoutMs)
                )
            ]);
    
            // Parse the diff with error handling
            const files = await this.parseGitDiff(diff);
            if (!files || !files.length) {
                console.log(`No files found for commit ${commitInfo.hash}`);
                return null;
            }
            
            const stats = this.calculateStats(files);
            
            const commit = new Commit({
                repositoryId,
                sha: commitInfo.hash,
                parentSha: commitInfo.parent,
                message: commitInfo.message,
                author: {
                    name: commitInfo.author_name,
                    email: commitInfo.author_email,
                    date: commitInfo.date
                },
                stats,
                files
            });
            
            await commit.save();
            return commit;
        } catch (error) {
            if (error.message === 'Git show timeout') {
                console.error(`Timeout processing commit ${commitInfo.hash}`);
            }
            throw error;
        }
    }


    async generateCommitAnalysis(commit) {
        // Check if we're in quota exceeded state
        if (this.quotaExceeded) {
            return {
                overview: "API quota exceeded. Using basic analysis.",
                impact: this.generateBasicImpact(commit),
                architecture: "Quota exceeded. Please try later."
            };
        }

        try {
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

            const prompt = `Analyze this commit:
            Message: ${commit.message}
            Changes: ${this.formatChangesForPrompt(commit)}`;

            const result = await this.model.generateContent(prompt);
            return this.parseAnalysisResult(result);

        } catch (error) {
            if (error.message.includes('429')) {
                this.quotaExceeded = true;
                // Reset quota exceeded flag after an hour
                setTimeout(() => {
                    this.quotaExceeded = false;
                }, 3600000); // 1 hour
                
                // Return basic analysis instead
                return {
                    overview: "API quota exceeded. Using basic analysis.",
                    impact: this.generateBasicImpact(commit),
                    architecture: "Quota exceeded. Please try later."
                };
            }
            throw error;
        }
    }


    async generateArchitectureDiagram(commit) {
        try {
            const prompt = `Based on these code changes, generate a Mermaid.js flowchart diagram showing the architectural impact:
            ${commit.files.map(file => `
                File: ${file.filename}
                Changes: ${file.hunks.map(hunk => hunk.content).join('\n')}
            `).join('\n')}
            
            Create a Mermaid diagram showing:
            1. Components affected by the changes
            2. Data flow modifications
            3. New or modified relationships
            
            Use only Mermaid.js flowchart syntax.`;

            const result = await this.model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error("Error generating architecture diagram:", error);
            throw error;
        }
    }
    generateBasicImpact(commit) {
        const totalFiles = commit.files.length;
        const totalChanges = commit.files.reduce((sum, file) => 
            sum + file.stats.additions + file.stats.deletions, 0);
        
        return `This commit affects ${totalFiles} files with ${totalChanges} total changes. ` +
               `Commit message: ${commit.message}`;
    }

    formatChangesForPrompt(commit) {
        return commit.files.map(file => `
            File: ${file.filename}
            Changes: +${file.stats.additions}/-${file.stats.deletions}
        `).join('\n');
    }

    parseAnalysisResult(result) {
        try {
            const analysis = result.response.text();
            const sections = analysis.split('\n\n');
            return {
                overview: sections[0] || '',
                impact: sections[1] || '',
                architecture: sections[2] || ''
            };
        } catch (error) {
            return {
                overview: "Error parsing analysis",
                impact: "Unable to generate detailed impact",
                architecture: "Analysis unavailable"
            };
        }
    }
    // Add rate limiting helper method
   
    async parseGitDiff(diffText) {
        try {
            const patches = parsePatch(diffText); // Fixed parsePatch usage
            return patches.map(patch => {
                const hunks = patch.hunks.map(hunk => {
                    const changes = [];
                    let oldLineNumber = hunk.oldStart;
                    let newLineNumber = hunk.newStart;

                    for (const line of hunk.lines) {
                        const change = {
                            content: line.substr(1),
                            lineNumber: {}
                        };

                        if (line[0] === '+') {
                            change.type = 'add';
                            change.lineNumber.new = newLineNumber++;
                        } else if (line[0] === '-') {
                            change.type = 'delete';
                            change.lineNumber.old = oldLineNumber++;
                        } else {
                            change.type = 'context';
                            change.lineNumber.old = oldLineNumber++;
                            change.lineNumber.new = newLineNumber++;
                        }

                        changes.push(change);
                    }

                    return {
                        oldStart: hunk.oldStart,
                        oldLines: hunk.oldLines,
                        newStart: hunk.newStart,
                        newLines: hunk.newLines,
                        content: hunk.lines.join('\n'),
                        changes
                    };
                });

                const stats = this.calculateFileStats(hunks);

                return {
                    filename: patch.newFileName || patch.oldFileName,
                    oldPath: patch.oldFileName,
                    newPath: patch.newFileName,
                    type: this.determineChangeType(patch),
                    hunks,
                    stats
                };
            });
        } catch (error) {
            console.error("Error parsing git diff:", error);
            return [];
        }
    }

    async generateCommitDocumentation(files, commitMessage) {
        try {
            const prompt = `Analyze this commit:
            Message: ${commitMessage}
            Changes: 
            ${files.map(file => `
                File: ${file.filename}
                Type: ${file.type}
                Changes: +${file.stats.additions}/-${file.stats.deletions}
            `).join('\n')}
                            
            Generate:
            1. Overview of changes
            2. Impact assessment
            3. Architecture implications`;

            // Use rate-limited request
            const result = await this.rateLimitedRequest(async () => {
                return await this.model.generateContent(prompt);
            });

            const analysis = result.response.text();

            return {
                overview: analysis.split('\n')[0],
                impact: analysis,
                architecture: this.documentationService ? 
                    await this.documentationService.generateArchitectureDiagram(files) : 
                    'Architecture analysis not available'
            };
        } catch (error) {
            console.error("Error generating commit documentation:", error);
            return {
                overview: "Error generating overview",
                impact: "Error generating impact analysis",
                architecture: "Error generating architecture analysis"
            };
        }
    }

    determineChangeType(patch) {
        if (!patch.oldFileName) return 'add';
        if (!patch.newFileName) return 'delete';
        if (patch.oldFileName !== patch.newFileName) return 'rename';
        return 'modify';
    }

    calculateFileStats(hunks) {
        let additions = 0;
        let deletions = 0;

        for (const hunk of hunks) {
            for (const change of hunk.changes) {
                if (change.type === 'add') additions++;
                if (change.type === 'delete') deletions++;
            }
        }

        return {
            additions,
            deletions,
            changes: additions + deletions
        };
    }

   
    calculateStats(files) {
        return files.reduce((stats, file) => {
            stats.totalFiles++;
            stats.additions += file.stats.additions;
            stats.deletions += file.stats.deletions;
            stats.changes += file.stats.changes;
            return stats;
        }, { totalFiles: 0, additions: 0, deletions: 0, changes: 0 });
    }

}

module.exports = CommitService;