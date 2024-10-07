import JobModel from "../models/job.js" 
import mongoose from "mongoose";
import connectDb from "../db/db.js"
import dotenv from "dotenv";

dotenv.config({path: "config/config.env"});

connectDb();

const seedProducts = async () =>{
    try {
        // await UserModel.updateMany({}, { $set: { coverPhoto: {public_id:"defaultCover_oa5lkw",url:"https://res.cloudinary.com/tuale-tech/image/upload/v1676818436/defaultCover_oa5lkw.png"} } })
        // console.log("Users Updated");

        // await FollowersModel.updateMany({}, { $set: { givenTuales:0 } })
        // console.log("Followers Updated");

        // await NotificationsModel.updateMany()
        // console.log("Notifications Updated");
        
        // await TournamentModel.updateMany({}, { $set: { isPrivate: true } })
        // console.log("Tournament Updated");

        const sampleProjectCosting = {
            artisans: [
                
                {
                    artisan: mongoose.Types.ObjectId(), // Replace with actual artisan ID or leave as ObjectId
                    fee: 50000, // Sample fee
                }, 
            ],
            materials: [
                {
                    materialName: "Cement",
                    cost: 3000,
                    quantity: 50, // Sample material data
                },
                {
                    materialName: "Bricks",
                    cost: 500,
                    quantity: 1000,
                },
            ],
        };

        // Update all jobs with the new projectCosting field
        await JobModel.updateMany(
            {},
            { $set: { projectCosting: sampleProjectCosting } }
        );

        console.log("All jobs updated with project costing");




        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

seedProducts();