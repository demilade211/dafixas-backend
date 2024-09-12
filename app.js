import  express from "express";
//import morgan from "morgan"
import errorMiddleware from "./middlewares/errorsMiddleware"
import auth from "./routes/auth"   
import job from "./routes/job"   
import notification from "./routes/notification"
import profile from "./routes/profile"
import user from "./routes/user"
import dashboard from "./routes/dashboard"
import admin from "./routes/admin"
import cors from "cors"; 
import fileUpload from "express-fileupload"




const app = express();

app.use(cors());
//app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));//to handle url encoded data   
app.use(fileUpload({
    useTempFiles : true
}));

app.use('/api/v1',auth);   
app.use('/api/v1/dashboard',dashboard);  
app.use('/api/v1/job',job);  
app.use('/api/v1/notification',notification);
app.use('/api/v1/profile',profile);
app.use('/api/v1',user);
app.use('/api/v1/admin',admin);

//Middleware to handle errors
app.use(errorMiddleware);

export default app;