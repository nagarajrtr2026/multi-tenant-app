const express = require('express');
const { addMember, getMembers } = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/add', addMember);
router.get('/', getMembers);

module.exports = router;
