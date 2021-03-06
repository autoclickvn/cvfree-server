const express = require('express');
const router = express.Router();
const candidateController = require('../app/controllers/CandidateController');
const authMDW = require('../app/middlewares/check-auth')

router.get('/jobId=:jobId/informations=:ids', authMDW, candidateController.showListCandidateInfos)
router.get('/:id', authMDW, candidateController.showCandidateDetail);
router.get('/', authMDW, candidateController.showListCandidate);

module.exports = router;
