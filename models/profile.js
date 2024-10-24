import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,//gets the  _id from user model
        ref: "User",
    },
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
    },
    location: {
        state: {
            type: String,
        },
        address: {
            type: String,
        },
    },
    bankInfo:{
        account_name:{
            type: String, 
        },
        account_number:{
            type: String, 
        },
        bank_name:{
            type: String,
        },
        bank_code:{
            type: String, 
        },
    },
    verification:{
        level1:{
            firstName:{
                type: String, 
            },
            lastName:{
                type: String, 
            },
            validId: {
                public_id: {
                    type: String, 
                },
                url: {
                    type: String, 
                }
            },
            passport:{
                public_id: {
                    type: String, 
                },
                url: {
                    type: String, 
                }
            },
            verified: {
                type: Boolean,
                default: false
            },
        },
        level2:{
            tel: {
                type: String, 
            },
            adress:{
                type: String, 
            },
            verified: {
                type: Boolean,
                default: false
            },
        },
        level3:{
            tradeCertificate: {
                public_id: {
                    type: String, 
                },
                url: {
                    type: String, 
                }
            },
            proofOfTraining:{
                public_id: {
                    type: String, 
                },
                url: {
                    type: String, 
                }
            },
            cv: {
                public_id: {
                    type: String, 
                },
                url: {
                    type: String, 
                }
            },
            verified: {
                type: Boolean,
                default: false
            },
        },
        level4: {
            testDay: {
                type: Date, // Date type to store just the date
            },
            testTime: {
                type: String, // String type to store time, e.g., "09:00 AM"
            },
            verified: {
                type: Boolean,
                default: false
            },
        },
    },
    assignedJobs: [
        {
            jobId: {
                type: Schema.Types.ObjectId, // Reference to the Job model
                ref: "Job",
                required: true
            },
            status: {
                type: String,
                enum: ["pending", "accepted","assigned", "completed", "approved", "paid", "closed", "rejected"], 
            },
            jobType: {
                type: String,
                required: true
            },
            serviceType: {
                type: String,
                required: true
            },
            address: {
                type: String,
                required: true
            },
            startDate: {
                type: Date,
                required: true
            }
        }
    ]
    
},
    { timestamps: true });

module.exports = mongoose.model("Profile", ProfileSchema);