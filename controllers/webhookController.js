import UserModel from "../models/user"
import PaymentModel from "../models/payments.js"
import ProfileModel from "../models/profile.js"
import ErrorHandler from "../utils/errorHandler.js";
import axios from "axios"
import dotenv from "dotenv";

dotenv.config({ path: "config/config.env" });

const url = 'https://api.paystack.co';

const config = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRETE_KEY_TEST}`
    }
}

export const getWebhook = async (req, res, next) => {
    // Retrieve the request's body
    var event = req.body;
    // Do something with event 
    console.log(event.event, event.data, "=====================================>");
    if (event.event === "charge.success") {
        try {
            const user = await UserModel.findOne({ email: event.data.customer.email })

            const { userId } = event.data.metadata;

            const profile = await ProfileModel.findOne({ user: userId });

            if (!profile) {
                return next(new ErrorHandler("Tournament or Profile not found", 404));
            }


            const payment = {
                user: user._id,
                amount: event.data.amount,
                reference: event.data.reference
            }

            const newPayment = await PaymentModel.create(payment);

            const authorizationExists = user.authorizations.length > 0 && user.authorizations.filter(auth => auth.authorization.signature === event.data.authorization.signature).length > 0;

            if (!authorizationExists) {
                await user.authorizations.unshift({ email: event.data.customer.email, authorization: event.data.authorization })
                await user.save()
            }

            // Update the wallet balance in the profile
            profile.wallet.balance += event.data.amount/100;
            await profile.save();

            console.log(`Wallet updated. New balance: ${profile.wallet.balance}`);


        } catch (error) {
            console.log(error);
        }
    }


    return res.status(200).json({
        success: true,
        event
    })
}
