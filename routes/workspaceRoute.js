const express = require('express');
const router  = express.Router();
const validateToken = require('../middleware/middleware');
const { createWorkspace, getWorkspaceList, getWorkspaceDetail, updateWorkspace, getWorkspaceDetailTab } = require('../controllers/workspaceController');

router.get ('/workspaces', validateToken, getWorkspaceList);
router.post('/workspace' , validateToken, createWorkspace);
router.get ('/workspace/:workspaceID', validateToken, getWorkspaceDetail)
router.get ('/workspace/:workspaceID/:tabKey', validateToken, getWorkspaceDetailTab)
router.put ('/workspace/:workspaceID', validateToken, updateWorkspace);

module.exports = router;