var express = require('express');
var router = express.Router();

/* GET posts listing. */
router.get('/', function (req, res, next) {
  res.send([
    { id: 0, caption: '', email: '', imageUrl: '' },
    { id: 1, caption: '', location: '', imageUrl: '' },
  ]);
});

module.exports = router;
