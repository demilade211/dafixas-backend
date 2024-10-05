import mongoose from "mongoose";
import validator from "validator";

const Schema = mongoose.Schema;

const SupervisorTokenSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true, // Ensures a single token per email
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    inviteToken: {
        type: String,
        required: true // Token sent for supervisor registration
    },
    inviteTokenExpire: {
        type: Date,
        required: true // Expiry time for the token
    },
    role: {
        type: String,
        default: 'supervisor' // Assigning 'supervisor' as the default role
    }
});

// Export the model
module.exports = mongoose.model("SupervisorToken", SupervisorTokenSchema);
