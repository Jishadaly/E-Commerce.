const path = require('path');
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function( req, file, cb){
    cb(null,path.join(__dirname,'../public/images'))
  },

  filename: function(req,file,cb){
    cb(null,Date.now()+'_'+file.originalname);
  }
  
})

const upload = multer({storage:storage});

module.exports =upload;