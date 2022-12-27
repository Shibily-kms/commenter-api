const UserModel = require('../models/user-model')
const PostModel = require('../models/post-model')
const jwt = require('jsonwebtoken')
const { sendNotification } = require('../helpers/notification-helpers')


const getFriendsSuggestions = async (req, res, next) => {
    try {
        const { count } = req.params
        const urId = req.user.urId

        let ThisUser = await UserModel.findOne({ urId })
        let following = ThisUser.following
        following.push(ThisUser.urId)
        let list = []

        await UserModel.find().then((users) => {
            list = users
            for (let i = 0; i < following.length; i++) {
                for (let j = 0; j < list.length; j++) {
                    if (following[i] === list[j].urId) {
                        list.splice(j, 1);
                    }
                }
            }

            list = list.map((user) => {
                return {
                    urId: user.urId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    profile: user?.profile
                }
            })

            res.status(201).json({ success: true, users: list, message: 'user-list' })
        })
    } catch (error) {

    }
}

const doFollow = async (req, res, next) => {
    try {

        const urId = req.user.urId
        let { followId } = req.body

        await UserModel.updateOne({ urId }, {
            $push: {
                following: followId
            }
        }).then((result) => {

            UserModel.updateOne({ urId: followId }, {
                $push: {
                    followers: urId
                }
            }).then((response) => {
                sendNotification(followId, {
                    type: 'follow',
                    text: 'follwing update! @' + req.user.userName + ' followed you',
                    path: '/friends'
                })
                res.status(201).json({ success: true, message: 'follwing success' })

            })
        })
    } catch (error) {

    }
}

const doUnfollow = async (req, res, next) => {
    try {

        const urId = req.user.urId
        const { followId } = req.body

        await UserModel.updateOne({ urId }, {
            $pull: {
                following: followId
            }
        }).then((result) => {

            UserModel.updateOne({ urId: followId }, {
                $pull: {
                    followers: urId
                }
            }).then((response) => {

                res.status(201).json({ success: true, message: 'unfollow success' })

            })
        })
    } catch (error) {

    }
}

const getProfileInfo = async (req, res, next) => {
    try {
        const { userName } = req.params

        await UserModel.findOne({ userName }).then(async (profile) => {
            delete profile._doc.password
            await PostModel.aggregate([
                {
                    $match: {
                        urId: profile.urId
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
                res.status(201).json({ success: true, profile, posts, message: 'get profile info' })
            })
        }).catch((error) => {
            // Invalid user Name
            res.status(400).json({ error: true, message: "Invalid User Name" })
        })

    } catch (error) {

    }
}

const getAllFollowing = async (req, res, next) => {
    try {

        const urId = req.user.urId

        await UserModel.aggregate([
            {
                $match: {
                    urId
                }
            },
            {
                $unwind: '$following'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'following',
                    foreignField: 'urId',
                    as: 'data'
                }
            },
            {
                $project: {
                    firstName: { $first: '$data.firstName' },
                    lastName: { $first: '$data.lastName' },
                    userName: { $first: '$data.userName' },
                    urId: { $first: '$data.urId' },
                    profile: { $first: '$data.profile' }
                }
            }
        ]).then((resposne) => {
            res.status(201).json({ success: true, following: resposne, message: 'get follwing users' })
        })
    } catch (error) {

    }
}
const getAllFollowers = async (req, res, next) => {
    try {

        const urId = req.user.urId
        await UserModel.aggregate([
            {
                $match: {
                    urId
                }
            },
            {
                $unwind: '$followers'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'followers',
                    foreignField: 'urId',
                    as: 'data'
                }
            },
            {
                $project: {
                    firstName: { $first: '$data.firstName' },
                    lastName: { $first: '$data.lastName' },
                    userName: { $first: '$data.userName' },
                    urId: { $first: '$data.urId' },
                    profile: { $first: '$data.profile' }
                }
            }
        ]).then((resposne) => {
            res.status(201).json({ success: true, followers: resposne, message: 'get followers users' })
        })
    } catch (error) {

    }
}

module.exports = { getFriendsSuggestions, doFollow, doUnfollow, getProfileInfo, getAllFollowing, getAllFollowers }