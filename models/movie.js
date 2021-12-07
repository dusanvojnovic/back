const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const movieSchema = new Schema({
  movieId: { type: String, require: true },
  description: { type: String, require: true },
  imageUrl: { type: String, require: true },
  title: { type: String, require: true },
  year: { type: Number, require: true },
  user: { type: mongoose.Types.ObjectId, require: true, ref: 'User' },
});

module.exports = mongoose.model('Movie', movieSchema);
