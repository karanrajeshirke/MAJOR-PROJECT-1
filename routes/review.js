const express=require('express');
const router=express.Router({mergeParams:true});
const wrapAsync=require('../utils/wrapAsync.js');
const ExpressError=require('../utils/ExpressError.js');
const Listing=require('../models/listing.js');
const Review=require('../models/review.js');
const {isLoggedIn,ValidateReview,ValidateListing,IsOwner,saveRedirectUrl,IsReviewAuthor}=require('../middleware.js');


router.get('/date',isLoggedIn,async(req,res)=>
{
    let data=await Listing.findById(req.params.id)
    .populate({
      path: 'reviews',
      populate: { path: 'author' },
      options: { sort: { createdAt: 1 } } 
    })
    .populate('owner');
   
})

//!view in detail 

router.get('/viewInDetail',isLoggedIn,wrapAsync(async(req,res)=>
{
    let listing=await Listing.findById(req.params.id).populate({ path: "reviews", populate: [    { path: "author" },{ path: "likes" } 
      ]}).populate("owner");
    res.render("reviews/reviewsDetail",{listing});
}))

//!like post 

router.get('/:reviewId/like', isLoggedIn,wrapAsync(async(req,res)=>
{
    

    let listingId=req.params.id;
    let userId=req.user._id;
    let reviewId=req.params.reviewId;
    let review=await Review.findById(reviewId);
    if(!review.likes.includes(userId))
    { 
        review.likes.push(userId);

        let savedReview=await review.save();
        req.flash("success","review Liked !");
        console.log(savedReview);
    }
    else
    {
        req.flash("error","Already Liked !");
    }
    res.redirect(`/listings/${listingId}/reviews/viewInDetail`)
    
}))

//! Who liked ?

router.get('/:reviewId/whoLiked',isLoggedIn,wrapAsync(async(req,res)=>
{
    let userId=req.user.id;
    let reviewId=req.params.reviewId;
    let listingId=req.params.id;
    let review=await Review.findById(reviewId).populate('likes');


    if(!review.author._id.equals(userId))
    {
         req.flash("error","You dont have the Authorization")
         return res.redirect(`/listings/${listingId}/reviews/viewInDetail`)
    }
    else
    {
        if(!review.likes.length)
        {
            throw new ExpressError(404, "No likes");
        }
        else
        {
        res.render('reviews/whoLiked',{review})
        }
    }
}))


//! Unliked

router.get('/:reviewId/unLike',isLoggedIn,wrapAsync(async(req,res)=>
{
    let listingId=req.params.id;
    let userId=req.user._id;
    let reviewId=req.params.reviewId;
    let review=await Review.findById(reviewId);
    console.log(review);
    if(review.likes.includes(userId))
    { 
       
        req.flash("success","Unliked !");
        let  data=await Review.findByIdAndUpdate(reviewId, { $pull: { likes:userId  } });
        console.log(data);
    }
    else
    {
        req.flash("error","Not Liked !");
    }
    res.redirect(`/listings/${listingId}/reviews/viewInDetail`)
}))

//!review 
router.post('/',isLoggedIn,ValidateReview,wrapAsync(async(req,res)=>
{
    let listing=await Listing.findById(req.params.id);
    let {rating,comment}=req.body;


    let newReview=new Review(
        {
            comment:comment,
            rating:rating,
        }
    )

    newReview.author=req.user._id; //pushing the user who created it;

    
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
   

    console.log("data added");
    req.flash("success","New Review created !! ");
    res.redirect(`/listings/${listing.id}`);



}));

//!delete review 
router.delete('/:reviewId',isLoggedIn,IsReviewAuthor, wrapAsync(async(req,res)=>
{
    let {id,reviewId}=req.params;

    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted !! ");
    res.redirect(`/listings/${id}`)

}));


module.exports=router;