const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express() // Initializing express
app.use(cookieParser())
const socketIO = require('socket.io');
const dotenv = require('dotenv').config()
const connectDB = require('./config/db')

connectDB()

const { errorHandler } = require('./middlewares/error-middleware')

// routes
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')


const port = process.env.PORT || 5000;
app.use(cors({
    // origin: ['http://localhost:3000'],
    origin: ['https://www.chat.bristlesweb.club/','https://chat.bristlesweb.club/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Access']
}))

const io = socketIO(process.env.SOCKET_PORT, {
    cors: {
        origin: 'http://localhost:3000',
    },
});

let users = []

const addUser = (urId, socketId) => {
    !users.some(user => user.urId === urId) &&
        users.push({ urId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (id) => {
    return users.find(user => user.urId === id)
}

io.on('connection', (socket) => {
    // take urId and socketId from user
    socket.on('addUser', urId => {
        addUser(urId, socket.id);
        io.emit('getUsers', users)
    })
    // Send and Get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('getMessage', {
            senderId, text
        })
    })

    // Disconnect
    socket.on('disconnect', () => {
        removeUser(socket.id)
        io.emit('getUsers', users)
    })
})

// Middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: false }))



app.use('/', userRouter);
app.use('/admin', adminRouter);


app.use(errorHandler)

// Listen
app.listen(port, () => console.log(`Server connected `))
