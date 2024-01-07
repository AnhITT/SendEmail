var mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: String,
});

schema.virtual('employees',{
    ref:'user',
    localField:'_id',
    foreignField:'department_k'
})
schema.set('toJSON',{virtuals:true});
schema.set('toObject',{virtuals:true});

module.exports = mongoose.model('department', schema);