const PostModel = require('../models/post-model')
const { sendNotification } = require('../helpers/notification-helpers')
const { customId } = require('../helpers/customId-helpers')


const reportPost = async (req, res, next) => {
    try {
        const body = req.body
        const obj = {
            reason: body.reason,
            reporterId: body.reporterId,
            date: new Date()
        }

        await PostModel.updateOne({ postId: body.postId }, {
            $push: {
                reports: obj
            },
            $inc: {
                reportCount: 1
            }
        }).then(() => {
            res.status(201).json({ status: true, message: 'Report submitted' })
        }).catch((error) => {
            res.status(400).json({ status: false, error })
        })

    } catch (error) {

    }
}

const getAllReports = async (req, res, next) => {
    try {
        await PostModel.find({ reportCount: { $not: { $eq: 0 } } }).then((result) => {
            res.status(201).json({ status: true, reports: result, message: 'get all reports' })
        })
    } catch (error) {

    }
}

const blockPost = async (req, res, next) => {
    try {
        const { postId, urId, count, reason } = req.body
        PostModel.updateOne({ postId }, {
            $set: {
                block: true,
                reportCount: 0
            }
        }).then((result) => {
            sendNotification(urId, {
                type: 'report',
                text: 'Your post was Blocked! ' + count + ' pepole report your post (' + postId + ') at the reason of ' + reason,
                path: null
            })
            res.status(201).json({ status: true, message: 'this post is blocked' })
        })
    } catch (error) {

    }
}

const cancelReport = async (req, res, next) => {
    try {
        const { postId } = req.body
        PostModel.updateOne({ postId }, {
            $set: {
                reportCount: 0
            }
        }).then((result) => {
            res.status(201).json({ status: true, message: 'this report cancelled' })
        })
    } catch (error) {

    }
}

module.exports = { reportPost, getAllReports, blockPost, cancelReport }


