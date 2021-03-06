const CandidateManageModel = require('../models/CandidateManageModel')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const getPagingData = require('../helper/get-paging-data')
const checkUserTypeRequest = require('../helper/check-user-type-request')
const ApplyManageModel = require('../models/ApplyManageModel')

class CandidateManageController {

  // [GET] /candidate-manage
  async showList(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const {_id} = req.userRequest
  
    CandidateManageModel.findOne({employerId: _id})
      .then(candidateManage => {
        if (!candidateManage) {
          return resSuccess(res, {item: [], pagination: {page: 1, size: 10, totalPages: 0, totalItems: 0}})
        }
        const datas = candidateManage.candidates || []
        let activeDatas = []
        for (let i = 0; i < datas.length; i++){
          if (datas[i]._doc.status === 'ACTIVE') {
            activeDatas.push(datas[i])
          }
        }
        const { dataPaging, pagination } = getPagingData(req, activeDatas)
        
        return resSuccess(res, {items: dataPaging, pagination})
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /candidate-manage/done-candidate
  async updateDone(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const { _id } = req.userRequest
    const {cmId, userId} = req.body
  
    CandidateManageModel.findOne({employerId: _id})
      .then(candidateManage => {
        if (!candidateManage) {
          return resSuccess(res, {item: [], pagination: {page: 1, size: 10, totalPages: 0, totalItems: 0}})
        }
        let jobId = null
        let applyValue = null
        const datas = candidateManage.candidates || []
        for (let i = 0; i < datas.length; i++){
          if (datas[i]._id.toString() === cmId) {
            datas[i].isDone = true
            jobId = datas[i].jobId
            applyValue = datas[i].applyValue
          }
        }

        CandidateManageModel.findOneAndUpdate({ employerId: _id }, { candidates: datas })
          .then(() => {
            ApplyManageModel.findOne({userId})
              .then(applyManage => {
                let applies = applyManage.applies || []
                for (let i = 0; i < applies.length; i++){
                  if (applies[i]._doc.applyValue === applyValue && applies[i]._doc.jobId === jobId) {
                    applies[i]._doc.status = 'DONE'
                  }
                }

                ApplyManageModel.findOneAndUpdate({ userId }, { applies })
                  .then(() => resSuccess(res, null, 'UPDATED_STATUS_SUCCESS'))
                  .catch(e => resError(res, e.message))
              })
              .catch(e => resError(res, e.message))
          })
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }

  // [DELETE] /candidate-manage/delete-candidate
  async deactive(req, res, next) {
    await checkUserTypeRequest(req, res, next, ['EMPLOYER'])
    const { _id } = req.userRequest
    const {cmId} = req.body
  
    CandidateManageModel.findOne({employerId: _id})
      .then(candidateManage => {
        if (!candidateManage) {
          return resSuccess(res, {item: [], pagination: {page: 1, size: 10, totalPages: 0, totalItems: 0}})
        }
        const datas = candidateManage.candidates || []
        for (let i = 0; i < datas.length; i++){
          if (datas[i]._id.toString() === cmId) {
            datas[i].status = 'INACTIVE'
          }
        }

        CandidateManageModel.findOneAndUpdate({ employerId: _id }, { candidates: datas })
          .then(() => resSuccess(res, null, 'DELETED_CANDIDATE_SUCCESS'))
          .catch(e => resError(res, e.message))
      })
      .catch(e => resError(res, e.message))
  }
}

module.exports = new CandidateManageController();