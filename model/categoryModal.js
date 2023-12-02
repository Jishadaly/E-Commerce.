const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category:{
    type: String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  image:{
    type:String,
    required:true
  },
  date :{
    type:Date,
    default:Date.now()
  }
  
});

module.exports  = mongoose.model('category',categorySchema);

