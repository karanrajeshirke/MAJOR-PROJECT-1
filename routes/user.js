const express=require('express');
const wrapAsync = require('../utils/wrapAsync');
const router=express.Router();
const UserModel=require('../models/user.js');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');

router.get('/signup',(req,res)=>
{
    res.render("users/signup");
})
router.post('/signup',wrapAsync(async(req,res,next)=>
{
    try 
    {
    let {username,email,password}=req.body;
    let data={username,email};
    const newUser=new UserModel(data);

    let RegUser=await UserModel.register(newUser,password);
    req.flash("success","You are Registered Successfully...");

    req.login(RegUser,(err)=>
    {
        if(err)
        {
           return  next(err);
        }
        else
        {
          req.flash("success","Registeration done successfully");
          res.redirect("/listings");
        }
    })
    }
    catch(err)
    {
        req.flash("error",err.message);
        console.log("erorr");
        res.redirect("/signup");
    }

}))


router.get('/login',(req,res)=>
{
    res.render('users/login');
})

router.post('/login',saveRedirectUrl, passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}) ,async(req,res)=>
{
    req.flash("success","Logged In Successfully");
    let url=res.locals.redirectUrl || "/listings";
    res.redirect(url);

})

router.get('/logout',(req,res)=>
{
    req.logout((err)=>
    {
        if(err)
        {
            return next(err);
        }
        req.flash("success","you are logged out ");
        res.redirect('/login');
        
    })
    
})

module.exports=router;