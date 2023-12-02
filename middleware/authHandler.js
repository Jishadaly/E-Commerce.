const userModal = require("../model/userModal");


async function isLogin(req,res,next){
    
  if (req.session.userId) {
     console.log("session is login ///// "+req.session.userId);
  } else {
    res.redirect('/login')
  }

  next();
}


const isLogOut = (req, res, next)=>{
  if (req.session && req.session.userId) {
       req.session.destroy();
       res.redirect('/');
  } else {
   next();
  }
}


const isBlocked = async (req,res,next)=>{

   const id = req.session.userId;
   const user = await userModal.findById(id);
    console.log(user);
   if (user && user.is_blocked === true) {
          res.redirect('/login')
   } else {
    next()
   }
}



module.exports = {isLogin , isLogOut, isBlocked}

