const UserModel = require('../models/user-model')
const { customId } = require('../helpers/customId-helpers')
const otpHelper = require('../helpers/otp-helpers')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { sendNotification } = require('../helpers/notification-helpers')


// Admin And User Authenditaion


// User Auth Start
const checkSignUpData = async (req, res, next) => {
    try {

        let body = req.body
        let email = await UserModel.findOne({ emailId: body.emailId })
        let userName = await UserModel.findOne({ userName: body.userName })

        if (email) {
            res.status(400).json({ success: false, message: 'Email Id already used' })
        } else if (userName) {
            res.status(400).json({ success: false, message: 'user name already used' })
        } else {
            res.status(201).json({ success: true, message: 'user data is OK' })
        }

    } catch (error) {
        throw error;
    }
}

const sendOtp = async (req, res, next) => {
    try {
        let body = req.body
        otpHelper.dosms(body.number).then((response) => {
            if (response) {
                res.status(201).json({ success: true, message: 'Otp Sended to this number' })
            }
        })

    } catch (error) {
        throw error;
    }
}

const verifyOtp = (req, res, next) => {
    try {
        let body = req.body
        otpHelper.otpVerify(body.otp, body.mobile).then((response) => {
            if (response) {
                res.status(201).json({ success: true, message: 'Virification Success' })
            } else {
                res.status(400).json({ error: true, message: "Incurrect OTP" })
            }
        })
    } catch (error) {
        throw error;
    }
}

const doSingUp = async (req, res, next) => {
    try {
        let body = req.body
        body.password = await bcrypt.hash(body.password, 10)
        body.urId = customId(6, 'UR')
        UserModel.create(body).then((response) => {
            if (response) {
                sendNotification(body.urId, {
                    type: 'welcome',
                    text: `Hi ${body.firstName} ${body.lastName}, Welcome to Commenter. Start your unlimited enjoyment with commenter application`,
                    path: '/' + body.userName
                })
                res.status(201).json({ success: true, message: 'user sign up success' })
            } else {
                res.status(400).json({ success: false, message: 'User Sign up not completed , try now' })
            }
        })

    } catch (error) {
        throw error;
    }
}

// Forgot Password

const verifyUserNameOrEmail = async (req, res, next) => {
    try {
        let body = req.body
        await UserModel.findOne({ $or: [{ userName: body.name }, { emailId: body.name }] }).then((data) => {
            if (data) {
                res.status(201).json({ success: true, message: 'User is Available', emailId: data.emailId, mobile: data.mobile })
            } else {
                res.status(400).json({ error: true, message: 'Invalid user name or email Id' })
            }
        })

    } catch (error) {
        throw error;
    }
}

const setNewPassword = async (req, res, next) => {
    try {
        let body = req.body
        body.password = await bcrypt.hash(body.password, 10)
        await UserModel.updateOne({ emailId: body.emailId }, {
            $set: {
                password: body.password
            }
        }).then((result) => {
            res.status(201).json({ success: true, message: 'password updated' })
        })

    } catch (error) {
        throw error;
    }
}

const doSingIn = async (req, res) => {
    try {

     
        let body = req.body
        const maxAge = 60 * 60 * 24;

        let user = await UserModel.findOne({ $or: [{ userName: body.userName }, { emailId: body.userName }] })

        if (user) {
          
            if (user.status === "Blocked") {
                return res.status(400).json({ status: false, message: 'This Account Blocked' })
            }
            let status = await bcrypt.compare(body.password, user.password);
            if (status) {
               
                delete user._doc.password
                const token = jwt.sign({ userId: user.urId }, process.env.TOKEN_KEY, { expiresIn: maxAge })

                res.cookie("commenter", token, {
                    withCrdentials: true,
                    httpOnly: false,
                    maxAge: maxAge * 1000
                })

                res.status(201).json({
                    user: user, token,
                    success: true, message: 'Sing In Completed'
                })
            } else {
                
                res.status(400).json({ error: true, message: 'Incurrect Password' })
            }

        } else {
           
            res.status(400).json({ error: true, message: "Invalid User name Or Email Id" })
        }

    } catch (error) {
      
        throw error;
    }
}
const getUserData = async (req, res, next) => {
    try {

        const user = await UserModel.findOne({ urId: req.user.urId })
        delete user._doc.password
        res.status(200).json({
            user: user,
            status: true,
            message: 'User Verified'
        })

    } catch (error) {

        res.status(400).json({ status: false, error: true, message: 'Auth filed' })

    }
}

// User Auth End


// Admin Auth Start
const doAdminSignIn = (req, res, next) => {
    try {

        const maxAge = 60 * 60 * 24;
        const { emailId, password } = req.body
        let adminData = {
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD
        }

        if (emailId == adminData.email) {
            if (password == adminData.password) {
                const token = jwt.sign({ email: adminData.email }, process.env.TOKEN_KEY, { expiresIn: maxAge })

                res.cookie("commenterAdmin", token, {
                    withCrdentials: true,
                    httpOnly: false,
                    maxAge: maxAge * 1000
                })
                res.status(201).json({
                    status: true,
                    success: true,
                    admin: adminData.emailId,
                    message: 'Authentication Completed'
                })
            } else {
                res.status(400).json({
                    status: false,
                    error: true,
                    message: 'Incurrent Password'
                })
            }
        } else {
            res.status(400).json({
                status: false,
                error: true,
                message: 'Invalid Email Id'
            })
        }
    } catch (error) {
        throw error;
    }
}
const checkAdminData = (req, res, next) => {
    try {

        const jwtToken = jwt.verify(req.cookies.commenterAdmin, process.env.TOKEN_KEY)

        if (jwtToken) {

            const email = jwtToken.email
            res.status(200).json({
                admin: email,
                status: true,
                message: 'Admin Verified'
            })
        }
    } catch (error) {

        res.status(400).json({ status: false, error: true, message: 'Auth filed' })

    }
}
// Admin Auth End


module.exports = {
    checkSignUpData, sendOtp, verifyOtp, doSingUp, verifyUserNameOrEmail,
    setNewPassword, doSingIn, getUserData, doAdminSignIn, checkAdminData
}