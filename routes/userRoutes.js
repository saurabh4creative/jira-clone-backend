const express = require('express');
const router  = express.Router();
const { registerUser, loginUser, getUserList, getAllUserList, generateRandom } = require('../controllers/userController');
const validateToken = require('../middleware/middleware');

router.post('/login', loginUser)
router.post('/register', registerUser) 
router.get ('/users', validateToken, getUserList)
router.get ('/user-list', validateToken, getAllUserList)
router.get ('/random', generateRandom);

module.exports = router;