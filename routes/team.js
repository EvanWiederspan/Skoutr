var express = require('express');
var router = express.Router();

// Team page

router.get('/team/:num', function(req, res) {
    res.send('Team #' + req.params.num);
});

module.export = router;