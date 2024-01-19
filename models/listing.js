const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const Review=require('../models/review.js');

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String,
    filename:String
  },
  price: Number,
  location: String,
  country: String,
  category:
  {
      type:String,
      enum:['BeachFront','Mountains','Snow','Swimming','Castle','Camping','Sunny','Rainforest','Dome','Luxury'],
  },
  favourites:
  [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }
  ],
  reviews:
  [
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Review"
    }
  ],
  owner:
  {
    type:mongoose.Schema.ObjectId,
    ref:"User"  //this is the name which you give to the collection in db it would
  },
  geometry: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});



listingSchema.post("findOneAndDelete",async(listing)=>
{
  
  if(listing.reviews.length)
  {
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;