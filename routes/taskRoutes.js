const express = require('express');
const router  = express.Router(); 
const validateToken = require('../middleware/middleware');
const { createTask, getTaskLists } = require('../controllers/taskController');

router.get('/tasks', validateToken, getTaskLists);
router.post('/task', validateToken, createTask);

module.exports = router;