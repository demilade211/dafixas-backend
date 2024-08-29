import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        unique: true,
        trim: true,// no spaces
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,// cant have more than one if this
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    tel: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your password must be longer than 6 characters'],
        select: false
    },
    avatar: {
        public_id: {
            type: String,
            default: "App/user_mklcpl.png"
        },
        url: {
            type: String,
            default: 'https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png'
        }
    },
    verified: {
        type: Boolean,
        default: false
    },
    isDeactivated: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "user",
        enum: ['user', 'artisan', 'supervisor', 'admin']// specifies the only values that will be in role
    },
    resettoken: { type: String },
    expiretoken: { type: Date },
    authorizations: []
},
    { timestamps: true });

// Encrypting password before saving user
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {// a check to confirm if the password is modified before encrypting it
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

module.exports = mongoose.model("User", UserSchema);