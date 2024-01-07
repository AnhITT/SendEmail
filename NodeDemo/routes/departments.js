var express = require('express');
var router = express.Router();
var SchemaDepartment = require('../schema/deparment');
var responseData = require('../helper/responseData');

router.get('/', async function (req, res, next) {
  var allDepartment = await SchemaDepartment.find({})
  .populate({path:'employees',select:'_id userName'});
  responseData.responseReturn(res, 200, true, allDepartment);
});

module.exports = router;