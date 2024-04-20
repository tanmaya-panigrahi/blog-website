require("dotenv").config();


const express=require("express");   //import express
const expressLayout=require("express-ejs-layouts");  //import express-ejs-layouts
const cookieParser=require('cookie-parser');
const method_Override= require('method-override');
const MongoStore=require('connect-mongo');
const session=require('express-session');


const connectDB=require('./server/config/db');  //import connectDB
const app=express();
const port =5000||process.env.PORT;

connectDB();
app.use(express.static("public"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use(method_Override('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
}))


app.use(expressLayout);
app.set("layout","./layouts/main");
app.set("view engine","ejs");


app.use("/",require("./server/routes/main"));
app.use("/",require("./server/routes/admin"));

app.listen(port,()=>{
    console.log("app is listening on port 5000");
})