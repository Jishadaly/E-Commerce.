

const  User  = require('../model/userModal')
const  Admin  = require('../model/adminModel');
const couponModal = require('../model/couponModal');


const loadLogin = async(req,res)=>{

          try { 
          
          res.render('login',{message:" "})
          } catch (error) {
            console.log(error);
          }
  }



const verifyLogin = async(req,res)=>{

          try {

            const email = req.body.email;
            const password = req.body.password;
            const admin = await Admin.findOne({email:email});
            if (admin.password == password) {
               req.session.admin = admin;
              //  console.log(req.session.admin);
               res.redirect('admin/dashboard');
            }else{
              res.render('login',{message:"invalid admin"})
            }
          
            }catch(error){
              console.log(error.message);
            }
}


 const loadDashboard = async(req,res)=>{
                
            try {
              if (req.session.admin) {
                res.render('dashboard.ejs');
              } else {
                res.redirect('/admin')
              }
            } catch (error) {
              console.log(error.message)
            }
 } 



const loadUserlist= async(req,res)=>{

            try {
            if(req.session.admin){
            const datas = await User.find().sort({date:-1});
            res.render('usersList',{datas});
            }else{
            res.redirect('/admin');
            }
            } catch (error) {
            console.log(error);
            }
  }




const blockUser = async (req,res)=>{

            try {
              
              const id = req.query.id;
              const user = await User.findById(id);

              if(!user){
                console.log("user not found");
              }
              user.is_blocked = !user.is_blocked;
              await user.save();
              res.status(200).json({success : true});
              // res.redirect('/admin/users')
            } catch (error) {
              console.log(error.message);
            }
  }
  
  
async function loadAddCoupon(req,res){
      try {
        res.render('addCoupon')
      } catch (error) {
        console.log(error);
      }
}


async function addCoupon(req,res){

    try {
      const { name ,code, discountAmount, expireDate,  minimumCartTotal } = req.body;
      const coupon = {
        name:name,
        Couponcode:code,
        expiry:expireDate,
        discount:discountAmount,
        minimumCartTotal:minimumCartTotal
      }

      const couponDetails =  await couponModal.insertMany(coupon);
      console.log(couponDetails);
      res.redirect('/admin/listCoupon');

    } catch (error) {
      console.log(error);
    }
}

async function couponList(req,res){
  try {
    const coupons = await couponModal.find();
     res.render('listCoupon',{coupons})
  } catch (error) {
    console.log(error);
  }
}

async function loadEdiCoupon(req,res){
  try {
     const id = req.query.couponId;
     console.log(id);
     const coupon = await couponModal.findById(id)
     res.render('editCoupon',{coupon});
  } catch (error) {
    console.log(error);
  }
}

async function ediCoupon(req,res){
 console.log(req.body);
  const couponId = req.query.couponId;
  console.log(couponId);
  const { name ,code, discountAmount, expireDate,  minimumCartTotal } = req.body;
  
  if (couponId) {

     const editCoupon = {
      name:name,
      Couponcode:code,
      discount:discountAmount,
      expiry:expireDate,
      minimumCartTotal:minimumCartTotal
     }
     
     const editedCoupon  = await couponModal.findByIdAndUpdate(couponId,editCoupon);
     console.log(editedCoupon);
     res.redirect('/admin/listCoupon')

    }

  try {
      
  } catch (error) {
    console.log(error);
  }
}



async function deleteCoupon(req,res){
  try {

     console.log(req.query);
     const couponId = req.query.couponId;
     await couponModal.findByIdAndDelete(couponId);
     res.redirect('/admin/listCoupon')
  } catch (error) {
    console.log(error);
  }
}

async function couponlistAndUnlist(req,res){
  try {
      const id = req.params.id;
      console.log(id);
      
      if (id) {
        const data = await couponModal.findById(id);
        console.log(data);
        data.status = !data.status;
        await data.save();

        res.redirect('/admin/listCoupon');

      } else {
        res.redirect('/admin/listCoupon');
        console.log("no chang btw list unlist");
      }
     

  } catch (error) {
    console.log(error);
  }
 }

  

module.exports = {
  loadLogin, verifyLogin, loadDashboard,
  loadUserlist,blockUser,loadAddCoupon,
  addCoupon,couponList,loadEdiCoupon,ediCoupon,
  deleteCoupon,couponlistAndUnlist
}
