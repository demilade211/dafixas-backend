import TournamentModel from "../models/tournament.js" 
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
        
        await TournamentModel.updateMany({}, { $set: { isPrivate: true } })
        console.log("Tournament Updated");

        // await ProfileModel.updateMany({}, { $unset: { authorizations: 1 }  })
        // console.log("Profile Updated");
        
        
        // await PostsModel.updateMany({}, { $set: { stars: [] } })
        // console.log("Posts Updated");




        process.exit();
    } catch (error) {
        console.log(error.message);
        process.exit();
    }
}

seedProducts();