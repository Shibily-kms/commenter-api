const UserModel = require('../models/user-model')
const { customId } = require('../helpers/customId-helpers')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

// About User 

const getUserList = async (req, res, next) => {
    try {
        const userList = await UserModel.find()

        userList.forEach(object => {
            delete object._doc['password'];
        });

        res.status(201).json({
            success: true, error: false,
            message: 'all user details',
            users: userList
        })
    } catch (error) {
        throw error;
    }
}
const userBlockOrUnblock = async (req, res, next) => {
    let urId = req.params.urId
    try {
        await UserModel.findOne({ urId }).then((user) => {
            if (user.status === "Active") {
                UserModel.updateOne({ urId }, {
                    $set: {
                        status: "Blocked"
                    }
                }).then(() => {

                    res.status(201).json({ success: true, error: false, urId, message: 'User blocked' })
                })
            } else {
                UserModel.updateOne({ urId }, {
                    $set: {
                        status: "Active"
                    }
                }).then(() => {
                    res.status(201).json({ success: true, error: false, urId, message: 'User Unblocked' })
                })
            }
        }).catch((error) => {
            res.status(400).json({ success: false, error: true, urId, message: 'This user not valid' })
        })

    } catch (error) {
        throw error;
    }
}
// profile

const editProfile = async (req, res, next) => {
    try {
        let flag = false

        const body = req.body // {firstName, lastName, emailId,file, dob, location, website}
        const urId = req.user.urId

        let user = await UserModel.findOne({ urId })

        if (user.emailId != body.emailId) {
            await UserModel.findOne({ emailId: body.emailId }).then((response) => {
                if (response) {

                    flag = true
                }
            })
        }

        if (flag) {
            res.status(400).json({ status: false, message: 'this email Id existed' })
        } else {
            await UserModel.updateOne({ urId }, {
                $set: {
                    firstName: body.firstName,
                    lastName: body.lastName,
                    emailId: body.emailId,
                    location: body?.location,
                    website: body?.website,
                    dob: body.dob,
                    profile: body?.file ? body.file : user?.profile
                }
            }).then((result) => {
                user.firstName = body.firstName
                user.lastName = body.lastName
                user.emailId = body.emailId
                user.location = body?.location ? body.location : user?.location
                user.website = body?.website ? body.website : user?.website
                user.dob = body.dob
                user.profile = body?.file ? body.file : user?.profile
                delete user._doc.password

                res.status(201).json({ status: true, user, message: 'user details updated' })
            }).catch((error) => {
                res.status(400).json({ status: false, message: 'update faild' })
            })
        }


    } catch (error) {
        res.status(500).json({ status: false, message: 'update faild' })
    }
}
const getUsersOne = async (req, res, next) => {

    try {
        let urId = req.params.urId
        const user = await UserModel.findOne({ urId })
        let obj = {
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            profile: user.profile
        }
        res.status(201).json({ status: true, user: obj, message: 'get user small info' })
    } catch (error) {
        res.status(500).json({ status: false, error })
    }
}

// Notifications
const getAllNotifications = async (req, res, next) => {
    try {
        const urId = req.user.urId
        await UserModel.findOne({ urId }).then((user) => {
            let notifi = user.notifications.reverse()

            res.status(201).json({ status: true, notifications: notifi, message: 'get all notifications' })
        })
    } catch (error) {

    }
}
const viewNotification = async (req, res, next) => {
    try {
        const { urId, msgId } = req.body
        await UserModel.updateOne({ urId, 'notifications.msgId': msgId }, {
            $set: {
                'notifications.$.status': true
            }
        }).then((result) => {
            res.status(201).json({ status: true, message: 'This notification opened' })
        }).catch((error) => {
            res.status(400).json({ status: false, message: 'urId or msgId is not valid' })
        })
    } catch (error) {

    }
}
const getNewNotifiCount = async (req, res, next) => {
    try {
        await UserModel.aggregate([
            {
                $match: { urId: req.user.urId }
            },
            {
                $project: { _id: 0, notifications: 1 }
            },
            {
                $unwind: '$notifications'
            },
            {
                $group: {
                    _id: '$notifications.status', 'sum': { $sum: 1 }
                }
            }
        ]).then((result) => {
            result = result.filter((value) => value._id === false)
            res.status(200).json({ status: true, count: result[0] ? result[0].sum : 0 })
        })
    } catch (error) {

    }
}
const changePassword = async (req, res, next) => {
    try {
        const { current, password, confirm, urId } = req.body
        await UserModel.findOne({ urId }).then(async (user) => {
            let status = await bcrypt.compare(current, user.password);
            if (status) {
                const change = await bcrypt.hash(password, 10)
                await UserModel.updateOne({ urId }, {
                    $set: {
                        password: change
                    }
                }).then(() => {
                    res.status(201).json({ status: true, message: 'Password changed' })
                }).catch((error) => console.log(error))
            } else {
                res.status(400).json({ status: false, message: 'Invalid current password' })
            }
        })

    } catch (error) {

    }
}
const searchUser = async (req, res, next) => {
    try {
        let key = req.params.search
        let searchKey = new RegExp(`/^${key}/i`)
        await UserModel.aggregate([
            {
                $match: {
                    $or: [
                        { userName: { $regex: key, $options: 'si' } },
                        { firstName: { $regex: key, $options: 'si' } },
                        { lastName: { $regex: key, $options: 'si' } },
                    ]
                }
            },
            {
                $project: {
                    _id: 0, urId: 1, firstName: 1, lastName: 1, userName: 1, profile: 1
                }
            }
        ]).then((user) => {
            res.status(201).json({ statsu: true, result: user, message: 'get search result' })
        }).catch((error) => {
            res.status(400).json({ statsu: false, message: 'some error' })
        })
    } catch (error) {

    }
}
module.exports = {
    getUserList, userBlockOrUnblock, editProfile, getUsersOne, getAllNotifications,
    viewNotification, getNewNotifiCount, changePassword, searchUser
}