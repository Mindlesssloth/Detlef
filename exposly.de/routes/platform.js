const express = require('express');
const router = express.Router();

// Platform Export
router.get('/export', (req, res) => {
  res.send('Plattform Export - Coming soon');
});

module.exports = router;
