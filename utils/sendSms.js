// Import the Twilio module
import twilio from 'twilio';
import dotenv from "dotenv";

dotenv.config({ path: "config/config.env" });

// Twilio credentials
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

// Async function to send SMS messages
export const sendSms = async (toNumber,text,next) => {
    try {
        const message = await client.messages.create({
            body: text,
            from: '+13344633993',
            to: toNumber,  // Destination handset number
        });
        console.log('Message sent with SID:', message.sid);
    } catch (error) {
        return next(error)
    }
};
