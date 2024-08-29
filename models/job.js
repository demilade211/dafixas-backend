import mongoose from "mongoose";

const Schema = mongoose.Schema;

const JobSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, // Reference to the user who created the job
        ref: "User",
        required: true
    },
    jobType: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    picture: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            }
        }
    ],
    video: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
        optional: true
    },
    startDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // Format: "HH:mm AM/PM"
        required: true
    },
    endTime: {
        type: String, // Format: "HH:mm AM/PM"
        required: true
    },
    location: {
        state: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    supervisors: [
        {
            type: Schema.Types.ObjectId,
            ref: "User" // Assuming supervisors are also users
        }
    ],
    artisans: [
        {
            type: Schema.Types.ObjectId,
            ref: "User" // Assuming artisans are also users
        }
    ],
    status: {
        type: String,
        enum: ["pending", "accepted", "completed", "approved", "paid", "closed", "rejected"],
        default: "pending"
    }
}, 
{ timestamps: true });

module.exports = mongoose.model("Job", JobSchema);
