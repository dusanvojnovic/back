const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Movie = require('../models/movie');
const User = require('../models/user');

const getUserMovies = async (req, res, next) => {
  const userId = req.params.uid;

  let usersMovies;
  try {
    usersMovies = await User.findById(userId).populate('movies');
  } catch (err) {
    const error = new HttpError(
      'Fetching movies failed, please try again',
      500
    );
    return next(error);
  }

  if (!usersMovies || usersMovies.movies.length === 0) {
    const error = new HttpError('User has no movies!', 404);
    return next(error);
  }

  res.json({
    movies: usersMovies.movies.map((movie) =>
      movie.toObject({ getters: true })
    ),
  });
};

const addMovie = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid data passed, something went wrong', 422)
    );
  }

  const { movieId, title, description, imageUrl, year } = req.body;
  const addedMovie = new Movie({
    movieId,
    title,
    description,
    imageUrl,
    year,
    user: req.userData.userId,
  });

  let creator;
  try {
    creator = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new Error('Adding movie failed, please try again', 500);
    return next(error);
  }

  if (!creator) {
    const error = new HttpError('Could not find user', 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await addedMovie.save({ session: session });
    creator.movies.push(addedMovie);
    await creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError('Adding movie failed, please try again', 500);
    return next(error);
  }

  res.status(201).json({ movie: addedMovie });
};

const deleteMovie = async (req, res, next) => {
  const movieId = req.params.mid;

  let movie;
  try {
    movie = await Movie.findById(movieId).populate('user');
  } catch (err) {
    const error = new HttpError(err, 500);
    console.log(err);
    return next(error);
  }

  if (!movie) {
    const error = new HttpError('Could not find movie', 404);
    return next(error);
  }

  if (movie.user.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this movie',
      401
    );
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await movie.remove({ session: session });
    movie.user.movies.pull(movie);
    await movie.user.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete movie ',
      500
    );
    return next(error);
  }

  res.status(200).json({ message: 'Movie deleted.' });
};

exports.getUserMovies = getUserMovies;
exports.addMovie = addMovie;
exports.deleteMovie = deleteMovie;
