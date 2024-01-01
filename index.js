const express = require("express");
const app =  express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
require('dotenv').config()


//Setting the database.

mongoose.connect(process.env.dbUrl);
const db = mongoose.connection;
if(db)
{console.log('db set');}

app.use(express.json());
//creating the session.
app.use(session({
  secret:'mysitesessionsecret',
  resave:false,
  saveUninitialized:true,
  
}))


app.use("/public", express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));



const userRoute = require('./routes/userRoute');
app.use('/',userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute);


app.listen(port,()=>{
  console.log(`server is running ${port}`);
});




module.exports = app;