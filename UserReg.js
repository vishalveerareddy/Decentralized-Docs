var mongoose=require('mongoose');
let emailSchema = new mongoose.Schema({
   Name:String,
   Password:String,
   Email:String,
   EthereumAddress:String
    
    
  })
  module.exports=mongoose.model('UserRegister',emailSchema)