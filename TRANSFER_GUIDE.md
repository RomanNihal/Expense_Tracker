# 🚀 Device Transfer & Migration Guide

Since this project uses a local database and private environment variables, **these files are NOT pushed to GitHub** for security. When moving to a new device, follow this guide.

---

### 📦 1. The "Manual" Migration Kit
Before you switch devices, copy these **3 files** (e.g., via USB, Private Cloud, or Email).

| File Path | Location | Why you need it |
| :--- | :--- | :--- |
| **`database.sqlite`** | `backend/` | Contains all your users, expenses, and goals. |
| **`.env`** | `backend/` | Contains your `JWT_SECRET` (needed to log in). |
| **`.env`** | `frontend/` | Contains the Backend API URL. |

---

### 🛠️ 2. Setting up on the New Device

1. **Clone the Repository**:
   ```bash
   git clone <your-private-repo-url>
   cd Expense_Tracker
   ```

2. **Paste the Migration Kit**:
   Put the 3 files you copied into their respective `backend/` and `frontend/` folders.

3. **Install Dependencies**:
   From the **root** folder, run:
   ```bash
   npm run install-all
   ```

4. **Start the App**:
   ```bash
   npm run dev
   ```

---

### 💡 Troubleshooting
- **"Invalid Token" after move?** Make sure you copied the `backend/.env` file correctly. The token key must match what's in the database.
- **Empty Dashboard?** Make sure `database.sqlite` was placed exactly in the `backend/` folder.
