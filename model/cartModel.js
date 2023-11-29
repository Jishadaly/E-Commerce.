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
  Total :Number
  
})

module.exports = mongoose.model('Cart',cartSchema);


// const cartSchema=new mongoose.Schema({
//   user:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'User',
//     required:true,
//   },
//   products:[
//     {
//         product:{
//             type:mongoose.Schema.Types.ObjectId,
//             ref:'product',
//             required:true,
//         },
//         quantity:{
//             type:Number,
//             default:1,
//         },
//         selected:{
//             type:Boolean, 
//             default:false,
//         },
//         price:Number,
//         subtotal:Number,
        
//     }
//   ],
//   total:Number,
//   selectedTotal:{
//     type:Number,
//     default:0,
//   },


// })