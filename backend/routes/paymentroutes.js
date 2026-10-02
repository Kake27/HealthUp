// routes/paymentroutes.js
const express = require('express');
const { getClientToken, checkout } = require('../controllers/paymentcontroller.js');
const router = express.Router();

router.get('/token', getClientToken);
router.post('/checkout', checkout);

module.exports = router;
