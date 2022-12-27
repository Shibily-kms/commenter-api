const express = require('express');
const router = express.Router();
const upload = require('../config/multer')
const { checkSignUpData, sendOtp, verifyOtp, doSingUp, verifyUserNameOrEmail, setNewPassword,
    doSingIn, getUserData } = require('../controllers/auth-controller')

const { verifyUser } = require('../middlewares/verify-middleware')

const { doPost, getUserPost, likePost, savePost, removeSavePost, deletePost, getAllSavePost, getHomePost,
    doComment, removeComment, getOnePost } = require('../controllers/post-controller')

const { getFriendsSuggestions, doFollow, getProfileInfo, doUnfollow, getAllFollowing,
    getAllFollowers } = require('../controllers/friends-controller')

const { editProfile, getUsersOne, getAllNotifications, viewNotification, getNewNotifiCount,
    changePassword, searchUser } = require('../controllers/user-controller')

const { newConversation, getConversation } = require('../controllers/conversation-controller')

const { doMessage, getMessage } = require('../controllers/message-controller')

const { reportPost } = require('../controllers/report-controller');


// Sing Up And Otp
router.post('/check-signup', checkSignUpData)
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/sign-up', doSingUp)

//  Forgot Password
router.post('/verify-username-or-email', verifyUserNameOrEmail);
router.post('/new-password', setNewPassword);

// Sign In
router.post('/sign-in', doSingIn)
router.get('/get-user', verifyUser, getUserData)

// Post
router.post('/post', verifyUser, doPost)
router.get('/post/:postId', verifyUser, getOnePost)
router.put('/like', verifyUser, likePost)
router.get('/user-post', verifyUser, getUserPost)
router.get('/save-post', verifyUser, getAllSavePost)
router.put('/save-post', verifyUser, savePost)
router.delete('/save-post/:urId/:postId', verifyUser, removeSavePost)
router.delete('/delete-post/:urId/:postId', verifyUser, deletePost)

// Friends Post
router.get('/post', verifyUser, getHomePost)

// Friends
router.get('/friends-suggestions/:count', verifyUser, getFriendsSuggestions)
router.post('/follow', verifyUser, doFollow)
router.post('/unfollow', verifyUser, doUnfollow)
router.get('/following', verifyUser, getAllFollowing)
router.get('/followers', verifyUser, getAllFollowers)

// Comment
router.post('/comment', verifyUser, doComment)
router.delete('/comment/:comId/:postId', verifyUser, removeComment)

// User
router.put('/edit-profile', verifyUser, upload.single('profile'), editProfile)
router.get('/users/:urId', verifyUser, getUsersOne)
router.put('/change-password', verifyUser, changePassword)

// Conversation
router.post('/conversation', verifyUser, newConversation)
router.get('/conversation/:urId', verifyUser, getConversation)


// Message 
router.post('/message', verifyUser, doMessage)
router.get('/message/:conId', verifyUser, getMessage)

// Notifications
router.get('/notifications', verifyUser, getAllNotifications)
router.post('/notifications/view', verifyUser, viewNotification)
router.get('/notifications/new-count', verifyUser, getNewNotifiCount)

// Profile
router.get('/:userName', verifyUser, getProfileInfo)

// Report Post
router.post('/report-post', verifyUser, reportPost)

// Search
router.get('/search/user/:search', verifyUser, searchUser)



module.exports = router;