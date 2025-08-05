const User = require("../models/user");
const jwt = require('jsonwebtoken');

//JWT sign function --> Reusable
const signToken = id => {

     return jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.JWT_EXP
        })
}

//Register
exports.register = async (req, res, next) => {
    const{ username, email, password, role } = req.body;

    if( !username || !email || !password || !role) {
        return res.status(400).json({ message: 'Input all fields' });
    }

    const duplicateUsername = await User.findOne({ username }).exec();
    if(duplicateUsername)
        return res.status(400).json({
        status: false,
        message: 'Username already exists'
    }); //conflict --> Duplicate username

    const duplicateEmail = await User.findOne({ email }).exec();
    if(duplicateEmail)
        return res.status(400).json({
        status: false,
        message: 'Email already exists'
    }); //conflict --> Duplicate Email

    if (password.length < 6) {
        return res.status(400).json({ 
        message: "Password is less than 6 characters"
        })
    }

    try {
        const newUser = new User({
            username,
            email,
            password,
            role
        });

        await newUser.save();

        const token = signToken(newUser._id);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                newUser,
            },
        });
    } catch (err) {
        res.status(500).json({
            'message': err.message
        })
    }
}

//login

exports.userLogin = async(req, res) => {
    const { email, password } = req.body;

    if( !email || !password){
        return res.status(400).json({
            message: 'Input Username and Password'
        });
    }

    //Validate User
    const searchUser = await User.findOne({ email }).select('+password');
    if(!searchUser) {
        return res.status(400).json({
            status: false,
            message: 'Invalid email/password'
        });
    }

    const matchpwd = await searchUser.matchPassword(password,searchUser.password)
    if(matchpwd) {
        const accessToken = signToken(searchUser._id);

        const result = await searchUser.save();

        return res.status(200).json({
            status: 'success',
            accessToken,
            message: "You are logged in.",
            data: {
                result
            }
        })
    } else {
        return res.status(403).json({
            message: "Incorrect password."
        });
    }
}

//List users (admin and manager perm only)
exports.getAllUsers = async( req, res) => {
    try {
        const userList = await User.find().select('username email role createdAt -_id');
        res.status(200).json({
            status: 'success',
            result: userList.length,
            data: {
                userList
            },
        })
    } catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        })
    }
}
//update user role (admin and manager only)
exports.updateUserrole = async(req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const requesterRole = req.currentUser.role;

    //Validate role input
    if(!['admin', 'manager', 'staff'].includes(role)){
        return res.status(400).json({
            status: 'false',
            message: 'Invalid role'
        })
    }

    //Restrict managers from setting admin role
    if(requesterRole == 'manager' && role == 'admin'){
        return res.status(403).json({
            message: 'Unauthorized: Manager cannot promote to admin'
        })
    }

    try {
        const user = await User.findById(id);
        if(!user){
            return res.status(404).json({
            status: 'false',
            message: 'User not found'
        })
        }

        // Allowed transition
        const allowedTransition = {
            admin: ['staff', 'manager'], // Ultimate privilege
            manager: ['staff'] // Manager can only promote user to manager
        }

        // Check if requester is allowed to change to the new role
        if(!allowedTransition[requesterRole]?.includes(user.role)){
            return res.status(403).json({
            status: 'false',
            message: 'Unauthorized: Cannot perform role change'
        })
        }

        // Prevent Invalid role changes
        if(user.role == 'admin' && role !== 'admin') {
            return res.status(403).json({
            status: 'false',
            message: 'Cannot demote admin'
        })
        }
        if(user.role == 'manager' && role == 'staff') {
            return res.status(403).json({
            status: 'false',
            message: 'Cannot demote a manager to staff'
        })
        }
        if(role == user.role) {
            return res.status(400).json({
            message: 'User already have this role'
        })
        }

        user.role = role
        await user.save
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({
            error: 'Failed to update user role'
        });
    }
}
//update user details(user only)
