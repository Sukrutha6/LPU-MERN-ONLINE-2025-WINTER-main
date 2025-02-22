const mongoose = require("mongoose"); //mongoose is our helper which will talk in mongodb
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true, //trim hata deta extra space.
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
},{
    timestamps: true,

});
//schema is kind of a constructor for mongoose
const User= mongoose.model("users",userSchema);
//collection name is upto you par keep it noun and plural
module.exports= User; 