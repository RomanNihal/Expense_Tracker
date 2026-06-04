const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const { User, MonthlyIncome, FixedExpense, FixedIncome, SavingsGoal, Transaction } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000']
  : '*';
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/income', require('./routes/income'));
app.use('/api/fixed-expenses', require('./routes/fixedExpenses'));
app.use('/api/savings-goals', require('./routes/savingsGoals'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/savings', require('./routes/savings'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// DB sync promise — resolved once tables are created
const dbReady = sequelize.sync();

if (require.main === module) {
  // Local development
  dbReady
    .then(() => {
      console.log('Database synced successfully');
      app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch(err => console.error('Unable to sync database:', err));

  module.exports = app;
} else {
  // Vercel serverless — wait for DB before handling each request
  module.exports = async (req, res) => {
    await dbReady;
    return app(req, res);
  };
}
