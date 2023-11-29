
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

module.exports = {isLogin , isLogOut}

