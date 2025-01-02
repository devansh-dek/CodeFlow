const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');
const authService = new AuthService();

router.post('/register', async (req, res) => {
    try {
        console.log("req body is ",req.body);
        const { email, password } = req.body;
        const token = await authService.registerUser(email, password);
        authService.setAuthCookie(res, token);
        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await authService.loginUser(email, password);
        authService.setAuthCookie(res, token);
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

router.post('/logout', (req, res) => {
    authService.clearAuthCookie(res);
    res.json({ message: 'Logout successful' });
});
module.exports = router;