var mongoose=require('mongoose');
let emailSchema = new mongoose.Schema({
    userid: String,
    hash:String,
    time:Date,
    size:Number,
    random:String
    
  })
  module.exports=mongoose.model('User',emailSchema)