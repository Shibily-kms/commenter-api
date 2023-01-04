const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express() // Initializing express
app.use(cookieParser())
const dotenv = require('dotenv').config()
const connectDB = require('./config/db')
const port = process.env.PORT || 5000;

connectDB()

const { errorHandler } = require('./middlewares/error-middleware')

// routes
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')

app.use(cors())

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))



app.use('/', userRouter);
app.use('/admin', adminRouter);


app.use(errorHandler)

// Listen
app.listen(port, () => console.log(`Server connected `))
