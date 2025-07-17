const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { required } = require("nodemon/lib/config");


const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        required: [true, 'Please enter your username']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please enter email'],
        lowercase: true,
        trim: true,
        match: [ /^\S+@\S+\.\S+$/, 'Please enter a valid email.']
    },
    password: {
        type: String,
        minlength: 6,
        required: [true, 'Please enter your password'],
        select: false
    },
    role: {
        type: String,
        enum: ["admin", "manager", "staff"],
        default: 'staff',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLogin: {
        type: Date,
  },
});

userSchema.index ({ email: 1});

module.exports = mongoose.model('User', userSchema);