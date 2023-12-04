const mongoose = require('mongoose');

const orderSchema=new mongoose.Schema({
  user:
  {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
  },
  address:
  {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Address',
      required: true,
  },
  products:[
  {
      product:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'Product',
          // required:true,
      }, 
      quantity:{
          type:Number,
          default:1,
      },
      price:{
          type:Number,
          required:true,
      },
      total:Number,
      returnStatus:{
         type:String,
      }
  }],
  paymentMethod: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered','Cancelled','Out for Delivery','Confirmed'],
      default: 'Pending',
    },
    createdAt:{
      type:Date,
      default:Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    grandTotal:Number,
    cancelRequest:{
      type:Boolean,
      default:false,
    },
    reason:String,
    response:Boolean, 
    payment_id:String,
    payment_status:{
      type:Boolean,
      default:false,
    },
    order_Id:String,

})


module.exports = mongoose.model('Order',orderSchema);