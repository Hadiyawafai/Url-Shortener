const User =require('../model/signUpModel')
const { setUser} = require("../services/auth");
const bcrypt=require('bcryptjs')
const nodemailer=require('nodemailer')
require('dotenv').config();    //import .env
const jwt=require('jsonwebtoken')
const logger=require('../services/logs')
const path = require('path');
const fs = require('fs');

async function handleUserSignup(req, res) {
  try{
  const salt=bcrypt.genSaltSync(10)
   console.log("salt",salt);

  const password=bcrypt.hashSync(req.body.password,salt)    //hash
    const { username, email } = req.body;
    // const profile=req.file.filename;
    const file=req.file;
     if (!username || !password || !email ||!file) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const user=await User.findOne({$or:[{username},{email}]})
        if(user){
          return res.render('signUp',{error:"username or email already exists"})
        }
        const uploadsDir=path.join(__dirname,"../uploads")
        if(!fs.existsSync(uploadsDir)){
          fs.mkdirSync(uploadsDir,{recursive:true})
        }

        const profile=Date.now() + "-" + file.originalname;
        const filepath=path.join(uploadsDir,profile)
        fs.writeFileSync(filepath,file.buffer)

    await User.create({
        username, 
        email,
        password,
        profile
    });
    return res.render('login',{message:"login successful",error:null});}
    catch(error){
      logger.error("there is error in sighup controller",error)
      // return res.status(500).json({error:"username or email already exists"})
      return res.redirect('signUp',{error:error})
    }

}
async function handleUserLogin(req, res){

    const { username } = req.body;
  const user = await User.findOne({ username});
  if (!user || !bcrypt.compareSync(req.body.password,user.password))
    return res.render("login", {
      error: "Invalid Username or Password",
      message:null
    });

  const token=setUser(user);
  res.cookie("uid",token)
  return res.redirect("/");
}

async function handleforgotPassword(req, res){
const {email} =req.body;
console.log(email);
if(!email) return res.status(400).json({error:"email is required"})
const user=await User.findOne({email})
console.log(user);
if(!user) return res.status(400).json({error:"email is invalid"})
const transporter=nodemailer.createTransport({
  host:"smtp.gmail.com",
  port:465,
  secure:true,
  auth:{
    user:process.env.email_user,
    pass:process.env.email_pass
  }
});

  let otp= Math.floor(1000 + Math.random()*9000).toString();
  user.passwordResetToken=otp;
  user.passwordResetExpires=Date.now() + 10*60*1000;
  await user.save()

const info=await transporter.sendMail({
from:"ilssrinagar8@gmail.com",
to:user.email,
subject:"OTP for password reset",
text:`your OTP is:${otp}`,
})
res.render("verifyOTP",{email:user.email})
}

async function handleverifyOTP(req,res){
const {otp,email}=req.body
const user=await User.findOne({email,passwordResetToken:otp,passwordResetExpires:{$gt:Date.now()}})
const authToken=jwt.sign({email:user.email},process.env.JWT_SECRET,{expiresIn:'10m'})
if(!user) return res.status(400).json({error:"invalid user"})
  return res.render("resetpassword",{authToken: authToken});
}

async function handleresetpassword(req,res){
const {newpassword,confirmpassword, authToken}=req.body
if(!newpassword || !confirmpassword) return res.status(400).json({error:"both are required"})
if(newpassword!==confirmpassword) return res.status(400).json({error:"passwords do not match"})
  try{
const decoded=jwt.verify(authToken,process.env.JWT_SECRET);
const user=await User.findOne({email: decoded.email})
if(!user) return res.status(400).json({error:"invalid user"})
const salt=bcrypt.genSaltSync(10)
const Newpassword=bcrypt.hashSync(newpassword,salt)
user.password=Newpassword
await user.save()
store={otp:null,email:null}
return res.redirect('/login')
} catch(err){
  return res.status(401).json({error:"invalid or expired token"})
}
}

module.exports = { handleUserSignup, handleUserLogin,handleforgotPassword,handleverifyOTP,handleresetpassword }