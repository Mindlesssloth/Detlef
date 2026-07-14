const express = require('express');
const router = express.Router();

// Pricing Page
router.get('/', (req, res) => {
  res.send('Zahlung - Coming soon');
});

module.exports = router;
