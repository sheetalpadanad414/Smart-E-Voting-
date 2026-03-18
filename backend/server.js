const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { testConnection } = require('./config/database');
const ElectionService = require('./services/electionService');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const testDatabaseConnection = require('./testDbConnection');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const voterRoutes = require('./routes/voterRoutes');
const electionOfficerRoutes = require('./routes/electionOfficerRoutes');
const observerRoutes = require('./routes/observerRoutes');
const otpRoutes = require('./routes/otpRoutes');
const voteRoutes = require('./routes/voteRoutes');
const locationRoutes = require('./routes/locationRoutes');
const partyRoutes = require('./routes/partyRoutes');
const electionCategoryRoutes = require('./routes/electionCategoryRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['Content-Type', 'Content-Length']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.use(apiLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.post('/api/test-db', async (req, res) => {
  try {
    const result = await testDatabaseConnection(req.body);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/voter', voterRoutes);
app.use('/api/election-officer', electionOfficerRoutes);
app.use('/api/observer', observerRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/election-categories', electionCategoryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    ElectionService.scheduleElectionChecks();
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Smart E-Voting System Backend`);
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`${'='.repeat(50)}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
