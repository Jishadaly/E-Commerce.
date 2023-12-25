

const  User  = require('../model/userModal')
const  Admin  = require('../model/adminModel');
const couponModal = require('../model/couponModal');
const productModal = require('../model/productModal')
const orderModal = require('../model/orderModel');
const userModal = require('../model/userModal');

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

//  const logout = async function(req,res){
//   try {
     
//   } catch (error) {
//     console.log(error);
//   }
//  }

const loadDashboard = async (req, res) => {
  try {
    if (req.session.admin) {
      const bestProducts = await productModal.find({ list: true }).sort({ orders: -1 }).limit(4);
      
      // Calculate total revenue
      const totalRevenue = await orderModal.aggregate([
        {
          $match: { status: { $in: ['Shipped', 'Delivered', 'Confirmed'] } }
        },
        {
          $group: { _id: null, totalRevenue: { $sum: "$grandTotal" } }
        }
      ]);

      
      const totalOrders = await orderModal.countDocuments();
      const totalProducts = await productModal.countDocuments();
      const totalCustomers = await userModal.countDocuments();

      res.render('dashboard', {
        bestProducts,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
        totalOrders,
        totalProducts,
        totalCustomers
      });
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error.message);
   
  }
};

// const loadUserlist= async(req,res)=>{

//             try {
//             if(req.session.admin){
//             const datas = await User.find().sort({date:-1});
//             res.render('usersList',{datas});
//             }else{
//             res.redirect('/admin');
//             }
//             } catch (error) {
//             console.log(error);
//             }
//   }



  async function loadUserlist(req, res) {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const ordersPerPage = 10; // Number of orders per page

        const totalCount = await User.countDocuments(); // Total count of orders

        const totalPages = Math.ceil(totalCount / ordersPerPage); // Total pages

        const skip = (page - 1) * ordersPerPage; // Number of documents to skip

        const datas = await User.find()
            
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(ordersPerPage);

        res.render('usersList', {
          datas,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
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
