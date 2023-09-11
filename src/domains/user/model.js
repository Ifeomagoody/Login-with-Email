const mongoose = require("mongoose"); //this helps us communicate with our db
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  dateOfBirth: Date,
  verified: Boolean, //to confirm that a user is real
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
