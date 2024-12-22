const AuthService = require('../services/authService');
const authService = new AuthService();

module.exports = async (req, res, next) => {
    try {
        const token = req.cookies[authService.COOKIE_NAME];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        // Clear invalid cookie if present
        authService.clearAuthCookie(res);
        res.status(401).json({ error: 'Invalid or expired session' });
    }
};