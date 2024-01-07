var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const configs = require('../helper/configs');

//localhost:3000/

/* GET home page. */
router.get('/', function (req, res, next) {
  var token = req.headers.authorization;
  if (!token) {
    res.send({ "message": "Vui long dang nhap" });
    return;
  }
  if (token.startsWith("Bearer")) {
    token = token.split(" ")[1];
    try {
      var userID = jwt.verify(token,configs.SECRET_KEY);
      req.userID = userID.id;
      next();
    } catch (error) {
      res.send({ "message": "Vui long dang nhap" });
      return;
    }
  } else {
    res.send({ "message": "Vui long dang nhap" });
  }
}, function (req, res, next) {//get all
  res.send({ "done": req.userID });
});


module.exports = router;
