import mongoose from "mongoose";

const Schema = mongoose.Schema;


const JobPaymentSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,//gets the  _id from user model
        ref: "User",
        required: true,
    }, 
    jobId: {
        type: Schema.Types.ObjectId, // Reference to the Job model
        ref: "Job",
        required: true
    },
    amount:{
        type: Number,
        required:true
    }, 
},
{timestamps: true}
)

module.exports = mongoose.model("JobPayment", JobPaymentSchema)
