const express = require('express');
const router = express.Router();
const requestUpdateCompanyController = require('../app/controllers/RequestUpdateCompanyController');
const authMDW = require('../app/middlewares/check-auth')

router.put('/update-process/:id', authMDW, requestUpdateCompanyController.updateProcessStatus);
router.post('/accept/:id', authMDW, requestUpdateCompanyController.accept);
router.post('/reject/:id', authMDW, requestUpdateCompanyController.reject);
router.get('/one-company', authMDW, requestUpdateCompanyController.showListOfCompany);
router.delete('/:id', authMDW, requestUpdateCompanyController.deactive);
router.post('/ban/:id', authMDW, requestUpdateCompanyController.ban);
router.get('/:id', authMDW, requestUpdateCompanyController.showDetail);
router.get('/', authMDW, requestUpdateCompanyController.showList);

module.exports = router;
