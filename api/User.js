const express = require('express')
const router = express.Router()
//const { google } = require('googleapis');
//const { OAuth2Client } = require('google-auth-library');



//in order to have access to the models page
const User = require('./../models/User')



//to have access to userverification model
const userVerification = require("./../models/UserVerification");    


//to have access to userverification model
const PasswordReset = require("./../models/PasswordReset");    


//email handler {nodemailer was installed, this helps us send emails to our app}
const nodemailer = require("nodemailer")



//unique string {uuid was installed to help generate rsndom strings}
const {v4: uuidv4} = require("uuid")      //version 4 is needed in the app


//.env variables
require("dotenv").config()



//password handler
const bcrypt = require('bcrypt')

const path = require("path")

               /*nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS
  }
});


to test if the transporter is functional because it carries the messages from the source to the destination
transporter.verify((error, success) => {
  if(error) {
    console.log(error)
  } else {
    console.log("Ready for messages")
    console.log(success)
   }


})*/

//for the sigup page
router.post('/signup', (req, res) => {

    let {name, email, password, dateOfBirth} = req.body
    name = name.trim(),                      //trim is used to remove white or extra spaces
    email = email.trim(),
    password = password.trim(),
    dateOfBirth = dateOfBirth.trim()

    if (name == "" || password == "" || email == "" || dateOfBirth == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        })
    } else if(!/^[a-zA-Z]*$/.test(name)) {                                  //this has to match the JSON object 
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    }else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {   //email is checked if it contains the necessary symbols

           res.json({
             status: "FAILED",
             message: "Invalid email entered"
           });
    }else if (new Date (dateOfBirth).getTime()) {      //the date validity is checked

          res.json({
            status: "FAILED",
            message: "Invalid date of Birth entered"
          });
    }else if (password.length < 8) {    //the password length is checked

          res.json({
            status: "FAILED",
            message: "Password is too short"
          });
    }else {


        //Checking if a user with the specified email exists
        User.find({email}).then(result => {
        if(result.length) {
              res.json({
                status: "SUCCESSFUL",
                message: "User with the provided email exists!"
              });
        }else {
            //if the user does not exist, a new user can be created here



            ////password handling
            const saltRounds = 10
            bcrypt
            .hash(password, saltRounds)
            .then(hashedPassword => {    //here the plain password is hashed for security reasons
               const newUser = new User({
                name,
                email,
                password: hashedPassword,
                dateOfBirth,
                verified: false

               })

               newUser
               .save()
               .then(result => {
              sendVerificationEmail(result, res)
                })
                
                 .catch(err => {
                 res.json({
                   status: "Failed",
                   message: "An error occurred while saving user account"
                 });


            })
         



                })
                 .catch(err => {
                 res.json({
                   status: "Failed",
                   message: "An error occurred while hashing password"
                 });
            })
        

    }

           

        })
        .catch(err => {
           console.log(err);
             res.json({
             status: "FAILED",
             message: "An error occurred while checking for the existing user!"
           });
        })

    }
  })


//where verification email is sent
const sendVerificationEmail = ({_id, email}, res) => {
//url to be used in the email
const currenturl = "http://localhost:5000/"

//the unique string
const uniqueString = uuidv4() + _id


//mail options
const mailOptions = {
  from: process.env.AUTH_EMAIL,
  to: email,
  subject: "verify your email",
  html: `<p>Verify your email address to complete the signup and login into your account!</p><p>This link <b>expires in 6 hours</b></p><p>Press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}>here</a> to proceed</p>`,
};

//hashing the uniqueString
const saltRounds = 10
bcrypt
.hash(uniqueString, saltRounds)
.then((hashedUniqueString) => {



//set value in userVerification collection
const newVerification = new UserserVerification({
  userId: _id,
  uniqueString: hashedUniqueString,
  createdAt: Date.now(),
  expiredAt: Date.now() + 21600000
})

newVerification
.save()
.then(() => {
transporter
.sendMail(mailOptions)
.then(() => {
   res.json({
     status: "Pending",
     message: "Verification email sent",
   });
})



.catch((error) => {
  console.log(error)
 res.json({
   status: "FAILED",
   message: "Verification email failed!",
 });
})



})
.catch((error) => {
console.log(error)
 res.json({
   status: "FAILED",
   message: "Couldn't save email verification data!",
 });
})


})
.catch(() => {
   res.json({
     status: "FAILED",
     message: "An error occurred while hashing email data!",
   });
})
}


//verify email
router.get("/verify/:userId/:uniqueString", (req, res) => {
let { userId, uniqueString } = req.params


//to check if the verification record exists
userVerification
.find({userId})
.then((result) => {
  if(result.length > 0) {


    const {expiresAt} = result[0]
    const hashedUniqueString = result[0].uniqueString


    //this checks if the time has expired
    if (expiresAt < Date.now()) {
        
      //if record has expired it is deleted
      userVerification
      .deleteOne({userId})
      .then(result => {
         User
         .deleteOne({_id: userId})
         .then(() => {
                  let message =   "Link has expired. Please sign Up again";
       res.redirect(`/user/verified/error=true&message=${message}`);
    
         })


         .catch(error => {
           let message =   "Clearing user with expired unique string failed";
              res.redirect(`/user/verified/error=true&message=${message}`);
         })
      })


      .catch((error) => {
        console.log(error)
       let message =   "An error occurred while clearing expired user verification record";
       res.redirect(`/user/verified/error=true&message=${message}`);
      })

    }else{
      //because the record is valid, the user string is validated
      bcrypt
      .compare(uniqueString, hashedUniqueString)       //the hashed unique string is compared with the plain one to confirm 
      .then(result => {
        if(result) {
            //if strings match
            User
            .updateOne({_id: userId}, {verified: true})
            .then(() => {
              UserVerification
              .deleteOne({userId: true})
              .then(() => {
                res.sendFile(path.join(__dirname, "./../view/verified.html"))
              })
              .catch(error => {
                console.log(error)
                 let message =   "An error occurred while finalising successful verification";
                 res.redirect(`/user/verified/error=true&message=${message}`);
              })
            }) 
            .catch(error => {
              console.log(error)
                 let message =   "An error occurred while updating user  record to show verified";
                 res.redirect(`/user/verified/error=true&message=${message}`);
            })


        }else{
          //it means that the details exist, however they are icoreect
             let message =   "Invalid verification details passed. Check your inbox!";
             res.redirect(`/user/verified/error=true&message=${message}`);
        }
      })
      .catch(error => {
           let message =
             "An error occurred while comparing unique strings";
           res.redirect(`/user/verified/error=true&message=${message}`);
      })
    }


  }else{
       let message =
         "Account record doesn't exist or has been verified already! Please sign up or login";
       res.redirect(`/user/verified/error=true&message=${message}`);
  }
})
.catch((error) => {
  console.log(error);
  //the user is returned to a page where the success or error message is displayed which is the views
  let message = "An error while checking for existing user verification record";
  res.redirect(`/user/verified/error=true&message=${message}`);
})


})

//verified page route
router.get("/verified", (req, res) => {
res.sendFile(path.join(__dirname, "./../views/verified.html")) 
})

//for the signin page
router.post("/signin", (req, res) => {

     let { email, password, } = req.body
    email = email.trim(),
    password = password.trim()


    if( email == "" || password == ""){     //it checks if a user email and password are both empty 
    res.json({                              //if they are it supplies this
        status: "FAILED",
        message: "Empty credentials supplied"
    })
    } else{                                  //if they are not, it goes ahead to check if their details supplied exist in the db
        User.find({email})
        .then(data => {
            if (data.length) {                        //once it is confirmed that the user exists, the password is compared with the hashed one

              if(!data[0].verified) {
                res.json({
                  status: "FAILED",
                  message: "Email hasn't been verified yet! Check your inbox!",
                });
              }else{
                 const hashedPassword = data[0].password;
                 bcrypt
                   .compare(password, hashedPassword)
                   .then((result) => {
                     if (result) {
                       res.json({
                         status: "SUCCESSFUL",
                         message: "Signin successful",
                         data: data, //the data is added from the db
                       });
                     } else {
                       res.json({
                         status: "FAILED",
                         message: "Invalid password entered!",
                       });
                     }
                   })
                   .catch((err) => {
                     res.json({
                       status: "FAILED",
                       message: "An error occurred while comparing passwords",
                     });
                   });
              }
             

            } else{
                res.json ({
                    status: "Failed",
                    message: "Invalid credentials entered"

                })
            }
        })
         .catch(err => {
                res.json({
                status: "FAILED",
                message: "An error occurred while checking for existing user"
              })
            })
    }
});


//for the password reset
router.post("/requestPasswordReset", (req, res) => {
  const {email, redirectUrl} = req.body

  User.find({email})                 //this checks if the email exists, if it doesn't it returns an error
  .then((data) => {
    if (data.length){ 
       if (!data[0].verified){                      //to check if user is verified
      res.json({
        status: "Failed", 
        message: " Email hasn't been verified yet. Check your inbox!"
      }) 
      
    }else{                // it proceeds with email to reset password
       sendResetEmail(data[0], redirectUrl, res)
    }

    }else{
      res.json({
        status: "Failed",
        message: "No account with the supplied email exists!"
      })
    }
  })
  .catch(error => {
    console.log(error)
    res.json({
      status: "Failed",
      message: "An error occurred while checking for existing user"
    })
  })


})


//the password reset email is sent
const sendResetEmail = ({_id, email}, redirectUrl, res) => {
const resetString = uuidv4() + _id   //these two are generated


   PasswordReset
   .deleteMany({userId: _id})                           //the record is cleared because a user can request for more password reset collection more than once
   .then(result => {
                                  //here the records have been deleted successfully
   
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Password Reset",
    html: `<p>we heard that you lost your password</p><p>This link <b>Don't worry, use the link below to reset it</p><p>This link <b>expires in 60 minutes</b>.</p> Press <a href=${
      redirectUrl + "/" + _id + "/" + resetString
    }>here</a> to proceed</p>`,
  };
   

  //storing the hashed resetString in the db
  const saltRounds = 10
  bcrypt
  .hash(resetString, saltRounds)
  .then(hashedResetString => {
    const newPasswordReset = new PasswordReset({
      userId: _id,
      resetString: hashedResetString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000
    })

    newPasswordReset
    .save()
    .then(() => {
      transporter
      .sendMail(mailOptions)
      .then(() => {
        res.json({
          status: "Pending",
          message: "Password reset email sent!"
        })
      })


      .catch(error => {
          console.log(error);
          res.json({
            status: "Failed",
            message: " Password reset email failed!",
          });
      })
    })
    .catch(error => {
      console.log(error)
         res.json({
           status: "Failed",
           message: "Couldn't save the password reset data",
         });
    })
  })
  .catch(error => {
    console.log(error)
    res.json({
      status: "Failed",
      message: "An error occurred while hashing the password reset data"
    })
  })
   
})


   .catch(error => {
    console.log(error)
               res.json({
                 status: "Failed",
                 message: "Clearing existing password reset records failed!",
               });

   })
      
}


router.post("/resetPassword", (req, res) => {
  let {userId, resetString, newPassword} = req.body    //to reset the password


  PasswordReset
  .find({userId})
  .then(result => {
    if(result.length > 0) {

      const { expiresAt} = result[0]    //to check if the password is stillvalid
      const hashedResetString = result[0].resetString


      if(expiresAt < Date.now()) {
        PasswordReset
        .deleteOne({userid})
        .then(() => {
             res.json({
               status: "Failed",
               message: "Passowrd reset link has expired",
             });
        }
          
        )
        .catch(error => {
          console.log(error)
               res.json({
                 status: "Failed",
                 message: " Clearing passowrd reset record failed",
               });
        })
      } else {
         bcrypt
         .compare(resetString, hashedResetString)                                          //because record exists, the reset string is validated
        .then((result => {
          if(result) {

            const saltRounds = 10
            bcrypt
            .hash(newPassword, saltRounds)
            .then(hashesNewPassword => {
              User.updateOne({_id: userid}, {password: hashednewPassword})
              .then(() => {
              PasswordReset                           //update is complete...reset record is deleted
              .deleteOne({userId})
              .then(() => {
                    
                     res.json({
                       status: "Status",
                       message: "Password has been reset successfully",
                     }); 
              })

              .catch(error => {
                 console.log(error);
                 res.json({
                   status: "Failed",
                   message: "An error occurred while finalising password reset",
                 }); 
                
              })
                console.log(error)
                  res.json({
                    status: "Failed",
                    message: "Updating user password failed",
                  }); 
              })
            })
            .catch(error => {
              console.log(error)
                res.json({
                  status: "Failed",
                  message: "An error occurred while hashing new password",
                }); 
            })
          }else{
            res.json({    
          status: "Failed",
        message: "Comaparing password reset details failed"
          }) 
          }
        }))
        .catch(error => {
          res.json({    
          status: "Failed",
        message: "Comaparing password reset strings failed"
          })
        })
        }

    }else{                             //if the password reset link does not exist
      res.json({
        status: "Failed",
        message: "Passowrd reset request not found"
      })
    }
  })


  .catch(error => {
       console.log(error)
       res.json({
        status: "Failed",
        message: "Checking for existing password reset record failed"
       })
  })
   


})


module.exports = router