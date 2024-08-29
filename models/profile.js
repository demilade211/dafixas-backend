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
    }
    
},
    { timestamps: true });

module.exports = mongoose.model("Profile", ProfileSchema);