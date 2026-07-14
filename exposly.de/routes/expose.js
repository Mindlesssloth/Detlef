const express = require('express');
const router = express.Router();

// Create Expose Page
router.get('/create', (req, res) => {
  res.send('Exposé erstellen - Coming soon');
});

// List Exposes
router.get('/list', (req, res) => {
  res.send('Meine Exposés - Coming soon');
});

module.exports = router;
