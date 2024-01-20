var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send([
    { uid: 0, code: '', email: '', salt: '' },
    { uid: 1, code: '', email: '', salt: '' },
  ]);
});

module.exports = router;
