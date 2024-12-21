const AuthService = require('../services/authService.js');
const authService = new AuthService();

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = authService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
