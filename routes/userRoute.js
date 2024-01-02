const express = require("express");
const user_route = express();
const auth = require('../middleware/authHandler');
const cart = require('../controller/cartController');
const orderController = require('../controller/orderController')
const downloadInvoice = require('../controller/downloadInvoice')


//move app.js
user_route.use(express.json());
user_route.use(express.urlencoded({ extended : true }));



// seting ejs
user_route.set('view engine','ejs')
user_route.set('views','./view/user');

//connecting the controller
const userController = require("../controller/userController");
const product = require("../controller/productController")


//api
user_route.get('/register',userController.loadRegister);
user_route.post('/register',userController.insertUser);
user_route.get('/otpVerification',userController.loadOtpVerification);
user_route.post('/verify',userController.verifyOtp);
user_route.get('/resendOtp',userController.resendOtp)
user_route.get('/login',userController.loadLogin);
user_route.get('/logOut',auth.isLogin,auth.isLogOut);
user_route.post('/login',userController.verifyLogin);
user_route.get('/',userController.loadHome);
user_route.get('/about',userController.aboutUs);
user_route.get('/contact',userController.contactUs);
user_route.get('/forgotPassword',userController.forgotPasswordEmail);
user_route.post('/forgotPassword',userController.verify_forgotPasswordEmail);
user_route.get('/addForgotPassword',userController.getAddForgotPass);
user_route.post('/addForgotPassword',userController.postAddForgotPass);

//products
user_route.get('/ProductDetails',product.loadProductDetails);

//cart -// checkout
user_route.get('/cartPage',auth.isLogin,auth.isBlocked,cart.loadCart);
user_route.get('/cart',cart.addToCart);
user_route.get('/removeproduct',cart.removeProduct)
user_route.post('/updateCart',cart.updateSubTotal)
user_route.get('/checkout',auth.isLogin,auth.isBlocked,userController.loadCheckout)
user_route.post('/orderConfirm',orderController.confirmOrder)
user_route.get('/success-page',userController.successPage)
user_route.get('/products',product.loadProducts);
user_route.post('/products',product.loadProducts)
user_route.post('/changePassword',userController.changePassword)


user_route.get('/dashBoard',auth.isLogin,auth.isBlocked,userController.loadDashboard)
user_route.post('/address',userController.addNewAddress)
user_route.get('/deleteAddress',userController.deleteAddress)
user_route.get('/orderdetails',auth.isLogin,auth.isBlocked,orderController.orderdetails);
user_route.post('/cancelOrder',orderController.cancelOrder);
user_route.post('/updatedPayment',orderController.updatedPayment);
user_route.post('/applyCoupon',orderController.applyCoupon);
user_route.get('/removeCoupon',orderController.removeCoupon)
user_route.get('/downloadInvoice',downloadInvoice.downloadInvoice);
user_route.get('/sendReferel',userController.shareReferel);
// user_route.post('/productFiltering',product.filterProduct);




module.exports=user_route;
