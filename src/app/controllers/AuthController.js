const UserModel = require("../models/UserModel");
const checkExistsData = require('../helper/check-exists-data')
const USER_TYPE = require('../../constants/user-type')
const CONSTANTS = require('../../constants')
const generateToken = require('../helper/generate-token')
const moment = require('moment')
const md5 = require('md5')
const resSuccess = require('../response/response-success')
const resError = require('../response/response-error')
const sendEmail = require('../helper/send-email')

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cvfreecontact@gmail.com',
    pass: 'protoncf291'
  }
});

class AuthController {

  // [POST] /auth/sign-in
  async signIn(req, res) {
    const {username, password} = req.body
    if (!(await checkExistsData(UserModel, 'username', username)) || !(await checkExistsData(UserModel, 'password', password))) {
      return resError(res, 'USERNAME_OR_PASSWORD_INCORRECT', 409)
    }

    const user = await UserModel.findOne({ username })
    if (user && !user._doc.verify) {
      return resError(res, 'ACCOUNT_NOT_VERIFY')
    }
    if (user && user._doc.status === 'INACTIVE') {
      return resError(res, 'ACCOUNT_HAS_BEEN_LOCKED')
    }
    const accessTokenLife = CONSTANTS.accessTokenLife
    const accessTokenSecret = CONSTANTS.accessTokenSecret

    const dataForAccessToken = {
      username: user.username,
      email: user.email
    };

    const accessToken = await generateToken(
      dataForAccessToken,
      accessTokenSecret,
      accessTokenLife,
    );

    if (!accessToken) {
      return resError(res, 'CANNOT_GENERATE_TOKEN', 500)
    }

    return resSuccess(res,
      {
        userInfo: user,
        auth: {
          token: accessToken,
          expiredAt: moment().add(30, 'days').valueOf()
        }
      },
      'LOGIN_SUCCESS'
    )
  }

  // [POST] /auth/sign-up
  async signUp(req, res) {
    const {username, email, type} = req.body

    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions)
    }

    if (await checkExistsData(UserModel, 'username', username)) {
      return resError(res, 'USERNAME_ALREADY_EXISTS', 409)
    }
    if (await checkExistsData(UserModel, 'email', email)) {
      return resError(res, 'EMAIL_ALREADY_EXISTS', 409)
    }
    if (!USER_TYPE.includes(type)) {
      return resError(res, 'USER_TYPE_INVALID', 409)
    }

    let bonusData = {}
    if (type === 'USER') {
      bonusData = {numberOfCreateCv: 3}
    }
    if (type === 'EMPLOYER') {
      bonusData = {
        numberOfCandidateOpening: 3,
        numberOfPosting: 3,
        numberOfRequestUpdateCompany: 1
      }
    }

    const newUser = new UserModel({...req.body, ...bonusData})
    newUser.save()
      .then(() => {
        const verifyURL = `http://localhost:1112/verify-account/${Buffer.from(`${newUser._id}`).toString('base64')}`
        const  mailOptions = {
          from: 'cvfreecontact@gmail.com',
          to: email,
          subject: 'CVFREE - Xác thực tài khoản',
          text: `Xin chào ${username}. Bạn vừa đăng ký một tài khoản mới tại CVFREE. Hãy nhấp vào liên kết sau để xác thực tài khoản của mình: ${verifyURL}

Trân trọng,
CVFREE`
        };

        const resultSendEmailToUser = sendMailToUser(mailOptions)

        if (resultSendEmailToUser.result) {
          return resSuccess(res, { userInfo: newUser }, 'CREATED_ACCOUNT_SUCCESS', 201)
        }
        else {
          return resError(res, resultSendEmailToUser.error)
        }
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /auth/forgot-password
  async forgotPassword(req, res) {
    const { email } = req.body
    
    const sendMailToUser = async (mailOptions) => {
      return await sendEmail(mailOptions)
    }

    if (!(await (checkExistsData(UserModel, 'email', email)))) {
      return resError(res, 'EMAIL_INCORRECT', 409)
    }
    let newPassword = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i=0; i<6; i++) {
      newPassword += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    UserModel.findOneAndUpdate({ email }, { password: md5(newPassword) })
      .then(() => {
        const mailOptions = {
          from: 'cvfreecontact@gmail.com',
          to: email,
          subject: 'CVFREE - Quên mật khẩu',
          text: `Xin chào ${email}. Bạn vừa sử dụng chức năng quên mật khẩu tại CVFREE. Mật khẩu mới của bạn là: ${newPassword}

Trân trọng,
CVFREE`
        };

        const resultSendEmailToUser = sendMailToUser(mailOptions)

        if (resultSendEmailToUser.result) {
          return resSuccess(res, null, 'FORGOT_PASSWORD_SUCCESS')
        }
        else {
          return resError(res, resultSendEmailToUser.error)
        }
      })
      .catch(e => resError(res, e.message))
  }

  // [POST] /auth/verify/:id
  async verify(req, res) {
    const userId = req.body.userId || ''
    const regexASCII = /^[a-zA-Z0-9]+$/

    if (!regexASCII.test(userId) || !(await checkExistsData(UserModel, '_id', userId))) {
      return resError(res, 'USER_NOT_EXISTS', 409)
    }
    
    UserModel.findOneAndUpdate({ _id: userId }, { verify: true })
      .then(() => resSuccess(res, null, 'VERIFY_SUCCESS'))
      .catch(e => resError(res, e.message))
  }

}

module.exports = new AuthController();
