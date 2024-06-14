const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  lecture_title: { type: String, required: true },
  transcript_title: { type: String, required: true },
  text: { type: String, required: true },
  detailed_summary: { type: String, required: true },
  bullet_summary: { type: String, required: true },
});

const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lectures: [lectureSchema]
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  subjects: [subjectSchema]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
