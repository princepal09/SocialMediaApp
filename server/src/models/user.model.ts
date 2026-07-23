import mongoose, { mongo } from "mongoose";
import bcrypt from 'bcrypt'
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index : true
    },
    bio: {
      type: String,
      default: "",
      maxlength: 200,
    },
    profileImage: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false, 
    },
  },
  {
    timestamps: true,
  }
);


userSchema.pre("save", async function(){
    if(!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.isPasswordCorrect = async function(password : string){
    return await bcrypt.compare(password, this.password);

}




export const User = mongoose.model("User", userSchema);