const express = require("express");
const app =  express();
const port = 3000;
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
require('dotenv').config()


//Setting the database.
// const dbUrl = 'mongodb://127.0.0.1:27017/E-commerce';
mongoose.connect(process.env.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
if(db)
{console.log('db set');}


//creating the session.
app.use(session({
  secret:'mysitesessionsecret',
  resave:false,
  saveUninitialized:true,
  
}))

app.use(express.json());
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