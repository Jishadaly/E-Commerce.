const productModel = require('../model/productModal')
const orderModel = require('../model/orderModel')
const cartSchema = require('../model/cartModel');





async function confirmOrder(req,res){

  try {

      
     const userId = req.session.userId;
     const addressId = req.body.addressId;
     const paymentMethod = req.body.PaymentMethod;
     

     const cart = await cartSchema.findOne({user:userId}).populate('products.product')
      

     const order = {
      user : req.session.userId,
      address : addressId,
      paymentMethod: paymentMethod,
      products: cart.products.map((item)=> {
        return{
          product: item.product,
          quantity: item.quantity,
          price: item.product.price,
          total: item.subTotal,
          
        }
      }),
      grandTotal: cart.Total
     }
     
      await orderModel.insertMany(order);

      for (const item of cart.products) {
        const product = item.product;
        
        const updatedQuantity = product.quantity - item.quantity;
        const updatedOrders = product.orders + item.quantity;
        console.log(updatedOrders);
        console.log("//////////" +product.product);
        await productModel.findByIdAndUpdate(product._id, { quantity: updatedQuantity , orders:updatedOrders});
      }
        await cartSchema.findOneAndUpdate({ user: userId }, { $set: { products: [], Total: 0 } });
        res.status(200).json({message:"success"});
        

      } catch (error) {
        console.log(error);
      }
}



async function orderdetails(req,res){
  try {
    
    const orderId = req.query.orderId;
    const orderDetails = await orderModel.findById(orderId).populate('address').populate('products.product')
    res.render('orderDetails',{orderDetails})


  } catch (error) {
    console.log(error);
  }
}



async function canceOrder(req,res){
try {
 const orderId = req.body.orderId;
 
 const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { $set: { status: "Canceled" } });

 if(updatedOrder){
  res.status(200).json({ success: true, message: 'Order cancelled successfully' ,updatedOrder })
 }else{
  res.status(404).json({ success: false, message: 'Order not found or could not be cancelled' });
 }

} catch (error) {
  console.log(error);
}
}




async function loadOrderList(req,res){
  try {
    
    const orderData =  await orderModel.find().populate('address').sort({createdAt:-1})
     res.render('orderList',{orderData})
  } catch (error) {
    console.log(error);
  }
}



async function loadOrderDetails(req,res){
  try {

     const orderId = req.query.orderId;
     console.log(orderId);
     const orderDetails = await orderModel.findById(orderId).populate('address').populate('products.product')
     res.render('orderDetails',{ orderDetails })
  } catch (error) {
    console.log(error);
  }
}



async function orderStatus(req,res){
  try {
    console.log("inside::::::::orderstatus");
      const {orderId,status } = req.body;
  
      console.log('orderID::::'+orderId);
      console.log("status "+ status);
      // console.log(status,orderId);
      if (!status || !orderId) {
          return res.status(400).json({ error: 'Invalid input parameters' });
      }
      const updatedOrder = await orderModel.findByIdAndUpdate(
        { _id: orderId},
        { $set: { status: status } },
        { new: true }
    );
      console.log(updatedOrder);
      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ success: true });
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }

}


module.exports = {
  confirmOrder, orderdetails,
  canceOrder,orderStatus,
  loadOrderList, loadOrderDetails 
}