const express = require("express");
const router = express.Router();



router.post("/signup", async (req, res) => {

    try{
  let { name, email, password, dateOfBirth } = req.body;
  (name = name.trim()), //trim is used to remove white or extra spaces
    (email = email.trim()),
    (password = password.trim()),
    (dateOfBirth = dateOfBirth.trim());

  if (name == "" || password == "" || email == "" || dateOfBirth == "") {
    throw Error("Empty input fields")
 
  } else if (!/^[a-zA-Z]*$/.test(name)) {
    //this has to match the JSON object
   throw Error("Invalid name entered");
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    //email is checked if it contains the necessary symbols

   throw Error("Invalid email entered");
  } else if (new Date(dateOfBirth).getTime()) {
    //the date validity is checked

   throw Error("Invalid dateOfBirth entered");
  } else if (password.length < 8) {
    //the password length is checked

  throw Error("Password is too short");
  } else {
    //Checking if a user with the specified email exists
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "SUCCESSFUL",
            message: "User with the provided email exists!",
          });
        } else {
          //if the user does not exist, a new user can be created here

          ////password handling
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              //here the plain password is hashed for security reasons
              const newUser = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
                verified: false,
              });

              newUser
                .save()
                .then((result) => {
                  sendVerificationEmail(result, res);
                })

                .catch((err) => {
                  res.json({
                    status: "Failed",
                    message: "An error occurred while saving user account",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "Failed",
                message: "An error occurred while hashing password",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking for the existing user!",
        });
      });
  }
    } catch{

    }

});

