const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const exposeRoutes = require('./routes/expose');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const platformRoutes = require('./routes/platform');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
}));

app.use(cors());
app.use(compression());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exposly', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/exposly',
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport Configuration
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.session.success_msg || null;
  res.locals.error_msg = req.session.error_msg || null;
  delete req.session.success_msg;
  delete req.session.error_msg;
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/expose', exposeRoutes);
app.use('/payment', paymentRoutes);
app.use('/user', userRoutes);
app.use('/platform', platformRoutes);

// Landing Page
app.get('/', (req, res) => {
  res.render('index', {
    title: 'exposly.de - Professionelle Exposés erstellen',
    description: 'Erstelle professionelle Immobilien-Exposés für ImmoScout24, eBay Kleinanzeigen und mehr'
  });
});

// Dashboard
app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard - exposly.de',
    user: req.user
  });
});

// Pricing Page
app.get('/pricing', (req, res) => {
  res.render('pricing', {
    title: 'Preise - exposly.de',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// Auth Middleware
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.error_msg = 'Bitte melde dich an, um fortzufahren';
  res.redirect('/auth/login');
}

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Fehler - exposly.de',
    message: process.env.NODE_ENV === 'production' ? 'Ein Fehler ist aufgetreten' : err.message
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Seite nicht gefunden - exposly.de',
    message: 'Die angeforderte Seite wurde nicht gefunden'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 exposly.de läuft auf Port ${PORT}`);
  console.log(`📁 Umgebung: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
