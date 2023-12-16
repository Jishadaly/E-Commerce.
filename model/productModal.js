  const mongoose = require('mongoose');


  const productSchema = new mongoose.Schema({
    name:{
      required:true,
      type:String
    },
    description:{
    required:true,
    type:String
    },
    model:{
      required:true,
      type:String
    }, 
    screenSize:{
      // required:true,
      type:String
    },
    price:{
      required:true,
      type:Number
    },
    discountPrice:{
      required:true,
      type:Number
    },
    quantity:{
      required:true,
      type:Number
    },
    brand:{
      required:true,
      type:String
    },
    productImages:[{
      required:true,
      type:String
    }],
    ratings:[{
      // required:true,
      type:String
    }],
    ram:{
      required:true,
      type:String
    },
    rom:{
      required:true,
      type:String
    },
    processor:{
      required: true,
      type:String
    },
    list:{
      type:Boolean,
      default:true
    },
    orderDate:{
      type:Date,
      default:Date.now()
    },
    category:{
      
      required:true,
      type: String,

    },
    cart:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Cart'
    },
    featured : {
      type :String,
      default:"false"
    },
    orders: {
      type: Number,
      default: 0
    },
    offer:{
      type: Number,
      
    }
    
  });  


  module.exports = productModel = mongoose.model('Product',productSchema);

