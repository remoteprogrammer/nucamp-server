var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/sucess.html", function (req, res, next) {
  res.render("sucess", { title: "Express" });
});

//sample test

module.exports = router;
