const express = require('express');
const multer = require('multer');
const path = require('path');
const { createSubmission, getSubmissions, updateSubmissionStatus } = require('../controllers/submissionController');
const authMiddleware = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.use(authMiddleware);
router.use(tenantMiddleware);

router.post('/', upload.single('file'), createSubmission);
router.get('/', getSubmissions);
router.put('/:id', updateSubmissionStatus);

module.exports = router;
