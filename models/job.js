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
    pictures: [
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
        }
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
    },
    projectCosting: {
        artisans: [
            {
                artisan: {
                    type: Schema.Types.ObjectId,
                    ref: "User" // Artisan reference
                },
                fee: {
                    type: Number, // Fee for the artisan
                    required: true
                }
            }
        ],
        materials: [
            {
                materialName: {
                    type: String,
                    required: true
                },
                cost: {
                    type: Number, // Cost of the material
                    required: true
                },
                quantity: {
                    type: Number, // Quantity of the material
                    required: true
                }
            }
        ]
    }
}, 
{ timestamps: true });

module.exports = mongoose.model("Job", JobSchema);
