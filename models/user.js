const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true, minLength: 6 },
  movies: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Movie' }],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
