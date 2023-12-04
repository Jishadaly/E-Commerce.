const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  
  category:{
    type: String,
    required:true
  },
  
  image:{
    type:String,
    required:true
  },
  
  description:{
    type:String,
    require:true
  },
  listed:{
    type:Boolean,
    required:true
  },
 
   
});