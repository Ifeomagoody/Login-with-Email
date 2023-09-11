const mongoose = require('mongoose')  
const Schema = mongoose.Schema


const PasswordResetSchema = new Schema({
    userid: String,
    ResetString: String,         //a random String generated for a new user
    createdAt:  Date,
    expiresAt: Date,
})


const PasswordReset = mongoose.model("PasswordReset", PasswordResetSchema);


module.exports = PasswordReset;