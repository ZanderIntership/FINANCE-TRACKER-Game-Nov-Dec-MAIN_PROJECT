# Application Finance (Node version)

This project was migrated from Flask to a simple Node/Express backend.

Quick start (PowerShell):

```powershell
# install dependencies
npm install

# start server
npm start
```

Open http://localhost:3000/ in your browser.

API endpoints:
- GET /api/transactions — recent transactions (reverse chronological)
- POST /api/transactions — add transaction (JSON body: date, description, amount, category, type)
- GET /api/assets — list assets
- POST /api/assets — add asset (JSON: name, price, account)
- GET /api/metrics — computed totals from transactions

Notes:
- Data is stored in-memory for demo. Replace storage with a database (SQLite/Postgres) for persistence.
- The frontend is static HTML in `templates/` and uses `static/scripts.js` to call the API.
