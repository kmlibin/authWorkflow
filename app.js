//dotenv
require('dotenv').config()

//server
const express = require('express');
const app = express();

//database
const connectDB = require('./db/connect')

//set up port variable and start function
const port = process.env.PORT || 5000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log('server is listening on 5000...'))
    }catch(err) {
        console.log(err)
    }
}

start();