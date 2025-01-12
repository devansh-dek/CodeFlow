const Commit = require('../models/Commits');

class CommitController {
    constructor(commitService) {
        this.commitService = commitService;
        console.log("CommitService initialized:", this.commitService);

        // Bind methods to ensure the correct `this` context
        this.getCommits = this.getCommits.bind(this);
        this.getCommitDetail = this.getCommitDetail.bind(this);
    }

    async getCommits(req, res) {
        try {
            const { repositoryId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const commits = await Commit.find(
                { repositoryId },
                { documentation: 0 }
            )
                .sort({ 'author.date': -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await Commit.countDocuments({ repositoryId });

            res.json({
                commits,
                totalPages: Math.ceil(total / limit),
                currentPage: parseInt(page)
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getCommitDetail(req, res) {
        try {
            const { commitId } = req.params;
            const { generateDocs = true } = req.query;
    
            const commit = await Commit.findById(commitId);
            if (!commit) {
                return res.status(404).json({ error: 'Commit not found' });
            }
    
            let documentation = commit.documentation;
    
            if (generateDocs && (!documentation || !documentation.overview)) {
                try {
                    // Get basic documentation even if AI is not available
                    documentation = await this.commitService.generateCommitAnalysis(commit);
                    
                    // Only save if we got meaningful documentation
                    if (documentation.overview && !documentation.overview.includes("quota exceeded")) {
                        commit.documentation = documentation;
                        await commit.save();
                    }
                } catch (error) {
                    console.error("Error generating documentation:", error);
                    documentation = {
                        overview: "Basic analysis only",
                        impact: this.commitService.generateBasicImpact(commit),
                        flowchart: "Service temporarily unavailable"
                    };
                }
            }
    
            // Format and return response
            res.json({
                commit: {
                    ...commit.toObject(),
                    documentation
                }
            });
        } catch (error) {
            console.error(error, "Error in CommitController.getCommitDetail");
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = CommitController;
