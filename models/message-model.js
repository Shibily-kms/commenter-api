const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema({


    conId: String,
    sender: String,
    text: String,
    msgId : String


},
    {
        timestamps: true
    })

const MessageModel = mongoose.model('messages', messageSchema)
module.exports = MessageModel