const express = require('express');
const router  = express.Router(); 
const validateToken = require('../middleware/middleware');
const { createProject, getProjectList, getProjectDetail, getProjectTaskList, getProjectUserList, updateProjectUserList, getProjectIssueList } = require('../controllers/projectController');

router.get('/projects', validateToken, getProjectList);
router.post('/project', validateToken, createProject);
router.get ('/project', validateToken, getProjectDetail);
router.get ('/project/:projectID/lists', validateToken, getProjectTaskList);
router.get ('/project/:projectID/issues', validateToken, getProjectIssueList);
router.get ('/project/:projectID/users', validateToken, getProjectUserList);
router.put ('/project/:projectID/users', validateToken, updateProjectUserList);

module.exports = router;