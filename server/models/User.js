const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasFaceRegistered: { type: Boolean, default: false },
  faceEmbedding: { type: [Number], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
