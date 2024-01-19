const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
// const {ListingSchema,ReviewSchema}=require('../models');
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User=require('../models/user.js')
const { isLoggedIn, ValidateListing, IsOwner } = require("../middleware.js");
const multer  = require('multer')
const {storage}=require('../cloudConfig.js');
const upload = multer({ storage})

const mapToken=process.env.MAP_TOKEN
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


router.get('/search',wrapAsync(async(req,res)=>
{
    
  let {SearchQuery}=req.query;

//git done baba

  let allListings = await Listing.find({
    $or: [
      { location: { $regex: new RegExp(SearchQuery, 'i') } },
      { country: { $regex: new RegExp(SearchQuery, 'i') } },
    ]
  });
  
  console.log(allListings);

  
  res.render("listings/index.ejs", { allListings });


}));


//!Add to favourites
//now you have an user  id and the listing id
router.get('/:listingId/addFavourite',isLoggedIn,wrapAsync(async(req,res)=>
{

    let {listingId}=req.params
    let userId=req.user._id;
    let listing=await Listing.findById({_id:listingId})
    

    if(listing.favourites.includes(userId))
    {
      req.flash("error","Already Added to Favourites !");
    }
    else
    {
      listing.favourites.push(userId)
      let data=await listing.save()
      console.log(data)
      req.flash("success","Added to Favourites !");
    }

    res.redirect("/listings/getFavourite")
}))

//! get all favourites 
router.get('/getFavourite',isLoggedIn,wrapAsync(async(req,res)=>
{
    let userId=req.user._id;

    let allListings = await Listing.find({ favourites: userId }).populate('favourites');

    console.log(allListings)
    
    res.render("listings/favourites",{allListings})

    
}))


router.get('/:listingId/removeFavourite',isLoggedIn,wrapAsync(async(req,res)=>
{

    let {listingId}=req.params
    let userId=req.user._id;
    let listing=await Listing.findById({_id:listingId})
    

    if(listing.favourites.includes(userId))
    {
      req.flash("success","Removed from Favourites !");
      let  data=await Listing.findByIdAndUpdate(listingId, { $pull: { favourites:userId  } });
      console.log(data)
    }
    else
    {
      req.flash("success","Not added to favourite to be removed!");
    }

    res.redirect("/listings/getFavourite")
}))

//!cateogy page

router.get(
  "/choose/:Category",
  wrapAsync(async (req, res) => {
    let { Category } = req.params;

    let CheckCat = [
      "BeachFront",
      "Mountains",
      "Snow",
      "Swimming",
      "Castle",
      "Camping",
      "Sunny",
      "Rainforest",
      "Dome",
      "Luxury",
    ];

    if (CheckCat.includes(Category)) {
      let allListings = await Listing.find({ category: Category });
      res.render("listings/index.ejs", { allListings });
    } else {
      throw new ExpressError(404, "Given Category Does Not Exist");
    }
  })
);

//!show route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", { allListings });
  })
);

//!new route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//!Create Route
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  ValidateListing,
  wrapAsync(async (req, res, next) => {


    let response=await geocodingClient.forwardGeocode({
      query:req.body.location,
      limit: 1
    })
      .send()
      


    let { title, description, image, price, location, country, category } =
      req.body;

    const newlisting = new Listing({
      title: title,
      description: description,
      image: image,
      category: category,
      price: price,
      location: location,
      country: country,
    });
    newlisting.owner = req.user.id;


    let url=req.file.path;
    let filename=req.file.filename;

    newlisting.image={url,filename};

    // console.log(`${url}....${filename}`)
    newlisting.geometry=response.body.features[0].geometry;
    const savedListing = await newlisting.save();
    console.log(savedListing);
    req.flash("success", "New Listing created !! ");
    res.redirect("/listings");
  })
);
// router.post("/",upload.single("image"),(req,res,next)=>
// {
//   res.send(req.file);
// })

//!edit
router.get(
  "/:id/edit",
  isLoggedIn,
  IsOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    let originalImage=listing.image.url;

    originalImage=originalImage.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing,originalImage });
  })
);

//!show route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    // console.log(id);
    let listing = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

      //!note never populate if you want to check someone id with the data 
    // console.log(listing.owner.username);

    console.log(listing)
    res.render("listings/show.ejs", { listing });
  })
);

//!update route
router.put(
  "/:id",
  isLoggedIn,
  IsOwner,
  upload.single("image"),
  ValidateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    let { title, description, image, price, location, country, category } =
      req.body;


      let response=await geocodingClient.forwardGeocode({
        query:location,
        limit: 1
      })
        .send()

   let listing= await Listing.findByIdAndUpdate(id, {
      title,
      description,
      image,
      price,
      category,
      location,
      country,
      geometry:response.body.features[0].geometry,
    });

    


    console.log(listing);

   if(req.file)
   {
      let url=req.file.path;
      let filename=req.file.filename;

      listing.image={url,filename};

      await listing.save();
   }

    req.flash("success", " Listing Updated !! ");
    res.redirect(`/listings/${id}`);
  })
);

//!delete
router.delete(
  "/:id",
  isLoggedIn,
  IsOwner,
  wrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);
    req.flash("success", " Listing Deleted !! ");

    res.redirect("/listings");
  })
);

module.exports = router;
