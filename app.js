

//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser = require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require('express-session');
const passport=require("passport");
const passportLoalMongoose = require("passport-local-mongoose");

// const encrypt=require("mongoose-encryption");

// const bcrypt=require("bcrypt");
// const saltRounds=10;

const app=express();

// console.log(md5("1234"));

app.use(express.static("publuic"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser:true , useUnifiedTopology: true});

mongoose.set("useCreateIndex",true);


const userSchema= new mongoose.Schema({
    email:String,
    password: String
});

userSchema.plugin(passportLoalMongoose);

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

const user =new mongoose.model("user",userSchema);

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");
});


app.get("/register",function(req,res){
    res.render("register");
});


app.get("/secrets",function(req,res){
    if (req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.post("/register",function(req,res){
    user.register({username: req.body.username},req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });

        }
    });

    // bcrypt.hash(req.body.password,saltRounds,function(err,hash){

    //     const newUser=new user({
    //         email:req.body.username,
    //         password:hash
    
    //     });
    
    //     newUser.save(function(err){
    //         if(err){
    //             console.log(err);
    //         }else{
    //             res.render("secrets");
    //         }
    //     });
    // });
  
});



app.post("/login",function(req,res){

    const User=new user({
        username: req.body.username,
        passport: req.body.password
    });

    req.login(User,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });
    // const username= req.body.username;
    // const password= req.body.password;

    // user.findOne({email:username},function(err,founduser){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         if(founduser){
    //             bcrypt.compare(password,founduser.password,function(err,result){
    //                 if(result===true){
    //                     res.render("secrets");
    //                 }
    //             });
    //         }
    //     }

    // });
});














app.listen(3000,function(){
    console.log("Server started on port 3000");
});