const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require("cookie-parser");
const urlRoute = require('./routes/url'); 
const signUproutes = require('./routes/signupRoutes')
const staticRoute = require('./routes/staticROUTES')
const { checkAuthentication,restrictTo} = require("./middleware/auth");
// const morgan=require('morgan')
// const logger=require('logger')


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
// logger.info("mongodb has connected succesfully")
// const logDirectory=path.join(__dirname,'log')
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// const accessLogStream=fs.createWriteStream(path.join(logDirectory,'access.log',{flags:'a'}))
// const fileLoggerMiddleware=morgan('combined',{stream:accessLogStream})
// app.use(fileLoggerMiddleware)

if (!MONGO_URI) {
    console.error('MONGO_URI missing from .env');
    process.exit(1);
}

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // required for form parsing
app.use(checkAuthentication)
                                                            //explain
app.use("/user", signUproutes,);

app.use("/",checkAuthentication, staticRoute);
app.use("/url",restrictTo(["NORMAL","ADMIN"]),urlRoute)

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

app.listen(PORT, () => {
    console.log(` Server is running at http://localhost:${PORT}`);
});