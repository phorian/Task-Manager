const jwt = require ('jsonwebtoken');
const User = require('../models/user');

exports.verifyAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const token = authHeader.split(' ')[1];
        if(!token?.startsWith('Bearer')) return res.sendStatus(401);

        const decodedToken = await utils.promisify(jwt.verify)(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken.id)

        if(!user){
        return res.sendStatus(401); //invalid token
        //next()
        }

        req.user = user
        next();
    } catch(err){
        return res.status(401).json("Invalid token");
    }
};

exports.verifyRole = (role) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user)
        if(!user || !role.includes(user.role)) {
            return res.status(403).json({
                error: 'Unauthorized: Insufficient permissions'
            })
        }
            req.currentUser = user;
            next();
    }catch(err){
        res.status(500).json({
            error: 'Server error during authorization'
        })
    }
}