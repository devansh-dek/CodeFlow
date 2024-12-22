const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET;
        this.COOKIE_NAME = 'auth_token';
        this.COOKIE_CONFIG = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        };
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
        try{
            const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Invalid credentials');
        }
        return this.generateToken(user);
        }
        catch(error){
            console.log("error in login user ",error);
            throw(error)
        }
    }

    generateToken(user) {
        return jwt.sign(
            { userId: user._id, email: user.email },
            this.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    setAuthCookie(res, token) {
        res.cookie(this.COOKIE_NAME, token, this.COOKIE_CONFIG);
    }

    clearAuthCookie(res) {
        res.clearCookie(this.COOKIE_NAME, {
            ...this.COOKIE_CONFIG,
            maxAge: 0
        });
    }
}

module.exports = AuthService;