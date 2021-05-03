const express = require("express");
const Favorite = require("../models/favorite");
const authenticate = require("../authenticate");
const cors = require("./cors");
const favorite = require("../models/favorite");

const favoriteRouter = express.Router();

//get, post and delete for all favorites
favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
        console.log(favorites);
      })
      .catch((err) => next(err));
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOne({ user: req.user._id })
        .then((favorite) => {
          if (favorite) {
            req.body.forEach((fav) => {
              if (!favorite.campsites.includes(fav._id)) {
                favorite.campsites.push(fav._id);
              }
            });
            favorite
              .save()
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch((err) => next(err));
          } else {
            Favorite.create({ user: req.user._id, campsites: req.body });
            favorite.save().then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            });
          }
        })
        .catch((err) => next(err));
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorite.findOneAndDelete({ user: req.user._id })
        .then((favorite) => {
          if (favorite) favorite.remove();
        })
        .then((favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        })
        .catch((err) => next(err));
    }
  );

//post and delete for a single favorite, ERRORS for get and put
favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))

  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorites.findOne({ user: req.user._id })
        .then(
          (favorite) => {
            if (favorite) {
              if (favorite.campsiteId.indexOf(req.params.campsiteId) === -1) {
                favorite.campsiteId.push(req.params.campsiteId);
                favorite.save().then(
                  (favorite) => {
                    console.log(
                      "That campsite is already in the list of favorites!"
                    );
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  },
                  (err) => next(err)
                );
              }
            } else {
              Favorites.create({
                user: req.user._id,
                campsite: [req.params.campsiteId],
              }).then(
                (favorite) => {
                  console.log("Favorite Created ", favorite);
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                },
                (err) => next(err)
              );
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Favorites.findOne({ user: req.user._id })
        .then(
          (favorite) => {
            if (favorite) {
              index = favorite.campsiteId.indexOf(req.params.campsiteId);
              if (index >= 0) {
                favorite.campsiteId.splice(index, 1);
                favorite.save().then(
                  (favorite) => {
                    console.log("Favorite Deleted ", favorite);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  },
                  (err) => next(err)
                );
              } else {
                err = new Error(
                  "Favorite " + req.params.campsiteId + " not found"
                );
                err.status = 404;
                return next(err);
              }
            } else {
              err = new Error("Favorites not found");
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

module.exports = favoriteRouter;
