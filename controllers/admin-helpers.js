const PostModel = require('../models/post-model')
const UserModel = require('../models/user-model')

const getAllCount = async (req, res, next) => {
    // User Count
    let userCount = await UserModel.aggregate([
        {
            $project: {
                status: 1
            }
        },
        {
            $group: {
                _id: '$status', 'sum': { $sum: 1 }
            }
        }
    ])
    let MainArray = []

    let userObj = {
        Active: 0,
        Blocked: 0,
        Total: 0
    }
    for (let i = 0; i < userCount.length; i++) {
        if (userCount[i]._id === 'Active') {
            userObj.Active = userCount[i].sum
            userObj.Total = userObj.Total + userCount[i].sum
        } else {
            userObj.Blocked = userCount[i].sum
            userObj.Total = userObj.Total + userCount[i].sum
        }
    }

    MainArray = [userObj]

    res.status(201).json({ status: true, MainArray, message: 'get all count' })

}

module.exports = { getAllCount }