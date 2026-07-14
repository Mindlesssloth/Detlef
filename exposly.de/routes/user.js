const express = require('express');
const router = express.Router();

// User Profile
router.get('/profile', (req, res) => {
  res.send('Profil - Coming soon');
});

module.exports = router;
