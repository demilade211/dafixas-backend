// Import the Twilio module
import twilio from 'twilio';
import dotenv from "dotenv";  

dotenv.config({ path: "config/config.env" });
// Twilio credentials
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;//token

// Initialize the Twilio client
const client = twilio(accountSid, authToken);

// Async function to send WhatsApp messages
export const sendWhatsappOtp = async (toNumber, otp) => {
    try {
        const contentVariables = `{"1":"${otp}"}`;
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886',  // Twilio's WhatsApp sandbox number
            contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',  // Template content SID
            contentVariables,  // Content variables for dynamic values
            to: `whatsapp:${toNumber}`  // Destination WhatsApp number
        });
        console.log('Message sent with SID:', message.sid);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}; 
 
