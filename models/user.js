const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');


const userSchema=new mongoose.Schema(
    {
        email:
        {
            type:String,
            required:true,
        }
    }
)

userSchema.plugin(passportLocalMongoose);

const UserModel=mongoose.model("User",userSchema);

module.exports=UserModel;

