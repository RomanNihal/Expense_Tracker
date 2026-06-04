# Spendo 💸

A personal finance tracker to manage your wallet, savings goals, and monthly spending — all in one clean dark UI.

🌐 **Live App:** [https://expense-tracker-iusl.vercel.app](https://expense-tracker-iusl.vercel.app)

---

## Features

- **Wallet Ledger** — log income, expenses, and savings with full edit/delete history
- **Monthly Breakdown** — per-month summary cards showing income, expenses, savings, and net balance
- **Fixed Items** — set recurring monthly income and costs that auto-apply on the 1st of each month
- **Savings Vault** — track savings separately from your wallet with deposit/withdrawal logs
- **Savings Goals** — set targets with monthly allocations; extend goals if you need more time
- **Overdue Goal Detection** — goals past their target period show a warning and offer extend/delete
- **Dashboard** — wallet balance, daily allowance tracker, spending chart, and goal overview
- **Fully Responsive** — works on desktop and mobile (bottom tab navigation on phones)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router 7 |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP | Axios |
| Backend | Node.js, Express 5 |
| ORM | Sequelize 6 |
| Database | SQLite (local) · PostgreSQL (production) |
| Auth | JWT + bcrypt |

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/spendo.git
cd spendo
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
JWT_SECRET=any-local-secret-string
PORT=5000
```

Start the backend:

```bash
node server.js
```

> The backend runs on `http://localhost:5000` and auto-creates a local `database.sqlite` file.

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

> The app opens at `http://localhost:5173`

---

## Deployment

This app is deployed with:
- **Frontend** → [Vercel](https://vercel.com)
- **Backend + Database** → [Railway](https://railway.app)

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for the full step-by-step instructions including how to migrate your existing data.

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `DATABASE_URL` | PostgreSQL connection string (set automatically by Railway) |
| `FRONTEND_URL` | Your Vercel frontend URL (for CORS) |
| `PORT` | Server port (set automatically by Railway) |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Full URL of the backend API, e.g. `https://your-backend.up.railway.app/api` |

---

## Project Structure

```
spendo/
├── backend/
│   ├── config/         # Database config (SQLite / PostgreSQL)
│   ├── controllers/    # Route handlers
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # Express route definitions
│   ├── export-data.js  # Export SQLite data to JSON
│   ├── import-data.js  # Import JSON data into PostgreSQL
│   ├── migrate.js      # DB schema migrations
│   └── server.js       # Entry point
└── frontend/
    ├── public/
    └── src/
        ├── components/ # Navigation
        ├── context/    # Auth context
        ├── pages/      # Dashboard, Wallet, Savings
        └── services/   # Axios API calls
```

---

## License

MIT
