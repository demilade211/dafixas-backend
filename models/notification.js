const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,//gets the  _id from user model
        ref: "User",
    },
    notifications: [
        {
            type: {
                type: String,
                enum: [
                    "newJobRequest",
                    "newMessage",
                    "newAssignSupervisor", 
                    "newAssignArtisan"
                ]
            },
            user: { type: Schema.Types.ObjectId, ref: "User" }, 
            job: { type: Schema.Types.ObjectId, ref: "Job" },   
            date: { type: Date, default: Date.now }, 
        }
    ],
})

module.exports = mongoose.model("Notification", NotificationSchema);