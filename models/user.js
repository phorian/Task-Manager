const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const validator = required('validator');
const {type} = require("os");
const { required } = require("nodemon/lib/config");

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Please enter your username']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please enter email'],
        lowercase: true,
        validate: [ validator.isEmail, 'Please enter a valid email.']
    },
    password: {
        type: String,
        minlength: 6,
        required: [true, 'Please enter your password'],
        select: false
    },
    role: {
        type: String,
        enum: ["admin", "manager", "member", "viewer"],
        default: 'viewer',
        required: true
    }
})

module.exports = mongoose.model('User', userSchema);