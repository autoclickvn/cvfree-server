const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const Schema = mongoose.Schema

const Cv = new Schema({
  userId: {type: Number, required: true},
  color: { type: String, maxlength: 10, required: true },
  template: { type: String, maxlength: 20, required: true },
  fontSize: { type: String, maxlength: 10, required: true },
  fontFamily: { type: String, maxlength: 50, required: true },
  name: { type: String },
  categoryInfo: [{
    name: { type: String }
  }],
  categoryCV: [{
    name: { type: String }
  }],
  detail: {
    type: {
      fullname: {type: String, required: true},
      avatar: {type: String},
      applyPosition: { type: String },
      birthday: { type: String },
      gender: {type: String},
      phone: {type: String},
      address: {type: String},
      email: {type: String},
      facebook: { type: String },
      hobby: { type: String },
      careerGoals: { type: String },
      basicSkill: [{
        name: { type: String },
          star: {type: Number}
      }],
      education: [{
        name: { type: String },
          major: {type: String}
      }],
      workExperience: [{
        companyName: { type: String },
          position: { type: String },
          time: { type: String },
          description: {type: String}
      }],
      advancedSkill: [{
        name: { type: String },
          description: {type: String}
      }],
      activity: [{
        name: { type: String },
          time: {type: String}
      }],
      certificate: [{
        name: { type: String }
      }],
      award: [{
        name: { type: String }
      }],
      anotherInfo: [{
        info: { type: String }
      }],
      presenter: [{
        name: { type: String },
          company: { type: String },
          position: { type: String },
          phone: {type: String}
      }],
    }
  },
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Cv.plugin(autoIncrement.plugin, {
  model: 'cv',
  field: 'id'
});

module.exports = mongoose.model('Cv', Cv)
