# Database Management Guide

## 1. View Database in VS Code (Recommended)
To see your data directly in VS Code, install the **SQLite Viewer** extension:
1. Open the **Extensions** view in VS Code (`Ctrl+Shift+X`).
2. Search for **"SQLite Viewer"** by *qwtel*.
3. Once installed, simply click on the `backend/database.sqlite` file in your explorer.
4. You can now browse all tables (`Users`, `Transactions`, etc.) and see your data in a nice grid.

## 2. CLI Admin Tool
I have created a `db-tools.js` file in your root directory for quick fixes.
Run these commands in your terminal:

- **List all users**: `node db-tools.js users`
- **Reset a password**: `node db-tools.js reset-pass [user-email]` (Sets password to `123456`)
- **Clear transactions**: `node db-tools.js clear-transactions`

## 3. Why the error happened?
The error occurred because SQLite does not support the "alter table" operations that Sequelize tries to do when we rename models. It got stuck trying to drop and recreate the `Users` table while foreign keys were active.

### How to fix a "Stuck" Database:
If you are still unable to log in or see errors:
1. Stop the server (`Ctrl+C`).
2. **Delete** the file `backend/database.sqlite`.
3. Start the server again (`npm run dev`).
4. **Sign up again**. This will create a fresh database that is perfectly compatible with the new wallet features.
