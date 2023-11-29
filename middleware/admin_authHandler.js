const isLogin = (req,res,next)=>{
  if (req.session.admin) {
    console.log("admin :::  "+req.session.admin);
  }else{
    res.redirect('/admin');
  }
  next();
}



module.exports = isLogin ;