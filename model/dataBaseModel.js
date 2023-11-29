// const mongoose = require("mongoose");



// const userSchema = new mongoose.Schema({
//   name:{
//     type:String,
//     required:true,
   
// },
// email:{
//     type:String,
//     required:true,
    
// },
// mobile:{
//     type:String,
//     required:true,
   
// },
// password:{
//     type:String,
//     required:true,
    
// },
// is_verified:{
//     type:Boolean,
//     default:false
    
// },
// is_blocked:{
//     type:Boolean,
//     default:false
// }
// });

// const adminSchema = new mongoose.Schema({
//   name:{
//     type: String,
//     required:true
//   },
  
//   email:{
//     type:String,
//     required:true
//   },
//   password:{
//     type:String,
//     required:true
//   }
  
// });


// const categorySchema = new mongoose.Schema({
  
//     category:{
//       type: String,
//       required:true
//     },
    
//     image:{
//       type:String,
//       required:true
//     },
    
//     description:{
//       type:String,
//       require:true
//     },
//     listed:{
//       type:Boolean,
//       required:true
//     },
     
//   });


// const productSchema = new mongoose.Schema({
//   name:{
//     required:true,
//     type:String
//   },
//   description:{
//    required:true,
//    type:String
//   },
//   model:{
//     required:true,
//     type:String
//   }, 
//   screenSize:{
//     // required:true,
//     type:String
//   },
//   price:{
//     required:true,
//     type:Number
//   },
//   discountPrice:{
//     required:true,
//     type:Number
//   },
//   quantity:{
//     required:true,
//     type:Number
//   },
//   brand:{
//     required:true,
//     type:String
//   },
//   productImages:[{
//     required:true,
//     type:String
//   }],
//   ratings:[{
//     // required:true,
//     type:String
//   }],
//   ram:{
//     required:true,
//     type:String
//   },
//   rom:{
//     required:true,
//     type:String
//   },
//   processor:{
//     required: true,
//     type:String
//   },
//   list:{
//     type:Boolean,
//     default:true
//   },
//   orderDate:{
//     type:Date,
//     default:Date.now()
//   },
//   category:{
//     required:true,
//     type: mongoose.Schema.Types.ObjectId,
//     ref:'category',
//   },
//   cart:{
//     type:mongoose.Schema.Types.ObjectId,
//     ref:'Cart'
//   }
  
// });  


// const userModel =  mongoose.model('User', userSchema);
// const categories = mongoose.model('category',categorySchema);
// const adminModel = mongoose.model('Admin',adminSchema);
// const productModel = mongoose.model('Product',productSchema)

// module.exports = { userModel, categories ,adminModel ,productModel }
