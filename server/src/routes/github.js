const express = require('express');
const router = express.Router();
const crypto = require('crypto');

module.exports = (githubPRService) => {
    const verifyGithubWebhook = (req) => {
        const signature = req.headers['x-hub-signature-256'];
        if (!signature) {
            console.log('No signature found in headers');
            return false;
        }

        const payload = JSON.stringify(req.body);
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        
        const computedSignature = 'sha256=' + crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        
        console.log('Signature verification:', {
            received: signature,
            computed: computedSignature,
            match: signature === computedSignature
        });

        return signature === computedSignature;
    };

    router.post('/github/webhook', express.json(), async (req, res) => {
        console.log('Received webhook:', {
            event: req.headers['x-github-event'],
            delivery: req.headers['x-github-delivery'],
            signature: req.headers['x-hub-signature-256']
        });

        try {
            if (!verifyGithubWebhook(req)) {
                console.log('Webhook verification failed');
                return res.status(401).json({ error: 'Invalid signature' });
            }

            console.log('Webhook verified successfully');

            if (req.headers['x-github-event'] === 'pull_request') {
                console.log('Processing pull request webhook');
                await githubPRService.analyzePullRequest(req.body);
                console.log('Pull request analysis completed');
            }

            res.status(200).json({ message: 'Webhook processed successfully' });
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/github/install-webhook', async (req, res) => {
        try {
            const { owner, repo } = req.body;
            const webhookUrl = `/api/github/webhook`;
            
            await githubPRService.installWebhook({
                owner,
                repo,
                webhookUrl
            });

            res.json({ success: true, message: 'Webhook installed successfully' });
        } catch (error) {
            console.error('Error installing webhook:', error);
            res.status(500).json({ 
                error: 'Failed to install webhook',
                message: error.message 
            });
        }
    });

    return router;
};