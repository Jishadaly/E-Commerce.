const productModel = require('../model/productModal')
const orderModel = require('../model/orderModel')
const cartSchema = require('../model/cartModel');
const Razorpay = require('razorpay');
const userModal = require('../model/userModal');
const transactionModal = require('../model/transactionModal');
const couponModal = require('../model/couponModal');
require('dotenv').config();

async function orderdetails(req, res) {
  try {

    const user = req.session.userId;
    const orderId = req.query.orderId;
    const orderDetails = await orderModel.findById(orderId).populate('address').populate('products.product');
    res.render('orderDetails', { orderDetails, user })

  } catch (error) {
    console.log(error);
  }
}




async function loadOrderList(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const ordersPerPage = 10;

    const totalCount = await orderModel.countDocuments();

    const totalPages = Math.ceil(totalCount / ordersPerPage);

    const skip = (page - 1) * ordersPerPage;

    const orderData = await orderModel.find()
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(ordersPerPage);

    res.render('orderList', {
      orderData,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}




async function loadOrderDetails(req, res) {
  try {

    const orderId = req.query.orderId;
    console.log(orderId);
    const orderDetails = await orderModel.findById(orderId).populate('address').populate('products.product')
    res.render('orderDetails', { orderDetails })
  } catch (error) {
    console.log(error);
  }
}



async function orderStatus(req, res) {
  try {
    console.log("inside::::::::orderstatus");
    const { orderId, status } = req.body;

    console.log('orderID::::' + orderId);
    console.log("status " + status);
    if (!status || !orderId) {
      return res.status(400).json({ error: 'Invalid input parameters' });
    }
    const updatedOrder = await orderModel.findByIdAndUpdate(
      { _id: orderId },
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



async function createRazorpayOrder(amount) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.keyId,
      key_secret: process.env.keySecret
    });

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: process.env.receipt,
      payment_capture: 1

    };

    const order = await razorpay.orders.create(options);
    return order;

  } catch (error) {
    console.log(error);
  }
}



async function confirmOrder(req, res) {

  try {

    const userId = req.session.userId;
    const addressId = req.body.addressId;
    const paymentMethod = req.body.PaymentMethod;
    console.log(paymentMethod);
    const userData = await userModal.findById(userId)
    const walletAmount = userData.walletAmount;

    const cart = await cartSchema.findOne({ user: userId }).populate('products.product')

    if (paymentMethod === 'Pay on Delivery (Cash/Card).') {

      const order = {
        user: req.session.userId,
        address: addressId,
        paymentMethod: paymentMethod,
        products: cart.products.map((item) => {
          return {
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
        console.log("//////////" + product.product);
        await productModel.findByIdAndUpdate(product._id, { quantity: updatedQuantity, orders: updatedOrders });
      }
      await cartSchema.findOneAndUpdate({ user: userId }, { $set: { products: [], Total: 0 } });
      res.status(200).json({ message: "success" });

    } else if (paymentMethod === 'razorPay') {
      try {
        const rezorpayOrder = await createRazorpayOrder(cart.Total);

        res.status(201).json({
          message: "success",
          orderId: rezorpayOrder.id,
          amount: rezorpayOrder.amount,
          currency: rezorpayOrder.currency
        })

      } catch (error) {
        console.log(error);
      }

    } else if (paymentMethod === 'wallet') {
      if (walletAmount >= cart.Total) {

        const order = {
          user: req.session.userId,
          address: addressId,
          paymentMethod: paymentMethod,
          products: cart.products.map((item) => {
            return {
              product: item.product,
              quantity: item.quantity,
              price: item.product.price,
              total: item.subTotal,

            }
          }),
          grandTotal: cart.Total
        }

        await orderModel.insertMany(order);

        const newWalletAmount = walletAmount - cart.Total;
        console.log("///////////" + newWalletAmount);
        userData.walletAmount = newWalletAmount;
        await userData.save();

        for (const item of cart.products) {
          const product = item.product;

          const updatedQuantity = product.quantity - item.quantity;
          const updatedOrders = product.orders + item.quantity;
          console.log(updatedOrders);
          console.log("//////////" + product.product);
          await productModel.findByIdAndUpdate(product._id, { quantity: updatedQuantity, orders: updatedOrders });
        }
        await cartSchema.findOneAndUpdate({ user: userId }, { $set: { products: [], Total: 0 } });
        res.status(200).json({ message: "success" });

      } else {
        res.status(204).json({ message: "Insufficient Balance" });
      }
    } else {
      console.log("not");
    }



  } catch (error) {
    console.log(error);
  }
}



async function updatedPayment(req, res) {
  try {
    const { PaymentMethod, paymentDetails, address } = req.body;
    console.log("////" + PaymentMethod);
    console.log(req.body);

    const paymentId = paymentDetails.razorpay_payment_id;
    const orderId = paymentDetails.razorpay_order_id;
    const userId = req.session.userId;
    console.log(userId);

    const cart = await cartSchema.findOne({ user: userId }).populate('products.product');

    const order = {
      user: userId,
      address: address,
      paymentMethod: PaymentMethod,
      payment_Id: paymentId,
      order_Id: orderId,
      products: cart.products.map((item) => {
        return {
          product: item.product,
          quantity: item.quantity,
          price: item.product.price,
          total: item.subTotal,

        }
      }),
      grandTotal: cart.Total
    }

    const insertedData = await orderModel.insertMany(order);

    const transfer = {
      user: userId,
      amount: paymentDetails.amount,
      paymentMethod: PaymentMethod,
      type: "debited",
      orderId: orderId

    }


    await transactionModal.insertMany(transfer);

    for (const item of cart.products) {
      const product = item.product;

      const updatedQuantity = product.quantity - item.quantity;
      const updatedOrders = product.orders + item.quantity;
      await productModel.findByIdAndUpdate(product._id, { quantity: updatedQuantity, orders: updatedOrders });

    }
    await cartSchema.findOneAndUpdate({ user: userId }, { $set: { products: [], Total: 0 } });
    res.status(201).json({ message: "success" });

  } catch (error) {
    console.log(error);
  }
}




async function cancelOrder(req, res) {

  try {
    const orderId = req.body.orderId;
    let updatedOrder = await orderModel.findByIdAndUpdate(orderId, { $set: { status: "Canceled" } }).populate('products.product');
    const userData = await userModal.findById(req.session.userId);

    if (updatedOrder.paymentMethod === 'razorPay') {

      const walletUpdating = updatedOrder.grandTotal + userData.walletAmount;
      userData.walletAmount = walletUpdating;
      await userData.save();

      const transfer = {
        user: userId,
        amount: paymentDetails.amount,
        paymentMethod: PaymentMethod,
        type: "credited",
        orderId: orderId

      }
      await transactionModal.insertMany(transfer)

    } else {
     
      const walletUpdating = updatedOrder.grandTotal + userData.walletAmount;
      userData.walletAmount = walletUpdating;
      await userData.save();

      const transfer = {
        user: userData._id,
        amount: updatedOrder.grandTotal,
        paymentMethod: updatedOrder.paymentMethod,
        type: "credited",
        orderId: orderId

      }
      await transactionModal.insertMany(transfer)

    }

    for (const item of updatedOrder.products) {
      const product = item.product;

      const updatedQuantity = product.quantity + item.quantity;
      const updatedOrders = product.orders - item.quantity;
      await productModel.findByIdAndUpdate(product._id, { quantity: updatedQuantity, orders: updatedOrders });
    }


    if (updatedOrder) {
      res.status(200).json({ success: true, message: 'Order cancelled successfully', updatedOrder })
    } else {
      res.status(404).json({ success: false, message: 'Order not found or could not be cancelled' });
    }

  } catch (error) {
    console.log(error);
  }
}



async function returnRequest(req, res) {
  try {
    const { orderId, reason } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { $set: { returnRequest: 'requested', reason: reason } });

    res.status(200).json({ success: true, message: 'Return request submitted successfully.' });
  

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Failed to process the return request.' });
  }
}

async function loadReturnOrderList(req, res) {
  try {
    const returnedOrders = await orderModel.find({ returnRequest: 'requested' })
    res.render('returnOrdersList', { returnedOrders });
  } catch (error) {
    console.log(error);
  }
}
async function loadReturnOrderDetails(req, res) {

  try {
    const orderId = req.query.orderId;
    const order = await orderModel.findById(orderId).populate('address').populate('products.product')

    res.render('returnOrderDetails', { order })
  } catch (error) {
    console.log(error);
  }
}

async function returnResponse(req, res) {
  try {


    const { status, orderId } = req.body;
    const updatedStatus = await orderModel.findByIdAndUpdate(orderId, { $set: { returnRequest: status } }).populate('products.product')
    const userData = await userModal.findOne({ _id: updatedStatus.user })
    console.log(userData);

    if (status === "accepted") {

      const walletUpdating = updatedStatus.grandTotal + userData.walletAmount;
     
      userData.walletAmount = walletUpdating;
      await userData.save();
    

      const transaction = {
        user: updatedStatus.user,
        amount: updatedStatus.grandTotal,
        paymentMethod: updatedStatus.paymentMethod,
        type: 'Credited'
      }
      await transactionModal.insertMany(transaction);
      for (const item of updatedStatus.products) {
        const product = item.product;

        const updatedQuantity = product.quantity + item.quantity;
        const updatedOrders = product.orders - item.quantity;
        await productModel.findByIdAndUpdate(product._id, { quantity: updatedQuantity, orders: updatedOrders });
      }

    }
    res.status(200).json({ success: true, message: "Operation completed successfully" });
    console.log(updatedStatus);
  } catch (error) {
    console.log(error);
  }
}



async function applyCoupon(req, res) {
  try {
    const enteredCode = req.body.couponCode;
    const coupon = await couponModal.findOne({ Couponcode: enteredCode });
    const user = req.session.userId;
    const userCart = await cartSchema.findOne({ user: user });

    if (coupon) {
     
      const isCouponUsedByUser = await couponModal.aggregate([
        {
          $match: { _id: coupon._id }
        },
        {
          $project: {
            isUsedByUser: {
              $in: [userCart._id, "$usedBy"]
            }
          }
        }
      ]);

      if (isCouponUsedByUser.length > 0 && isCouponUsedByUser[0].isUsedByUser) {
        return res.render('checkout', { message: "You have already applied this coupon", user });
      } else {
        const newTotal = userCart.Total - coupon.discount;
        userCart.Total = newTotal;
        userCart.appliedCoupon = coupon.Couponcode;

        await userCart.save();

      
        await couponModal.findByIdAndUpdate(
          coupon._id,
          { $push: { usedBy: userCart._id } },
          { new: true }
        );
      }

    } else {
      return res.render('checkout', { message: "Coupon not found or user cart not available", user });
    }
    return res.redirect('/checkout');
  } catch (error) {
    console.log(error);
    return res.render('checkout', { message: "An error occurred", user });
  }
}



async function removeCoupon(req, res) {

  try {
    const appliedCoupon = req.query.CouponCode;
    console.log(req.query);
    const coupon = await couponModal.findOne({ Couponcode: appliedCoupon });
    const user = req.session.userId;
    const userCart = await cartSchema.findOne({ user: user });
    

    if (coupon) {
      const newTotal = userCart.Total + coupon.discount;
  
      userCart.Total = newTotal;
      userCart.appliedCoupon = '';

      await userCart.save();
      console.log(userCart + "////////////////");

      await couponModal.findByIdAndUpdate(
        coupon._id,
        { $pull: { usedBy: user } },
        { new: true }
      );


    } else {
      res.render('checkout', { message: "noooo" })
    }
   

    res.redirect('/checkout')

  } catch (error) {
    console.log(error);
  }
}




module.exports = {

  confirmOrder, orderdetails,
  cancelOrder, orderStatus,
  loadOrderList, loadOrderDetails, updatedPayment,
  returnRequest, loadReturnOrderList, loadReturnOrderDetails,
  returnResponse, applyCoupon, removeCoupon

}