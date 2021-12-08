const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

const moviesRoutes = require('./routes/movies-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use(cors());
app.use('/api/movies', moviesRoutes);
app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

app.options('*', (req, res) => {
  res.json({ status: 'OK' });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zslhg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(process.env.PORT || 5000))
  .catch((err) => {
    console.log(err);
  });
