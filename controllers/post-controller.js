const { customId } = require('../helpers/customId-helpers')
const PostModel = require('../models/post-model')
const UserModel = require('../models/user-model')
const jwt = require('jsonwebtoken')
const { sendNotification } = require('../helpers/notification-helpers')


// Post
const doPost = async (req, res, next) => {
    try {
        let body = req.body     //text,file,urId

        body.postId = customId(10, 'PS')
        body.createDate = new Date();
        await PostModel.create(body).then((result) => {
            UserModel.findOne({ urId: body.urId }).then((user) => {

                result._doc.firstName = user.firstName
                result._doc.lastName = user.lastName
                result._doc.userName = user.userName

                res.status(201).json({ success: true, error: false, post: result, message: 'new post Added' })
            })
        }).catch((error) => {
            res.status(400).json({ success: false, error: true, message: 'posts validation failed' })
        })
    } catch (error) {
        res.status(400).json({ success: false, error: true, message: 'Type Something' })
    }
}
// Get Post
const getUserPost = async (req, res, next) => {
    try {


        const urId = req.user.urId
        await PostModel.aggregate([
            {
                $match: {
                    urId,
                    block: false
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'urId',
                    foreignField: 'urId',
                    as: 'author'
                }
            },
            {
                $addFields: {
                    firstName: { $first: '$author.firstName' },
                    lastName: { $first: '$author.lastName' },
                    userName: { $first: '$author.userName' },
                    profile: { $first: '$author.profile' }
                }
            },
            {
                $project: {
                    author: 0
                }
            },
            {
                $sort: {
                    createDate: -1
                }
            }
        ]).then((posts) => {

            res.status(201).json({ success: true, error: false, posts, message: 'user all posts' })
        }).catch((error) => {
            res.status(400).json({ success: false, error: true, message: "Requseted data is Empty" })
        })

    } catch (error) {
        throw error;
    }
}
const getOnePost = async (req, res, next) => {
    try {
        let postId = req.params.postId
        await PostModel.aggregate([
            {
                $match: {
                    postId,

                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'urId',
                    foreignField: 'urId',
                    as: 'how'
                }
            },
            {
                $project: {
                    urId: 1, postId: 1, text: 1, file: 1, comments: 1, reactions: 1, createDate: 1,
                    commentCount: 1,
                    reports: 1,
                    reportCount: 1,
                    reactCount: 1,
                    block: 1,
                    firstName: { $first: '$how.firstName' },
                    lastName: { $first: '$how.lastName' },
                    userName: { $first: '$how.userName' },
                    profile: { $first: '$how.profile' }
                }
            }
        ]).then((result) => {
            res.status(201).json({ status: true, post: result[0], message: 'get one post' })
        }).catch((error) => {
            res.status(400).json({ status: false, message: 'PostId not match' })
        })

    } catch (error) {

    }
}
// Like Post
const likePost = async (req, res, next) => {
    try {

        const { urId, postId, posterId, like } = req.body
        if (like) {
            await PostModel.updateOne({ postId }, {
                $push: {
                    reactions: urId
                },
                $inc: {
                    reactCount: 1
                }
            }).then(() => {
                sendNotification(posterId, {
                    type: 'like',
                    text: '@' + req.user.userName + ' like your post. Post ID : ' + postId,
                    path: postId
                })
                res.status(201).json({ success: true, error: false, urId, postId, like: true, message: 'liked' })
            }).catch((error) => {
                res.status(201).json({ success: true, error: false, message: "can't find the post" })
            })
        } else {
            await PostModel.updateOne({ postId }, {
                $pull: {
                    reactions: urId
                },
                $inc: {
                    reactCount: -1
                }
            }).then(() => {
                res.status(201).json({ success: true, error: false, urId, postId, like: false, message: 'Unliked' })
            }).catch((error) => {
                res.status(201).json({ success: true, error: false, message: "can't find the post" })
            })

        }
    } catch (error) {
        throw error;
    }
}
// Save Post

const savePost = async (req, res, next) => {
    try {

        const { urId, postId } = req.body

        await UserModel.updateOne({ urId }, {
            $push: {
                savePost: postId
            }
        }).then(() => {
            res.status(201).json({ success: true, message: 'This post saved' })
        }).catch((error) => {
            res.status(400).json({ error: true, message: 'try now' })
        })
    } catch (error) {
        throw error;
    }

}
// Remove post from list
const removeSavePost = async (req, res, next) => {
    try {
        const { urId, postId } = req.params
        await UserModel.updateOne({ urId }, {
            $pull: {
                savePost: postId
            }
        }).then(() => {
            res.status(201).json({ success: true, postId, message: 'Removed form savelist' })
        }).catch((error) => {
            res.status(400).json({ error: true, message: 'try now' })
        })
    } catch (error) {
        throw error;
    }

}
// Get All Post
const getAllSavePost = async (req, res, next) => {
    try {

        const urId = req.user.urId
        await UserModel.aggregate([
            {
                $match: {
                    urId

                }
            },
            {
                $unwind: '$savePost'
            },
            {
                $project: {
                    _id: 0, urId: 1, savePost: 1
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'savePost',
                    foreignField: 'postId',
                    as: 'posts'
                }
            },
            {
                $unwind: '$posts'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'posts.urId',
                    foreignField: 'urId',
                    as: 'how'
                }
            },
            {
                $project: {
                    post: '$posts',
                    firstName: { $first: '$how.firstName' },
                    lastName: { $first: '$how.lastName' },
                    userName: { $first: '$how.userName' },
                    profile: { $first: '$how.profile' }
                }
            }


        ]).then((posts) => {
            posts = posts.filter((value) => value.post.block !== true)
            posts = posts.map((item) => {
                item.post.firstName = item.firstName
                item.post.lastName = item.lastName
                item.post.userName = item.userName
                item.post.profile = item.profile
                return item.post
            }).reverse()

            // posts = posts.sort((a, b) => a - b)
            res.status(201).json({ success: true, posts: posts, message: 'get all save posts' })
        })


    } catch (error) {
        throw error;
    }
}

const deletePost = async (req, res, next) => {
    try {

        const { urId, postId } = req.params
        await PostModel.deleteOne({ urId, postId }).then((result) => {
            res.status(201).json({ success: true, postId, message: 'Post removed' })
        }).catch((error) => {
            res.status(400).json({ error: true, message: "Can't delete post" })
        })
    } catch (error) {
        throw error;
    }
}

// Home Post
const getHomePost = async (req, res, next) => {
    try {

        const urId = req.user.urId

        let otherPost = await UserModel.aggregate([
            {
                $match: {
                    urId,

                }
            },
            {
                $unwind: '$following'
            },
            {
                $project: {
                    _id: 0, urId: 1, following: 1
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'following',
                    foreignField: 'urId',
                    as: 'posts'
                }
            },
            {
                $unwind: '$posts'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'following',
                    foreignField: 'urId',
                    as: 'how'
                }
            },
            {
                $project: {
                    post: '$posts',
                    uPost: 1,
                    firstName: { $first: '$how.firstName' },
                    lastName: { $first: '$how.lastName' },
                    userName: { $first: '$how.userName' },
                    profile: { $first: '$how.profile' }
                }
            },
            {
                $sort: {
                    'post.createDate': -1
                }
            }

        ])

        otherPost = otherPost.filter((value) => value.post.block !== true)
        otherPost = otherPost.map((item) => {
            item.post.firstName = item.firstName
            item.post.lastName = item.lastName
            item.post.userName = item.userName
            item.post.profile = item.profile
            return item.post
        })

        let userPost = await PostModel.aggregate([
            {
                $match: {
                    urId,
                    block: false
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'urId',
                    foreignField: 'urId',
                    as: 'author'
                }
            },
            {
                $addFields: {
                    firstName: { $first: '$author.firstName' },
                    lastName: { $first: '$author.lastName' },
                    userName: { $first: '$author.userName' },
                    profile: { $first: '$author.profile' }
                }
            },
            {
                $project: {
                    author: 0
                }
            },
            {
                $sort: {
                    createDate: -1
                }
            }
        ])

        let merge = otherPost.concat(userPost)
        merge = merge.sort((a, b) => b.createDate - a.createDate)

        res.status(201).json({ success: true, posts: merge, message: 'get home post', })

    } catch (error) {
        throw error;
    }
}


// Comment
const doComment = async (req, res, next) => {
    try {

        const { urId, userName, postId, text, profile } = req.body
        let obj = {
            urId,
            userName,
            text,
            profile,
            time: new Date()
        }
        obj.comId = customId(6)

        await PostModel.updateOne({ postId }, {
            $push: {
                comments: obj
            },
            $inc: {
                commentCount: 1
            }
        }).then((result) => {

            res.status(201).json({ success: true, comment: obj, message: 'Commented' })
        })


    } catch (error) {

    }
}
const removeComment = async (req, res, next) => {
    try {

        const { comId, postId } = req.params
        await PostModel.updateOne({ postId }, {
            $pull: {
                comments: {
                    comId: comId
                }
            },

            $inc: {
                commentCount: -1
            }

        }).then((response) => {

            res.status(201).json({ success: true, comId, message: 'remove success' })
        }).catch((error) => {

        })

    } catch (error) {

    }
}

module.exports = {
    doPost, getUserPost, getOnePost, likePost, savePost, removeSavePost,
    getAllSavePost, deletePost, getHomePost, doComment, removeComment
}