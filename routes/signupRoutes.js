const express = require('express');
const { handleUserSignup, handleUserLogin,handleforgotPassword,handleverifyOTP,handleresetpassword} = require('../controller/signUpController');
const router = express.Router();
const multer=require('multer')
// const upload=multer({dest:'./uploads'})

// const storage=multer.diskStorage({
//     destination:function(req,file,cb){
//     cb(null,'./uploads')
//     },
//     filename:function(req,file,cb){
//        cb(null,Date.now()+ file.originalname) 
//     }
// })
// const upload=multer({storage})
const upload=multer({storage:multer.memoryStorage()})    //to handle the storage function
router.post('/createuser',upload.single('profile'), handleUserSignup);  //from form
router.post('/loginuser', handleUserLogin)
router.post('/forgotpassword', handleforgotPassword)
router.post('/verifyOTP',handleverifyOTP)
router.post('/resetpassword',handleresetpassword)
module.exports = router;
