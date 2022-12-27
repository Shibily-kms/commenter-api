const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middlewares/verify-middleware')
const { doAdminSignIn, checkAdminData } = require('../controllers/auth-controller')
const { getUserList, userBlockOrUnblock } = require('../controllers/user-controller')
const { getAllReports, blockPost, cancelReport } = require('../controllers/report-controller')
const { getAllCount } = require('../controllers/admin-helpers')

// Sign In
router.post('/sign-in', doAdminSignIn)
router.get('/get-admin', verifyAdmin, checkAdminData);

// user List
router.get('/user-list', verifyAdmin, getUserList)
router.get('/user-block-or-unblock/:urId', verifyAdmin, userBlockOrUnblock)

// report
router.get('/reports', verifyAdmin, getAllReports)
router.post('/block-post', verifyAdmin, blockPost)
router.post('/cancel-report-post', verifyAdmin, cancelReport)

// Dashboard
router.get('/dashboard-count', verifyAdmin, getAllCount)

module.exports = router;