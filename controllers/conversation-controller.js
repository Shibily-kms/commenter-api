const ConversationModel = require('../models/conversation-model')
const { customId } = require('../helpers/customId-helpers')


const newConversation = async (req, res, next) => {

    const conversation = await ConversationModel.findOne({ members: { $all: [req.body.senderId, req.body.receiverId] } })
    if (conversation) {
        res.status(200).json(conversation)
    } else {
        const newConversation = new ConversationModel({
            conId: customId(7),
            members: [req.body.senderId, req.body.receiverId]
        })

        try {
            const savedConversation = await newConversation.save()
            res.status(200).json(savedConversation)
        } catch (error) {
            res.status(500).json(error)
        }

    }
}

const getConversation = async (req, res, next) => {
    try {
        let conversation = await ConversationModel.find({
            members: { $in: [req.params.urId] }
        })
        conversation = conversation.reverse()
        res.status(201).json({ status: true, conversation, message: 'get conversation' })
    } catch (error) {
        res.status(500).json(error)
    }
}
module.exports = { newConversation, getConversation }

