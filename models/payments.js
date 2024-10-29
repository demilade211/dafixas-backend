import mongoose from "mongoose";

const Schema = mongoose.Schema;


const PaymentSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,//gets the  _id from user model
        ref: "User",
        required: true,
    }, 
    amount:{
        type: Number,
        required:true
    },
    reference:{
        type:String,
        required: true
    },
},
{timestamps: true}
)

module.exports = mongoose.model("Payment", PaymentSchema)
