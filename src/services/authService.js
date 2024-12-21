const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.JWT_EXPIRES_IN = '24h';
    }

    async registerUser(email, password) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }
        
        const user = new User({ email, password });
        await user.save();
        return this.generateToken(user);
    }

    async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Invalid credentials');
        }
        return this.generateToken(user);
    }

    generateToken(user) {
        return jwt.sign(
            { userId: user._id, email: user.email },
            this.JWT_SECRET,
            { expiresIn: this.JWT_EXPIRES_IN }
        );
    }

    verifyToken(token) {
        return jwt.verify(token, this.JWT_SECRET);
    }
}

module.exports = AuthService;

