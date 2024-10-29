import ErrorHandler from "../utils/errorHandler.js"; 
import axios from "axios"
import UserModel from "../models/user"
//import AtmModel from "../models/atm.js" 

import dotenv from "dotenv";

dotenv.config({ path: "config/config.env" });

let url = 'https://api.paystack.co';

let secreteKey = process.env.NODE_ENV === "DEVELOPMENT" ? process.env.PAYSTACK_SECRETE_KEY_TEST : process.env.PAYSTACK_SECRETE_KEY_LIVE
let subA = process.env.NODE_ENV === "DEVELOPMENT" ? "ACCT_1rfl6oo7whttogx" : "ACCT_ri4kdzrqk7eqar2"
let splitCode = process.env.NODE_ENV === "DEVELOPMENT" ?"SPL_gnViGPfSqB":"SPL_tssvQHc6fQ"

export const initializePayment = async (req, res, next) => {

    // const paystack = new PayStack(process.env.PAYSTACK_SECRETE_KEY_TEST, process.env.NODE_ENV)

    const { email,_id } = req.user;
    const { amount } = req.body;

    try {

        const user = await UserModel.findOne({ email: email })
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secreteKey}`
            }
        }

        if (Number(amount) < 1500) return next(new ErrorHandler("Please Minimum amount is 1500", 200))

        const data = {
            amount: Number(amount) * 100,
            email,  
            callback_url:`https://www.dafixas.com/dashboard/home`, 
            metadata: { 
                userId: _id
            }
        }


        const paystackResponse = await axios.post(`${url}/transaction/initialize`, data, config)
        const { access_code, reference, authorization_url } = paystackResponse.data.data

        if (paystackResponse.data.status !== true) return next(new ErrorHandler(paystackResponse.data.message, 200))
  

        return res.status(200).json({
            success: true,
            access_code,
            reference,
            authorization_url
        })

    } catch (error) {
        return next(error)
    }
} 

export const makeRecurringPayment = async (req, res, next) => {
    const { _id } = req.user;
    const { amount, email, authorization_code} = req.body

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secreteKey}`
        }
    }

    try {
        const user = await UserModel.findById(_id);

        if (!amount || !email || !authorization_code) return next(new ErrorHandler("Please input reference number", 200))

        const info = {
            amount: Number(amount) * 100,
            email,
            authorization_code,
            split_code:splitCode
        }

        const paystackResponse = await axios.post(`${url}/transaction/charge_authorization`, info, config)
        const { reference } = paystackResponse.data.data 

        //const newPayment = await AtmModel.create(newAtm);

        return res.status(200).json({
            success: true,
            message: "Transaction Sucessfull",
            data: paystackResponse.data.data
        })

    } catch (error) {
        return next(error)
    }
}