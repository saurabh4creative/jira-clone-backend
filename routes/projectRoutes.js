const express = require('express');
const router  = express.Router(); 
const validateToken = require('../middleware/middleware');
const { createProject, getProjectList, getProjectDetail } = require('../controllers/projectController');

router.get('/projects', validateToken, getProjectList);
router.post('/project', validateToken, createProject);
router.get ('/project', validateToken, getProjectDetail);

module.exports = router;