const Listing = require("./models/listing");
const Review=require('./models/review.js');
const {ListingSchema,ReviewSchema}=require('./schema.js');
const ExpressError=require('./utils/ExpressError.js');
const isLoggedIn=(req,res,next)=>
{
    if(req.isAuthenticated())
    {
       return next();
    }
    else
    {
        //We have done this becasue if a user request to a page which requires a login and currently he is not 
        //logged in so after login he should go that requestd page but right now it wont happen thereefore
        //we have to store the information of which page he wanted to visit

        //without login

        //restricted page ---> login---->restricted page

        req.session.redirectUrl=req.originalUrl;
       console.log(req.session.redirectUrl);
        req.flash("error","You are not Logged In my Brother");
        res.redirect('/login');
    }
}


const saveRedirectUrl=(req,res,next)=>
{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl=req.session.redirectUrl;
    }

    next();
}


//!middleware for listing schema
const ValidateListing=(req,res,next)=>
{

    
    let {error}=ListingSchema.validate(req.body, { abortEarly: false });
    
    if(error)
    {
        let errArr=error.details.map((obj)=>
        {
            return obj.message;
        })

        let errmsg=errArr.join(',');

        throw new ExpressError(400,errmsg);
    }
    next();


}

//!middleware for reviewSchema
const ValidateReview=(req,res,next)=>
{
    let {error}=ReviewSchema.validate(req.body, { abortEarly: false });
    
    if(error)
    {
        let errArr=error.details.map((obj)=>
        {
            return obj.message;
        })

        let errmsg=errArr.join(',');

        throw new ExpressError(400,errmsg);
    }
    next();


}

const IsOwner=async(req,res,next)=>
{
    //we have to make sure the person logged in and the owner of this list are same then only we will allow to edit

    let {id}=req.params;

    let List=await Listing.findById(id);
    let ListOwner=List.owner._id;
    console.log(ListOwner);
    if(!ListOwner.equals(res.locals.CurrUser.id))
    {
        req.flash("error","You are not the owner to Make Changes");
        res.redirect(`/listings/${id}`);
    }
    else{
        next();
    }
    
}

const IsReviewAuthor=async(req,res,next)=>
{
    //we have to make sure the person logged in and the owner of this list are same then only we will allow to edit
    //id -> this is of the listing
    //!in the review author id we have the id of the user 
    let {id,reviewId}=req.params;

    let review=await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.CurrUser.id))
    {
        req.flash("error","You are not the Author to Make Changes");
        res.redirect(`/listings/${id}`);
    }
    else{
        next();
    }
    
}
module.exports={isLoggedIn,saveRedirectUrl,ValidateListing,ValidateReview,IsOwner,IsReviewAuthor};