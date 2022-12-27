const UserModel = require('../models/user-model');
const { customId } = require('./customId-helpers')

const sendNotification = async (urId,  message) => {   //message ==> type,text,path
    let notifi = {
        ...message, //type,text,path
        msgId: customId(6, 'MS'),
        time: new Date(),
        status: false,
    }

    await UserModel.updateOne({ urId }, {
        $push: {
            notifications: notifi
        }
    }).then(() => {
        return;
    })
}

const viewNotification = (urId, msgId) => {
    UserModel.updateOne({ urId, 'notifications.msgId': msgId }, {
        $set: {
            'notifications.$.status': true
        }
    }).then(() => {
        return;
    })
}

module.exports = { sendNotification, viewNotification }