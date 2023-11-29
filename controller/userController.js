// const { userModel , productModel , categories} = require('../model/dataBaseModel');
const {userModel : User } = require('../model/userModal')
const productModel = require('../model/productModal')
const categories = require('../model/cartModel');
const cartSchema = require('../model/cartModel');
const addressModel = require('../model/addressModel');
const addAddressModel = require('../model/addressModel')
const userModel = require('../model/userModal')

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { assign } = require('nodemailer/lib/shared');
const randomstring = require("randomstring");
const orderModel = require('../model/orderModel');




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
            from: 'jishadlm10@gmail.com',
            to: Email,
            subject: 'otp verification',
            text: `your otp for verification is ${otp}`
};

const transporter = nodemailer.createTransport({

            service: 'gmail',
            auth: {
            user: 'jishadlm10@gmail.com',
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
              res.render('login', { message: "You are not verified can you please connect the admin team " });
            }
          
            } catch (error) {
            console.error(error.message);
            }
  };



 const loadHome = async (req,res)=>{
              try{
              const product = await productModel.find({list:true});
              const cart =await cartSchema.findOne({user:req.session.userId});
              const category = await categories.find({listed:true})
              console.log(category);
                 res.render('home',{product,cart,category});
              }catch(error){
              console.log(error.message);
              }
 }
 





async function loadCheckout(req,res){
      try {

        const userid = req.session.userId;
        const cart = await cartSchema.findOne({user:userid}).populate('products.product');
        const address = await addressModel.find({user:userid})
      

        res.render('checkout',{cart,address})

      } catch (error) {
        console.log(error);
      }
}



async function loadDashboard(req,res){
    try {

      const userid =req.session.userId;
      const user = await userModel.findById(userid);
      const address = await addAddressModel.find({user:user})
      const orderDetails = await orderModel.find({user:userid})
    //  console.log(orderDetails);
    //  console.log('1111111111111');
    //  console.log(address);
    //  console.log('22222222222');
    //  console.log(user);
      
      res.render('dashboard',{user,address,orderDetails});
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



async function addNewAddress(req,res){
  try {

    console.log(req.body);
    const {name , phone , street , houseNum , city , country , pincode , landmark , email } = req.body;

     const addAddress = {
      
        user:req.session.userId,
        name:name,
        phone:phone,
        email:email,
        houseNo:houseNum,
        street:street,
        landmark:landmark,
        pincode:pincode,
        city:city,
        country:country,

     }

     await addressModel.insertMany(addAddress);
     res.redirect('/dashBoard')

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


// async function loadEditAddress(req,res){
//   try {
//       res.render('')
//   } catch (error) {
//     console.log(error);
//   }
// }


// async function changePassword(req,res){
//   try {

//      const user = req.session.userId;
//      console.log("session"+user);
//     const { email , curPassword , cPassword } = req.body;
//     const spassword = await securePassword(cPassword);
//     const cursPassword = await securePassword(curPassword)
//     let userData = await userModel.findOne({_id:user})
//     const passwordmatch =  await bcrypt.compare(cursPassword, userData.password);
//     if (userData) {
//        if (userData.email === email) {
        
//         if ( passwordmatch ) {
          
//             userData.password = spassword;
//             await userData.save();

//             res.redirect('/dashboard')
//         }else{
//           console.log(" password is not maych");
//         }

//        }else{
//         console.log("wrong user");
//        }
//     } else {
//       console.log("no user found");
//     }



 
//   } catch (error) {
//     console.log(error);
//   }
// }


async function changePassword(req, res) {
  try {
    const userId = req.session.userId;
    console.log("session", userId);

    const { email, curPassword, cPassword } = req.body;
    const spassword = await securePassword(cPassword);
    

    let userData = await userModel.findOne({ _id: userId });

    if (userData) {
      if (userData.email === email) {
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
      } else {
        console.log("Wrong user");
        
      }
    } else {
      console.log("No user found");
      
    }
  } catch (error) {
    console.log(error);
    
  }
}



async function confirmOrder(req,res){

  try {

    console.log(req.body);
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
          total: item.subTotal
        }
      }),
      grandTotal: cart.Total
     }

      await orderModel.insertMany(order);

      await cartSchema.findOneAndUpdate({ user: userId }, { $set: { products: [], Total: 0 } });
      res.status(200).json({message:"success"});
    
     
    
  } catch (error) {
    console.log(error);
  }
}


async function successPage(req,res){
  try {
    res.render('successPage')
  } catch (error) {
    console.log(error);
  }
}


// async function orderDetails(req,res){
//   try {
//     const userId = req.session.userId;

//     const orderDetails = await orderModel.findById({ user : userId })
//     console.log(orderDetails);

    

//   } catch (error) {
//     console.log(error);
//   }
// }






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
  confirmOrder,
  successPage,
  changePassword,
  resendOtp,
  orderdetails,
  canceOrder,
  editAddress
  
  
  
}

