// const { userModel , productModel , categories} = require('../model/dataBaseModel');
const {userModel : User } = require('../model/userModal')
const productModel = require('../model/productModal')
const categories = require('../model/cartModel');
const cartSchema = require('../model/cartModel');
const addressModel = require('../model/addressModel');
const addAddressModel = require('../model/addressModel')
const userModel = require('../model/userModal')
const couponModal = require('../model/couponModal');
const transactionModal = require('../model/transactionModal')

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { assign } = require('nodemailer/lib/shared');
const randomstring = require("randomstring");
const orderModel = require('../model/orderModel');
const { json } = require('express');
require('dotenv').config()



// becript the password for more security
const securePassword = async(password)=>{

          try{
            const passwordHash = await bcrypt.hash(password , 10);
            return passwordHash;
          } catch(error){
            console.log(error.message);
          }
}


const loadRegister = async (req, res) => {

          try {
            res.render('registration',{message:""})
          } catch (error) {
            console.log(error.message);
          }
}


          // setting otp function
          function generateOtp(){
            return randomstring.generate({
              length: 4,
              charset:'numeric',
            })
}


//send the otp via email
function sendOtp(email, otp) {

            const  Email=email;
            const mailOptions = {
            from: process.env.emailAddress,
            to: Email,
            subject: 'Your otp for registering at LapBook',
            text: `your otp for verification is ${otp}`
};

const transporter = nodemailer.createTransport({

            service: 'gmail',
            auth: {
            user: process.env.emailAddress,
            pass: 'dffm iwlp gffg gwby'
            }
});

  transporter.sendMail(mailOptions, (error, info) => {

            if (error) {
            console.error('Error sending email: ' + error);
            } else {
            console.log('Email sent: ' + info.response);
            }
            });
}



//adding user from the sign up page

const insertUser = async (req, res) => {
  try {
    const { name, email, mno, password } = req.body;
    

    const checkEmail = await userModel.findOne({ email: email });
    console.log(checkEmail);

    if (checkEmail && checkEmail.email === email) {
      
      res.render('registration', { message: "This account id already exists" });
    } else {
      console.log("Entered this block");

      const user = userModel({
        name: name,
        email: email,
        mobile: mno,
        password: password
      });

      console.log(user);

      req.session.userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        password: user.password
      };

      const otp = generateOtp();
      console.log("||||||||||" + otp + "|||||||||");
      req.session.otp = otp;
      
       sendOtp(req.body.email, otp);
      res.redirect('/otpVerification');
    }
  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately, such as sending an error response
    res.status(500).send("Internal Server Error");
  }
};


const resendOtp = async (req, res) => {
  try {
   
    const userEmail = req.session.userData.email; 
    
    const otp = generateOtp();
    console.log("||||||||||" + otp + "|||||||||");
    
    req.session.otp = otp;
    
     sendOtp(userEmail, otp); 
    res.redirect('/otpVerification');
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error resending OTP: Internal Server Error");
  }
};



const loadOtpVerification = async(req,res)=>{

            try {
            res.render('otpVerification',{message:""})
            } catch (error) {
            console.log(error.message)
            }
}

const verifyOtp = async(req,res)=>{

            try {
            const enteredOtp = req.body.otp;
            const stroredOtp = req.session.otp;
            console.log(stroredOtp);

            if( enteredOtp == stroredOtp ){
            delete req.session.otp;
            const userData = req.session.userData;
            const spassword = await securePassword(userData.password);

            const users= userModel({
            name:userData.name,
            email:userData.email,
            mobile:userData.mobile,
            password:spassword,
            is_verified:is_verified=true

            });

            await users.save();

            res.redirect('/')

            }else{
            res.render('otpVerification',{message:"enterd otp is icurrect"})
            console.log();
            }
            } catch (error) {
            console.log(error.message,{ errorMessage: 'Invalid OTP. Please try again.' });
            }
     
}




//login
const loadLogin = async (req,res)=>{

            try {
              res.render('login',{message:""})
            } catch (error) {
            console.log(error.message);
           
            }
}





  const verifyLogin = async (req, res) => {

            try {
              console.log("enterd")
            const email = req.body.email;
            const password = req.body.password;         
            const userData = await userModel.findOne({ email: email });
            console.log(userData.password);
            const passwordmatch =  await bcrypt.compare(password, userData.password);
            
            if(userData.is_verified === true && userData.is_blocked === false){
              if (passwordmatch) {
                 console.log("auth is succes");
                 console.log(userData.password);
                 req.session.userId = userData._id;
                
                res.redirect('/')
                } else { 
                res.render('login', { message: "Password is incorrect" });
                console.log("User data: Password is incorrect");
                }
            }else{
              res.render('login', { message: "Sorry, you are not allow to access with this account" });
            }
          
            } catch (error) {
            console.error(error.message);
            }
  };



 const loadHome = async (req,res)=>{
              try{
              const Bestproduct = await productModel.find({list:true}).sort({orders:-1}).limit(4);
              const featuredProduct = await productModel.find({list:true,featured:true});
              const cart =await cartSchema.findOne({user:req.session.userId});
              const category = await categories.find({listed:true})
              console.log(category);
                 res.render('home',{Bestproduct,featuredProduct,cart,category});

              }catch(error){
              console.log(error.message);
              }
 }







async function loadCheckout(req,res){
      try {

        const userid = req.session.userId;
        const cart = await cartSchema.findOne({user:userid}).populate('products.product');
        console.log(cart);
        const address = await addressModel.find({user:userid})
        const coupon = await couponModal.find({minimumCartTotal:{$lte:cart.Total},status:true});
        
        
        res.render('checkout',{cart,address,coupon})
        

      } catch (error) {
        console.log(error);
      }
}



async function loadDashboard(req,res){
    try {

      const userid =req.session.userId;
      const user = await userModel.findById(userid);
      const address = await addAddressModel.find({user:user})
      const orderDetails = await orderModel.find({user:userid}).sort({createdAt:-1});
      const transactions = await transactionModal.find({ user: userid, type: 'Credited' }).sort({ date: -1 });
      res.render('dashboard',{user,address,orderDetails,transactions});
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


// async function canceOrder(req,res){
//   try {
//    const orderId = req.body.orderId;
   
//    const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { $set: { status: "Canceled" } });

//    if(updatedOrder){
//     res.status(200).json({ success: true, message: 'Order cancelled successfully' ,updatedOrder })
//    }else{
//     res.status(404).json({ success: false, message: 'Order not found or could not be cancelled' });
//    }

//   } catch (error) {
//     console.log(error);
//   }
// }



async function addNewAddress(req,res){
  try {

    console.log(req.body);
    const {name , phone , street , houseNo , city , country , pincode , landmark , email } = req.body;

     const addAddress = {
      
        user:req.session.userId,
        name:name,
        phone:phone,
        email:email,
        houseNo:houseNo,
        street:street,
        landmark:landmark,
        pincode:pincode,
        city:city,
        country:country,

     }

     await addressModel.insertMany(addAddress);
     res.status(200).json({ message: 'Address added successfully' });
     

  } catch (error) {
    console.log(error);
  }
}


async function editAddress(req,res){
  try {

     const addressId = req.query.addressId;
     console.log(addressId);

  } catch (error) {
    console.log(error);
  }
}






async function changePassword(req, res) {
  try {

    const userId = req.session.userId;
    console.log("session", userId);

    const { email, curPassword, cPassword } = req.body;
    const spassword = await securePassword(cPassword);
    

    let userData = await userModel.findOne({ _id: userId });

         
              const passwordMatch = await bcrypt.compare(curPassword, userData.password);

              if (passwordMatch) {
                userData.password = spassword;
                await userData.save();
                console.log("Password changed successfully");
                req.session.destroy();
                return res.redirect('/login');
              } else {
                console.log("Current password does not match");
              }
            

  } catch (error) {
    console.log(error);
    
  }
}



// async function confirmOrder(req,res){

//   try {

      
//      const userId = req.session.userId;
//      const addressId = req.body.addressId;
//      const paymentMethod = req.body.PaymentMethod;
     

//      const cart = await cartSchema.findOne({user:userId}).populate('products.product')
      

//      const order = {
//       user : req.session.userId,
//       address : addressId,
//       paymentMethod: paymentMethod,
//       products: cart.products.map((item)=> {
//         return{
//           product: item.product,
//           quantity: item.quantity,
//           price: item.product.price,
//           total: item.subTotal,
          
//         }
//       }),
//       grandTotal: cart.Total
//      }
     
//       await orderModel.insertMany(order);

//       for (const item of cart.products) {
//         const product = item.product;
        
//         const updatedQuantity = product.quantity - item.quantity;
//         const updatedOrders = product.orders + item.quantity;
//         console.log(updatedOrders);
//         console.log("//////////" +product.product);
//         await productModel.findByIdAndUpdate(product._id, { quantity: updatedQuantity , orders:updatedOrders});
//       }
//         await cartSchema.findOneAndUpdate({ user: userId }, { $set: { products: [], Total: 0 } });
//         res.status(200).json({message:"success"});
        

//       } catch (error) {
//         console.log(error);
//       }
// }


async function successPage(req,res){
  try {
    res.render('successPage')
  } catch (error) {
    console.log(error);
  }
}





module.exports={

  loadRegister,
  insertUser,
  loadOtpVerification,
  verifyOtp,
  loadLogin,
  verifyLogin,
  loadHome,
  loadCheckout,
  addNewAddress,
  loadDashboard,
  // confirmOrder,
  successPage,
  changePassword,
  resendOtp,
  // orderdetails,
  // canceOrder,
  editAddress
  
  
  
}

