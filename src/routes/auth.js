const express = require('express')
const router = express.Router();
const AuthService = require('../services/authService')
const authService = new AuthService();

router.post('/register',async(req,res)=>{
    try{
        // inRegister Post 
        console.log("IN da register")
        const { email, password } = req.body;
        const token = await authService.registerUser(email, password);
        res.json({ token });    }
    catch(error){
        res.status(400).json({error : error.message});
    }
})
router.post('/login',async(req,res)=>{
    try {
        const { email, password } = req.body;
        const token = await authService.loginUser(email, password);
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
})
module.exports = router