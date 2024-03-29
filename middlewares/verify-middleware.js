const jwt = require('jsonwebtoken')
const UserModel = require('../models/user-model')

const verifyAdmin = (req, res, next) => {
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            const jwtToken = jwt.verify(token, process.env.TOKEN_KEY)

            if (!token) {
                res.status(401)
                throw new Error('No token');
            }

            if (jwtToken) {
                next()
            } else {
                res.status(400).json({ success: false, error: true, message: 'admin token key get lost' })
            }
        }

    } catch (error) {
        throw error;
    }
}

const verifyUser = async (req, res, next) => {
    try {

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

            const token = req.headers.authorization.split(' ')[1];

            const jwtToken = jwt?.verify(token, process.env.TOKEN_KEY)

            if (jwtToken) {
                const urId = jwtToken.userId
                const user = await UserModel.findOne({ urId })
                if (!user) {
                    return res.status(400).json({ status: false, message: 'Invalid token' })
                }
                if (user.status === 'Blocked') {
                    res.status(400).json({ status: false, message: 'This Account Blocked' })
                } else {
                    req.user = {
                        urId: user.urId,
                        userName: user.userName
                    }
                    next()
                }
            } else {
                return res.status(400).json({ status: false, message: 'Invalid token' })
            }

            if (!token) {
                res.status(401)
                throw new Error('No token');
            }
        }




        // }


    } catch (error) {
        return res.status(500).json({ status: false, message: 'token not available' })

    }
}

module.exports = { verifyAdmin, verifyUser }


