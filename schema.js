const Joi=require('joi');


const ListingSchema=Joi.object(
    {
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        country:Joi.string().required(),
        category:Joi.string().valid('BeachFront','Mountains','Snow','Swimming','Castle','Camping','Sunny','Rainforest','Dome','Luxury').required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null)
    }
)

const ReviewSchema=Joi.object(
    {
        rating:Joi.number().required().min(1).max(5),
        comment:Joi.string().required()
    }
)


module.exports={ListingSchema,ReviewSchema};