

const productModel = require('../model/productModal')
const categories = require('../model/categoryModal');
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
const session = require('express-session');
require('dotenv').config()



// becript the password for more security
const securePassword = async (password) => {

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}


const loadRegister = async (req, res) => {

  try {
    const user = req.session.userId;
    if (req.query) {
      req.session.referel = req.query.referel;
    }

    res.render('registration', { message: "" ,user})
  } catch (error) {
    console.log(error.message);
  }
}


// setting otp function
function generateOtp() {
  return randomstring.generate({
    length: 4,
    charset: 'numeric',
  })
}


//send the otp via email
function sendOtp(email, subject, text) {

  const Email = email;
  const mailOptions = {
    from: process.env.emailAddress,
    to: Email,
    subject: subject,
    text: text

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

    const user = req.session.userId;
    const { name, email, mno, password } = req.body;
    const checkEmail = await userModel.findOne({ email: email });
   

    if (checkEmail && checkEmail.email === email) {
      res.render('registration', { message: "This account id already exists" ,user});

    } else {
      console.log("Entered this block");

      const user = userModel({
        name: name,
        email: email,
        mobile: mno,
        password: password
      });

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

      // sendOtp(req.body.email, otp);
      const subject = `Your otp for registering at byteBook `;
      const text = `your otp for verification is ${otp}`;
      sendOtp(email, subject, text);
      res.redirect('/otpVerification');

    }
  } catch (error) {
    console.log(error.message);
   
  }
};


const resendOtp = async (req, res) => {
  try {

    const userEmail = req.session.userData.email;

    const otp = generateOtp();

    req.session.otp = otp;
    const subject = `Your otp for registering at LapBook `;
    const text = `your otp for verification is ${otp}`;
    sendOtp(userEmail, subject, text);
    res.redirect('/otpVerification');
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error resending OTP: Internal Server Error");
  }
};


const loadOtpVerification = async (req, res) => {

  try {
    res.render('otpVerification', { message: "" })
  } catch (error) {
    console.log(error.message)
  }
}

const verifyOtp = async (req, res) => {

  try {
    const enteredOtp = req.body.otp;
    const stroredOtp = req.session.otp;
    
    if (enteredOtp == stroredOtp && req.session.referel) {

      delete req.session.otp;
      const generetedCode = generateOtp();
      const userData = req.session.userData;
      const refferdUser = await userModel.findOne({ referelCode: req.session.referel })

      if (refferdUser) {
        refferdUser.walletAmount = 200;
        await refferdUser.save();
      }

      const spassword = await securePassword(userData.password);

      const users = userModel({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: spassword,
        referelCode: generetedCode,
        is_verified: is_verified = true,
        walletAmount: 150,

      })

      await users.save();

      res.redirect('/login')

    } else if (enteredOtp == stroredOtp) {

      delete req.session.otp;
      const generetedCode = generateOtp();
      const userData = req.session.userData;
      const spassword = await securePassword(userData.password);

      const users = userModel({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: spassword,
        referelCode: generetedCode,
        is_verified: is_verified = true

      })

      await users.save();
      req.session.destroy();
      res.redirect('/login')
    } else {
      res.render('otpVerification', { message: "enterd otp is icurrect" })
     
    }
  } catch (error) {
    console.log(error.message, { errorMessage: 'Invalid OTP. Please try again.' });
  }

}




//login
const loadLogin = async (req, res) => {

  try {
    const user = req.session.userId;
    res.render('login',{message:"" , user})
  } catch (error) {
    console.log(error.message);

  }
}





const verifyLogin = async (req, res) => {

  try {

    const user = req.session.userId;
    const email = req.body.email;
    const password = req.body.password;
    const userData = await userModel.findOne({ email: email });
    
    const passwordmatch = await bcrypt.compare(password, userData.password);
    if (userData) {
      if (userData.is_verified === true && userData.is_blocked === false) {
        if (passwordmatch) {
          req.session.userId = userData._id;
          res.redirect('/')
        } else {
          
          res.render('login', { message: "Enterd Password is incorrect" ,user });
          
        }
      } else {
        res.render('login ', { message: "Sorry, you are not allow to access with this account",user });
      }
    } else {
      res.render('login', { message: "This email not registerd please signup",user });
      
    }
    

  } catch (error) {
    console.error(error.message);
  }
};

// const verifyLogin = async (req, res) => {
//   try {
//     const user = req.session.userId;
//     const email = req.body.email;
//     const password = req.body.password;
//     const userData = await userModel.findOne({ email: email });
    
//     const passwordMatch = userData ? await bcrypt.compare(password, userData.password) : false;

//     if (userData) {
//       if (userData.is_verified === true && userData.is_blocked === false) {
//         if (passwordMatch) {
//           req.session.userId = userData._id;
//           // Redirect on successful login
//           res.redirect('/');
//         } else {
//           // Clear input fields when rendering the login page again
//           res.render('login', { message: "Entered Password is incorrect", email: "", password: "" });
//         }
//       } else {
//         res.render('login', { message: "Sorry, you are not allowed to access this account", email: "", password: "" });
//       }
//     } else {
//       res.render('login', { message: "This email is not registered. Please sign up", email: "", password: "" });
//     }
//   } catch (error) {
//     console.error(error.message);
//   }
// };




const loadHome = async (req, res) => {
  try {

    const Bestproduct = await productModel.find({ list: true }).sort({ orders: -1 }).limit(4);
    const featuredProduct = await productModel.find({ list: true, featured: "true" });
    const cart = await cartSchema.findOne({ user: req.session.userId });
    const category = await categories.find({ listed: true });

    const user = req.session.userId;

    res.render('home', { Bestproduct, featuredProduct, cart, category, user, message: "" });

  } catch (error) {
    console.log(error.message);
  }
}


async function loadCheckout(req, res) {
  try {

    const user = req.session.userId;
    const cart = await cartSchema.findOne({ user: user }).populate('products.product');
    console.log(cart);
    const address = await addressModel.find({ user: user })
    const coupon = await couponModal.find({ minimumCartTotal: { $lte: cart.Total }, status: true });


    res.render('checkout', { cart, address, user, coupon, message: "" })


  } catch (error) {
    console.log(error);
  }
}



async function loadDashboard(req, res) {
  try {

    const userid = req.session.userId;
    const user = await userModel.findById(userid);
    const address = await addAddressModel.find({ user: user })
    const orderDetails = await orderModel.find({ user: userid }).sort({ createdAt: -1 });
    const transactions = await transactionModal.find({ user: userid, type: 'Credited' }).sort({ date: -1 });
    res.render('dashboard', { user, address, orderDetails, transactions });
  } catch (error) {
    console.log(error);
  }
}



async function addNewAddress(req, res) {
  try {

    
    const { name, phone, street, houseNo, city, country, pincode, landmark, email } = req.body;

    const addAddress = {

      user: req.session.userId,
      name: name,
      phone: phone,
      email: email,
      houseNo: houseNo,
      street: street,
      landmark: landmark,
      pincode: pincode,
      city: city,
      country: country,

    }

    await addressModel.insertMany(addAddress);
    res.status(200).json({ message: 'Address added successfully' });


  } catch (error) {
    console.log(error);
  }
}


async function deleteAddress(req, res) {
  try {

    const addressId = req.query.address;
    
    const address = await addAddressModel.findByIdAndDelete(addressId);

    if (address) {
      res.status(200).json({ message: "address deletion is successed" })
    } else {
      res.status(400).json({ message: "address deletion is failed" })
    }


  } catch (error) {
    console.log(error);
  }
}






async function changePassword(req, res) {
  try {

    const userId = req.session.userId;
   

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


async function shareReferel(req, res) {

  try {

    const userId = req.session.userId;
    const user = await userModel.findById(userId);
    const referel = user.referelCode;
    res.status(200).json({ referel });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

}




async function successPage(req, res) {
  try {

    const user = req.session.userId;
    res.render('successPage', { user })
  } catch (error) {
    console.log(error);
  }
}

async function aboutUs(req, res) {
  try {

    const user = req.session.userId;
    res.render('aboutUs', { user })
  } catch (error) {
    console.log(error);
  }
}

async function contactUs(req, res) {
  try {

    const user = req.session.userId;
    res.render('contactUs', { user })
  } catch (error) {
    console.log(error);
  }
}

async function forgotPasswordEmail(req, res) {
  try {
    res.render('forgotPassword', { message: "" })
  } catch (error) {
    console.log(error);
  }
}


async function verify_forgotPasswordEmail(req, res) {
  try {
    const email = req.body.email;
    const checkEmail = await userModel.findOne({email:email});
    if (checkEmail) {
      const token = generateOtp();
      checkEmail.token = token;
      await checkEmail.save();
      const subject = `Your link for forgot your password at LapBook. click the below link`;
      const text = `https://bytebook.shop/addForgotPassword?token=${token}`;
    
      sendOtp(email, subject, text );

      res.redirect('/forgotPassword')
    } else {
      res.render('forgotPassword', { message: "Entered Email is not exist " })
    }
  } catch (error) {
    console.log(error);
  }
}


async function getAddForgotPass(req, res) {
  try {
    req.session.token = req.query.token;
    res.render('addForgotPassword')
  } catch (error) {
    console.log(error);
  }
}

async function postAddForgotPass(req, res) {
  try {
    const newPassword = req.body.confirmPassword;
    const spassword = await securePassword(newPassword);
    const token = req.session.token;
    const userData = await userModel.findOne({ token: token });
    userData.password = spassword;
    await userData.save();
    res.redirect('/');
  } catch (error) {
    console.log(error);
  }
}





module.exports = {

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
  successPage,
  changePassword,
  resendOtp,
  deleteAddress,
  shareReferel,
  aboutUs, contactUs,
  forgotPasswordEmail,
  verify_forgotPasswordEmail,
  getAddForgotPass,
  postAddForgotPass



}

