if(process.env.NODE_ENV!="production")
{
    require("dotenv").config()
}

const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const wrapAsync=require('./utils/wrapAsync.js')
const Listing=require('./models/listing.js')

var methodOverride=require('method-override');
app.use(methodOverride("_method"));
const ejsMate=require('ejs-mate');
app.use(express.static('public'));
app.set("views",path.join(__dirname,"views"));
app.set(express.static(path.join(__dirname,"public")));

// const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust';
const dbUrl=process.env.ATLASDB_URL



app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.engine('ejs',ejsMate);
app.set("view engine","ejs");

const UserModel=require('./models/user.js');
const ExpressError=require('./utils/ExpressError.js');

const session=require('express-session');
const MongoStore = require('connect-mongo');
const flash=require('connect-flash');

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret:process.env.SECRET
    },
    touchAfter:24*3600
    
  })


store.on("error",()=>
{
    console.log("error in mongo store")
})

const sessionOptions=
{
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:
    {
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());



//! it must be before all routes therefore we have put it up of listings and reviews
app.use((req,res,next)=>
{
   
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.CurrUser=req.user;
    next();
})

//! router requirements
const listingsRouter=require('./routes/listing.js');
const reviewsRouter=require('./routes/review.js');
const UserRouter= require('./routes/user.js');


app.use('/listings',listingsRouter);
app.use('/listings/:id/reviews',reviewsRouter);
app.use('/',UserRouter);



async function main()
{
    await mongoose.connect(dbUrl);
}

main().then(()=>
{
    console.log("connected to db..");
})
.catch((err)=>
{
    console.log(err);
})

// app.get('/',(req,res)=>
// {
//     res.render('listings/index')
// })
app.get(
    "/",
    wrapAsync(async (req, res) => {
      const allListings = await Listing.find();
  
      res.render("listings/index.ejs", { allListings });
    })
  );

app.all('*',(req,res,next)=>
{
    throw new ExpressError(404,"Page not found");
})


//!error handler
app.use((err,req,res,next)=>
{
    let {statusCode=500,message="Something went wrong"}=err;
    res.render("listings/error.ejs",{err});

})

app.listen(8080,()=>
{
    console.log("Server started..");

    
})