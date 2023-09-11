
//this will give us access to our mongodb file
require('./config/db')

const app = require('express')()
const port = 5000;
//const mongoose = require('mongoose')

const UserRouter = require('./api/User')

//for accepting post form data
const bodyParser = require('express').json
app.use(bodyParser())

app.use('/user', UserRouter)


/*const uri = "mongodb+srv://<Ifeoma>:<myloginemail>@login-email-cluster.0n6mbac.mongodb.net/?retryWrites=true&w=majority"

async function connect() {
    try{
        await mongoose.connect(uri)
        console.log("Connected to Mongodb")
    }catch (err) {
        console.log(err)
    }
}

connect()*/


app.listen(5000, () => {
    console.log(`Server is running on ${port}`);
    
})

