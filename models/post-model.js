const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    urId: {
        type: String,
        required: [true, ""]
    },
    postId: String,
    text: String,
    file: [],
    comments: [],
    reactions: [],
    commentCount: {
        type: Number,
        default: 0
    },
    reactCount: {
        type: Number,
        default: 0,
    },
    reports: [],
    reportCount: {
        type: Number,
        default: 0
    },
    block: {
        type: Boolean,
        default: false
    },

    createDate: Date


},
    {
        timestamps: true
    })

const PostModel = mongoose.model('posts', postSchema)
module.exports = PostModel