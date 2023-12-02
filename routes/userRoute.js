const express = require("express");
const user_route = express();
const auth = require('../middleware/authHandler');
const cart = require('../controller/cartController');



//move app.js

user_route.use(express.json());
user_route.use(express.urlencoded({ extended : true }));


//setting session

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
user_route.get('/',auth.isLogin,auth.isBlocked,userController.loadHome);

//products
user_route.get('/ProductDetails',auth.isLogin,auth.isBlocked,product.loadProductDetails);

//cart -// checkout
user_route.get('/cartPage',auth.isLogin,auth.isBlocked,cart.loadCart);
user_route.get('/cart',cart.addToCart);
user_route.get('/removeproduct',cart.removeProduct)
user_route.post('/updateCart',cart.updateSubTotal)
user_route.get('/checkout',auth.isLogin,auth.isBlocked,userController.loadCheckout)
user_route.post('/orderConfirm',userController.confirmOrder)
user_route.get('/success-page',userController.successPage)
user_route.get('/products',auth.isLogin,auth.isBlocked,product.loadProducts);
user_route.post('/changePassword',userController.changePassword)



user_route.get('/dashBoard',auth.isLogin,auth.isBlocked,userController.loadDashboard)
user_route.post('/address',userController.addNewAddress)
user_route.post('/editAddress',userController.editAddress);
user_route.get('/orderdetails',auth.isLogin,auth.isBlocked,userController.orderdetails);
user_route.post('/cancelOrder',userController.canceOrder);


module.exports=user_route;
