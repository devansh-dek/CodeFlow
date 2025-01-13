const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');
const simpleGit = require('simple-git');
const fs = require('fs/promises');
const path = require('path');

class GitHubPRService {
    constructor(tempDir) {
        this.TEMP_DIR = tempDir;
        this.model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            .getGenerativeModel({ model: 'gemini-pro' });
        this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    }

    async analyzePullRequest(payload) {
        try {
            const {
                repository,
                pull_request: pr,
                action
            } = payload;

            if (action !== 'opened' && action !== 'synchronize') {
                return null;
            }

            // Get PR diff using Octokit
            const { data: diff } = await this.octokit.rest.pulls.get({
                owner: repository.owner.login,
                repo: repository.name,
                pull_number: pr.number,
                mediaType: {
                    format: 'diff'
                }
            });

            // Get changed files details
            const { data: files } = await this.octokit.rest.pulls.listFiles({
                owner: repository.owner.login,
                repo: repository.name,
                pull_number: pr.number
            });

            // Generate summary using AI
            const summary = await this.generatePRSummary({
                title: pr.title,
                description: pr.body,
                diff,
                files,
                additions: pr.additions,
                deletions: pr.deletions
            });

            // Post summary as PR comment
            await this.createPRComment({
                owner: repository.owner.login,
                repo: repository.name,
                prNumber: pr.number,
                summary
            });
            
            return summary;
        } catch (error) {
            console.error('Error analyzing PR:', error);
            throw error;
        }
    }

    async generatePRSummary({ title, description, diff, files, additions, deletions }) {
        const fileChanges = files.map(file => ({
            filename: file.filename,
            changes: file.changes,
            additions: file.additions,
            deletions: file.deletions,
            status: file.status
        }));

        const prompt = `Analyze this pull request and provide a comprehensive summary:

Title: ${title}
Description: ${description}
Files Changed: ${files.length}
Total Additions: ${additions}
Total Deletions: ${deletions}

Changed Files:
${JSON.stringify(fileChanges, null, 2)}

Diff:
${diff}

Please provide:
1. A brief overview of the changes
2. Technical impact analysis
3. Potential risks or areas needing attention
4. Suggestions for testing
5. Code quality observations

Format the response in Markdown.`;

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    async createPRComment({ owner, repo, prNumber, summary }) {
        await this.octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: prNumber,
            body: summary
        });
    }

    async installWebhook({ owner, repo, webhookUrl }) {
        return this.octokit.rest.repos.createWebhook({
            owner,
            repo,
            config: {
                url: webhookUrl,
                content_type: 'json',
                secret: process.env.GITHUB_WEBHOOK_SECRET
            },
            events: ['pull_request']
        });
    }
}

module.exports = GitHubPRService;