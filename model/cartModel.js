const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    require:true,

  },
  products:[
    {
      product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product'
      },
      quantity:{
        type:Number,
        default:1,
      },
      subTotal:Number,
    },
   
  ],
  Total :Number,
  appliedCoupon:Number,
  
})

module.exports = mongoose.model('Cart',cartSchema);

