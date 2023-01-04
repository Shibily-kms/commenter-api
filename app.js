const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express() // Initializing express
app.use(cookieParser())
const dotenv = require('dotenv').config()
const connectDB = require('./config/db')
const port = process.env.PORT || 5000;

connectDB()

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
    cors:{
        origin: 'https://chat.bristlesweb.club/'
        // origin:"http://localhost:3000"
    }
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
    console.log(' connection');
    // take urId and socketId from user
    socket.on('addUser', urId => {
        console.log('add new connection');
        addUser(urId, socket.id);
        io.emit('getUsers', users)
    })
    // Send and Get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        console.log('new message');
        io.to(user?.socketId).emit('getMessage', {
            senderId, text
        })
    })

    // Disconnect
    socket.on('disconnect', () => {
        console.log('dissconnecte');
        removeUser(socket.id)
        io.emit('getUsers', users)
    })
})



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
server.listen(port, () => {
    console.log(`server is running in port ${port}`);
  });
