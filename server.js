import express from 'express'
import errorHandler from './middlewares/errorHandler.js'
import userRoute from './routes/userRoute.js'
import courseRoute from './routes/courseRoute.js'
import paymentRoute from './routes/paymentRoute.js'
import connectDB from './config/connectDB.js'
import {config} from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import RazorPay from "razorpay";

config({path:'./config/config.env'})
import cloudinary from 'cloudinary'

const PORT=3000 || process.env.PORT

//middlewares

const app=express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true
}))

//mongodb connection
connectDB()

//cloudinary connection

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
// Razorpay

export const instance = new RazorPay({
    key_id: process.env.RAZORPAY_API_ID,
    key_secret: process.env.RAZORPAY_API_SECRET,
  });

//Routes
app.use('/campusX/v1',userRoute)
app.use('/campusX/v1',courseRoute)
app.use('/campusX/v1',paymentRoute)

//Passport
// app.get('/',(req,res)=>{res.send(`<a href="auth/google" >Login to Google</a>`)})
// app.use('/auth',auth)



// app.use('/campusX/v1',other)


//Custom ErrorHandler
app.use(errorHandler)
const server=app.listen(PORT,()=>{
    console.log(`The server is listening at port ${PORT}`);
})


//Unhandled server errors

process.on('unhandledRejection',(error)=>{
    console.log(`The logged error is ${error}`)
    server.close(()=>{
        console.log(`Closing server due to unhandled rejections`)
        process.exit(1)
    })
})
