
const mongoose =require('mongoose');


const couponSchema = new mongoose.Schema({
  name: String,
  discount: Number,
  expiry: Date,
  status: {
      type: Boolean,
      default: false,
  },
  minimumCartTotal:Number
});

module.exports = mongoose.model('Coupon',couponSchema);