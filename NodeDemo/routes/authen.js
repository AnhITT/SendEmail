var express = require('express');
const { model } = require('mongoose');
const { use } = require('.');
var router = express.Router();
var responseData = require('../helper/responseData');
var modelUser = require('../models/user')
var validate = require('../validates/user')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const configs = require('../helper/configs');
const sendmail = require('../helper/sendmail');
const { checkLogin } = require('../middlewares/protect');

router.post('/register', validate.validator(),
  async function (req, res, next) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      responseData.responseReturn(res, 400, false, errors.array().map(error => error.msg));
      return;
    }
    var user = await modelUser.getByName(req.body.userName);
    if (user) {
      responseData.responseReturn(res, 404, false, "user da ton tai");
    } else {
      const newUser = await modelUser.createUser({
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
      })
      responseData.responseReturn(res, 200, true, newUser);
    }
  });
router.post('/login', async function (req, res, next) {
  var result = await modelUser.login(req.body.userName, req.body.password);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  var token = result.getJWT();
  res.cookie('tokenJWT',token,{
    expires:new Date(Date.now()+2*24*3600*1000),
    httpOnly:true
  });
  responseData.responseReturn(res, 200, true, token);
});

router.get('/logout', async function(req, res, next){
  res.cookie('tokenJWT','none',{
    expires:new Date(Date.now()+1000),
    httpOnly:true
  });
  responseData.responseReturn(res, 200, true, 'logout thanh cong');
})


router.get('/me', async function(req, res, next){
  var result = await checkLogin(req);
  if(result.err){
    responseData.responseReturn(res, 400, true, result.err);
    return;
  }
  console.log(result);
  req.userID = result;
  next();
},
// async function(req, res, next){
//   var user = await modelUser.getOne(req.userID);
//   var role = user.role;
//   console.log(role);
//   var DSRole = ['admin','publisher'];
//   if(DSRole.includes(role)){
//     next();
//   }
//   else{
//     responseData.responseReturn(res, 403, true,"ban khong du quyen");
//   }
// },
 async function (req, res, next) {//get all
  var user = await modelUser.getOne(req.userID);
  res.send({ "done": user});
});

router.post('/forgetPassword', async function(req, res, next){
  var email = req.body.email;
  var user = await modelUser.getByEmail(email);
  if(!user){
    return ;//return loi
  }
  console.log(user);
  user.addTokenForgotPassword();
  await user.save();
  try {
    sendmail.send(user.email,user.tokenForgot);
    responseData.responseReturn(res, 200, true,'gui mail thanh cong');
  } catch (error) {
    user.tokenForgot = undefined;
    user.tokenForgotExp = undefined;
    responseData.responseReturn(res, 400, true,'gui mail loi vui long thu lai'+error);
  }  
  return;
})

router.post('/resetPassword/:token', async function(req, res, next){
   var token = req.params.token;
   var password = req.body.password;
   var user = await modelUser.getByTokenForgot(token);
   user.password = password;
   user.tokenForgot = undefined;
   user.tokenForgotExp = undefined;
   await user.save();
})

module.exports = router;
