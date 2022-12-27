const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    urId: {
        type: String,
        required: [true, ""]
    },
    firstName: {
        type: String,
        required: [true, "Pleace provide a first name"]
    },
    lastName: {
        type: String,
        required: [true, "Enter last name"]
    },
    userName: {
        type: String,
        required: [true, "Enter user name"]
    },
    emailId: {
        type: String,
        required: [true, "Enter emailId"]
    },
    mobile: {
        type: String,
    },
    password: {
        type: String,
    },
    profile: {
        type: String
    },
    dob:String,
    cover: {
        type: String
    },
    status: {
        type: String,
        default: 'Active',
    },
    savePost: [],
    following: [],
    followers: [],
    location: String,
    LifeStatus: String,
    website: String,
    notifications:[]

},
    {
        timestamps: true
    })

const UserModel = mongoose.model('user', userSchema)
module.exports = UserModel