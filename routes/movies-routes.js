const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check-auth');
const moviesController = require('../controllers/movies-controllers');

const router = express.Router();

router.get('/user/:uid', moviesController.getUserMovies);

router.use(checkAuth);

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('year').not().isEmpty(),
    check('description').not().isEmpty(),
    check('movieId').not().isEmpty(),
    check('imageUrl').not().isEmpty(),
  ],
  moviesController.addMovie
);

router.delete('/:mid', moviesController.deleteMovie);

module.exports = router;
