const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true,
   
},
email:{
    type:String,
    required:true,
    
},
mobile:{
    type:String,
    required:true,
   
},
password:{
    type:String,
    required:true,
    
},
is_verified:{
    type:Boolean,
    default:false
    
},
is_blocked:{
    type:Boolean,
    default:false
},
date:{
    type:Date,
    default:Date.now()
},
walletAmount :{
    type:Number,
    default:0
},
referelCode:{
    type:Number
},
token:String,
tokenExpairy:Date
});


module.exports = mongoose.model('User',userSchema)

