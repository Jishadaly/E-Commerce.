

const  User  = require('../model/userModal')
const  Admin  = require('../model/adminModel');


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
  
  



module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  loadUserlist,
  blockUser,
}
