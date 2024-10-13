import express from "express";
//import morgan from "morgan"
import errorMiddleware from "./middlewares/errorsMiddleware"
import auth from "./routes/auth"
import job from "./routes/job"
import notification from "./routes/notification"
import profile from "./routes/profile"
import user from "./routes/user"
import dashboard from "./routes/dashboard"
import admin from "./routes/admin"
import message from "./routes/message"

import cors from "cors";
import fileUpload from "express-fileupload"
import http from "http"




const app = express();
const server = http.createServer(app)


app.use(cors());
//app.use(morgan('dev'))
const io = require("socket.io")(server, {
    cors: {
        origin: "https://da-fixas.vercel.app",
        methods: ["GET", "POST"], 
    },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));//to handle url encoded data   
app.use(fileUpload({
    useTempFiles: true
}));

let onlineUsers = [];

io.on("connection", (socket) => { 
 
    // socket events will be here
    socket.on("join-room", (userId) => {  
        
        socket.join(userId);
    });

    socket.on("hello", (message) => {
        console.log("hi",message);
        
        io.emit("hi", message);
    });

    // send message to clients (who are present in members array) 
    socket.on("send-message", (message) => {

        io.to(message.members[0])
            .to(message.members[1]) 
            .emit("receive-message", message);
    });

    // clear unread messages
    socket.on("clear-unread-messages", (data) => {
        io.to(data.members[0])
            .to(data.members[1])
            .emit("unread-messages-cleared", data);
    });

    // typing event
    socket.on("typing", (data) => {
        io.to(data.members[0]).to(data.members[1]).emit("started-typing", data);
    });

    // online users

    socket.on("came-online", (userId) => {
        if (!onlineUsers.includes(userId)) {
            onlineUsers.push(userId);
        }

        io.emit("online-users-updated", onlineUsers);
    });

    // socket.on("went-offline", (userId) => {
    //   onlineUsers = onlineUsers.filter((user) => user !== userId);
    //   io.emit("online-users-updated", onlineUsers);
    // });
});

app.use('/api/v1', auth);
app.use('/api/v1/dashboard', dashboard);
app.use('/api/v1/job', job);
app.use('/api/v1/notification', notification);
app.use('/api/v1/profile', profile);
app.use('/api/v1', user);
app.use('/api/v1/admin', admin);
app.use('/api/v1/message', message);

//Middleware to handle errors
app.use(errorMiddleware);

export default server;