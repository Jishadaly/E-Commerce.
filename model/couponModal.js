
const mongoose =require('mongoose');


const couponSchema = new mongoose.Schema({
  name: String,
  Couponcode:String,
  discount: Number,
  expiry: Date,
  createdAt:{
    type: Date,
    default: Date.now,
  },
  status: {
      type: Boolean,
      default: false,
  },
  minimumCartTotal:Number,
  usedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' 
  }]

});

module.exports = mongoose.model('Coupon',couponSchema);
