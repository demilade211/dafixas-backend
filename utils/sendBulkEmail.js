import dotenv from "dotenv"; 
const { MailtrapClient } = require("mailtrap");

dotenv.config({ path: "config/config.env" });
 

const sendBulkEmail = async (options,emails) => {


 
  const ENDPOINT = "https://send.api.mailtrap.io/";

  const client = new MailtrapClient({ endpoint: ENDPOINT, token: process.env.MAILTRAP_TOKEN });
  const testClient = new MailtrapClient({
    endpoint: ENDPOINT,
    token: process.env.MAILTRAP_TOKEN,
  });

  const sender = {   email: "noreply@dafixas.com" };

  await testClient.send({
    from: sender,
    to: emails,
    subject: options.subject,
    text: options.message,
    html: options.html // Ensure the HTML content is passed
  }) 


   
}

export default sendBulkEmail;