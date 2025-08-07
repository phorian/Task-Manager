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

userSchema.index ({ email: 1 });

userSchema.pre('save', async function(next) {
    if(!this.isModified('password'))
        return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.matchPassword = async function(password,userPassword) {
    return await bcrypt.compare(password,userPassword);
}

userSchema.methods.isPasswordChanged = async function (JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedpasswordTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changedpasswordTimestamp, JWTTimestamp)

        return JWTTimestamp < changedpasswordTimestamp;
    }
    return false;

}


userSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    //encrypt
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExp = Date.now() + 10 * 60 * 1000;

    return resetToken;
}


userSchema.pre(/^find/, function(next){
    this.find({active: {$ne: false}});
    next();
})


module.exports = mongoose.model('User', userSchema);