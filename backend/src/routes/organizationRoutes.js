const express = require('express');
const { getOrgTree } = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/tree', getOrgTree);

module.exports = router;
