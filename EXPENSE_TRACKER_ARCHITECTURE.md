# Expense Tracker Web App - Architecture & Setup Guide

## Project Overview
A full-stack expense tracker application with user authentication, database persistence, and dynamic daily calculations. Users can track income, fixed expenses, savings goals, and daily expenses with real-time budget recommendations.

---

## Tech Stack

### Frontend
- **Framework**: React 18+ (with TypeScript recommended)
- **Styling**: Tailwind CSS or styled-components
- **State Management**: Context API or Redux (for scalability)
- **HTTP Client**: Axios or Fetch API
- **Build Tool**: Vite or Create React App

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: JavaScript or TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

### Database
- **Primary Option**: MySQL 8.0+
- **Alternative Option**: SQLite (sqlite3 npm package for simpler local setup)
- **ORM**: Sequelize or TypeORM (or raw queries with mysql2/sqlite3)

### Development Tools
- **Version Control**: Git
- **Environment Variables**: dotenv
- **API Testing**: Postman or Insomnia
- **Local Development**: nodemon (auto-restart backend), concurrently (run front + back)

---

## Project Structure

```
expense-tracker/
├── frontend/                      # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── IncomeForm.jsx
│   │   │   ├── FixedExpenseForm.jsx
│   │   │   ├── SavingsGoalForm.jsx
│   │   │   ├── DailyExpenseForm.jsx
│   │   │   ├── ExpenseHistory.jsx
│   │   │   └── Navigation.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── MainPage.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios/Fetch wrapper for API calls
│   │   ├── context/
│   │   │   └── AuthContext.js    # Global auth state
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js (or create-react-app)
│
├── backend/                       # Express server
│   ├── config/
│   │   ├── database.js           # Database connection
│   │   └── env.js                # Environment variables
│   ├── models/
│   │   ├── User.js               # User schema/model
│   │   ├── FixedExpense.js       # Fixed expense schema
│   │   ├── DailyExpense.js       # Daily expense schema
│   │   └── SavingsGoal.js        # Savings goal schema
│   ├── routes/
│   │   ├── auth.js               # /api/auth/* endpoints
│   │   ├── income.js             # /api/income/* endpoints
│   │   ├── fixedExpenses.js      # /api/fixed-expenses/* endpoints
│   │   ├── savingsGoals.js       # /api/savings-goals/* endpoints
│   │   └── dailyExpenses.js      # /api/daily-expenses/* endpoints
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── errorHandler.js       # Global error handling
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   ├── incomeController.js
│   │   ├── expenseController.js
│   │   ├── goalController.js
│   │   └── dashboardController.js # Calculations & metrics
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   └── .env                      # Environment variables (don't commit)
│
└── README.md                      # Project setup instructions
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Monthly Income Table
```sql
CREATE TABLE monthly_income (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_month (user_id, year, month)
);
```

### Fixed Expenses Table
```sql
CREATE TABLE fixed_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Savings Goals Table
```sql
CREATE TABLE savings_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  target_months INT NOT NULL,
  monthly_savings DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Daily Expenses Table
```sql
CREATE TABLE daily_expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, expense_date)
);
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/login` — Login and receive JWT token
- `POST /api/auth/logout` — Logout (optional, client-side token removal)
- `GET /api/auth/me` — Get current user (protected)

### Income Management
- `GET /api/income` — Get current month's income (protected)
- `POST /api/income` — Set/update monthly income (protected)
- `GET /api/income/:year/:month` — Get specific month's income (protected)

### Fixed Expenses
- `GET /api/fixed-expenses` — List all fixed expenses (protected)
- `POST /api/fixed-expenses` — Create fixed expense (protected)
- `PUT /api/fixed-expenses/:id` — Update fixed expense (protected)
- `DELETE /api/fixed-expenses/:id` — Delete fixed expense (protected)

### Savings Goals
- `GET /api/savings-goals` — List all active goals (protected)
- `POST /api/savings-goals` — Create savings goal (protected)
- `PUT /api/savings-goals/:id` — Update savings goal (protected)
- `DELETE /api/savings-goals/:id` — Deactivate goal (protected)

### Daily Expenses
- `GET /api/daily-expenses?date=YYYY-MM-DD` — Get expenses for specific date (protected)
- `GET /api/daily-expenses?month=YYYY-MM` — Get all expenses for month (protected)
- `POST /api/daily-expenses` — Add daily expense (protected)
- `PUT /api/daily-expenses/:id` — Update daily expense (protected)
- `DELETE /api/daily-expenses/:id` — Delete daily expense (protected)

### Dashboard & Calculations
- `GET /api/dashboard` — Get all metrics (protected)
  - Returns: current month's income, total fixed expenses, monthly savings amount, total monthly expenses so far, days remaining, max daily expense, today's expenses, remaining today

---

## Backend Logic - Key Calculations

### Dashboard Controller Endpoint
```
GET /api/dashboard

Returns:
{
  monthlyIncome: number,
  fixedExpenses: [],
  savingsGoal: {
    name: string,
    targetAmount: number,
    monthlyAmount: number,
    isActive: boolean
  },
  totalFixedExpenses: number,      // sum of all fixed expenses + monthly savings
  daysRemaining: number,            // days left in current month
  maxDailyExpense: number,         // (income - fixed - savings) / daysRemaining
  todayExpenses: number,            // sum of expenses logged for today
  remainingToday: number,          // maxDailyExpense - todayExpenses
  monthlyExpensesTotal: number,    // sum of all expenses logged this month
  projectedMonthlyExpenses: number // if trend continues
}
```

### Key Calculation Rules
1. **Total Fixed Expenses** = sum(all fixed expenses) + monthly savings goal amount
2. **Max Daily Expense** = (Monthly Income - Total Fixed Expenses) / Days Remaining
3. **Days Remaining** = days left in current calendar month (recalculates each day)
4. **Remaining Today** = Max Daily Expense - Today's Expenses (can be negative)
5. All calculations happen in the backend and are fetched fresh on each request

---

## Frontend Features & Components

### Authentication Flow
1. User lands on login/signup page
2. JWT token stored in localStorage (or sessionStorage)
3. Token included in all API requests via Authorization header
4. Protected routes check for valid token

### Main Dashboard
- Display current month's income
- Show all fixed expenses with edit/delete
- Display active savings goal and monthly contribution
- Show key metrics: max daily spend, days remaining, today's total

### Forms
- **Income Form**: Single input to set monthly income
- **Fixed Expense Form**: Add/edit expenses with name and amount
- **Savings Goal Form**: Name, total amount, number of months (auto-calculates monthly)
- **Daily Expense Form**: Quick entry for today's expenses

### Expense History
- Collapsible day-by-day breakdown
- Show daily total and comparison to max daily limit
- Delete individual expenses
- Export functionality (optional)

---

## Installation & Setup Instructions

### Prerequisites
- Node.js v18+ installed
- MySQL 8.0+ installed (or SQLite as alternative)
- Git installed
- Code editor (VS Code recommended)

### Step 1: Clone & Initialize
```bash
# Create project directory
mkdir expense-tracker
cd expense-tracker

# Initialize git
git init

# Create frontend and backend directories
mkdir frontend backend
```

### Step 2: Backend Setup

```bash
cd backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors dotenv bcrypt jsonwebtoken mysql2 sequelize
npm install --save-dev nodemon

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=expense_tracker
JWT_SECRET=your_super_secret_key_change_this
EOF

# Create basic directory structure
mkdir config models routes controllers middleware

# Create server.js
# (See Backend Implementation section below)
```

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 3: Database Setup

**For MySQL:**
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE expense_tracker;
USE expense_tracker;

# Run schema queries (use the schema section above)
```

**For SQLite:**
```bash
# No setup needed - database file created automatically
# Just install sqlite3: npm install sqlite3
```

### Step 4: Frontend Setup

```bash
cd ../frontend

# Create React app with Vite
npm create vite@latest . -- --template react

# Or use Create React App:
# npx create-react-app .

# Install dependencies
npm install axios react-router-dom

# Create .env file for API endpoint
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
```

**package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Step 5: Run Both Servers

**Option A: Separate terminals**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

**Option B: Concurrent (from root directory)**
```bash
# Install concurrently
npm install --save-dev concurrently

# Add to root package.json
npm run dev  # runs both frontend and backend
```

---

## Environment Variables Reference

### Backend (.env)
```
PORT=5000                           # Express server port
NODE_ENV=development                # development or production
DATABASE_HOST=localhost             # MySQL host
DATABASE_USER=root                  # MySQL user
DATABASE_PASSWORD=your_password     # MySQL password
DATABASE_NAME=expense_tracker       # Database name
JWT_SECRET=your_secret_key_here    # Secret for signing JWTs
JWT_EXPIRY=7d                      # Token expiration time
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api  # Backend API base URL
```

---

## Authentication Flow

### Registration (Sign Up)
1. User enters email and password
2. Frontend validates input
3. POST to `/api/auth/signup` with encrypted password (bcrypt hashing in backend)
4. Backend creates user record
5. Return success message, redirect to login

### Login
1. User enters email and password
2. POST to `/api/auth/login`
3. Backend verifies password using bcrypt.compare()
4. If valid, generate JWT token with user ID
5. Return token to frontend
6. Frontend stores token in localStorage
7. Redirect to dashboard

### Protected Routes
1. Frontend checks for token in localStorage
2. On page load, verify token with backend (GET /api/auth/me)
3. If valid, load dashboard
4. If invalid/expired, redirect to login
5. All API requests include token in Authorization header: `Bearer <token>`

---

## Error Handling Strategy

### Backend Error Handling
- Use global error middleware to catch all errors
- Return consistent error format:
  ```json
  {
    "success": false,
    "error": "Error message",
    "code": "ERROR_CODE"
  }
  ```
- HTTP status codes: 400 (bad request), 401 (unauthorized), 404 (not found), 500 (server error)

### Frontend Error Handling
- Wrap API calls in try-catch
- Display user-friendly error messages
- Show validation errors on forms
- Redirect to login on 401 unauthorized

---

## Security Considerations

1. **Password Storage**: Hash passwords with bcrypt (salt rounds: 10)
2. **JWT Security**: 
   - Store in localStorage or httpOnly cookie (httpOnly is more secure)
   - Include expiration time (7 days recommended)
   - Use strong secret key
3. **CORS**: Configure CORS on backend to allow frontend origin
4. **Input Validation**: Validate and sanitize all user inputs
5. **SQL Injection**: Use parameterized queries (Sequelize/ORM handles this)
6. **HTTPS**: Use in production (consider ngrok for local HTTPS testing)
7. **Rate Limiting**: Add rate limiting on auth endpoints

---

## Testing Strategy

### Backend Testing (Jest + Supertest)
```bash
npm install --save-dev jest supertest
```
- Test auth endpoints (signup, login)
- Test calculation logic (max daily expense, etc.)
- Test protected routes
- Mock database calls

### Frontend Testing (Vitest + React Testing Library)
```bash
npm install --save-dev vitest @testing-library/react
```
- Test component rendering
- Test form submissions
- Test API integration

---

## Deployment Options

### Local Development
- Run both servers locally as described above
- Access at http://localhost:5173 (frontend) and http://localhost:5000 (backend)

### Production Deployment
- **Backend**: Deploy to Heroku, Railway, Render, or DigitalOcean
- **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
- **Database**: Use hosted MySQL (AWS RDS, DigitalOcean, Heroku)
- Use environment variables for production secrets
- Enable HTTPS and CORS for production domain

---

## Migration Path (Optional)

If starting with SQLite and wanting to migrate to MySQL later:
- Use an ORM like Sequelize or TypeORM (handles multiple databases)
- Export SQLite data to CSV
- Import CSV to MySQL tables
- Update database connection string in .env

---

## Additional Features (Future Enhancements)

1. **Monthly Reports**: Generate PDF/CSV reports
2. **Budget Categories**: Categorize expenses
3. **Recurring Transactions**: Auto-log recurring bills
4. **Multi-User Support**: Family accounts
5. **Mobile App**: React Native version
6. **Expense Predictions**: ML-based forecasting
7. **Notifications**: Email/SMS alerts for overspending
8. **Data Export**: Download history
9. **Multiple Currencies**: Support different currencies
10. **Budget Alerts**: Notify when approaching daily limit

---

## Troubleshooting

### Common Issues

**Database Connection Error**
- Verify MySQL is running: `sudo service mysql status`
- Check credentials in .env match MySQL setup
- Ensure database name is correct

**CORS Error**
- Backend needs `npm install cors`
- Configure CORS in Express: `app.use(cors())`
- Check allowed origin matches frontend URL

**JWT Token Not Included**
- Verify token stored in localStorage after login
- Check API service includes Authorization header
- Verify token format: `Bearer <token>`

**Port Already in Use**
- Change PORT in .env or use different port
- Kill process: `lsof -i :5000` then `kill -9 <PID>`

---

## Resources & References

- **Express.js**: https://expressjs.com/
- **Sequelize ORM**: https://sequelize.org/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **MySQL**: https://dev.mysql.com/
- **JWT**: https://jwt.io/
- **bcrypt**: https://github.com/kelektiv/node.bcrypt.js

---

## Next Steps

1. Copy this architecture document
2. Go to Anthropic's Codebase Interpreter (Antigravity)
3. Share this architecture with Claude in Antigravity
4. Request implementation of backend (Node.js + Express + MySQL)
5. Request implementation of frontend (React + Vite)
6. Follow the installation steps above
7. Test all endpoints with Postman
8. Connect frontend to backend

Good luck building! 🚀
