💸 Finance Tracker Demo (Dashboard + Spend Tracking + Net Worth)
Overview

This project is a simple finance tracker demo with multiple pages:

Home (Dashboard): Shows summary metrics and recent transactions.

Track Spend: Lets you add income/expense transactions.

Net Worth: Lets you add assets and see how they contribute to your net worth (including a chart).

About: Explains the purpose and limitations of the demo.

The UI is built with HTML/CSS and relies on a local server/API (referenced by ensureServer.js and scripts.js) to fetch and store data during runtime.

Features

📊 Dashboard metrics: total balance, monthly income/expenses, savings rate

🧾 Transaction entry form (income/expense + category)

🏦 Asset entry form and total assets display

🥧 Asset chart using <canvas> (demo visualization)

🧭 Simple navigation across all pages

Pages
/ — Home (Finance Dashboard)

Shows high-level metrics and a “Recent Transactions” panel.
Values are fetched from the local Node API (or placeholders if nothing is stored yet).

/track — Track Spend

A form for adding transactions:

Date

Description

Amount

Type (expense/income)

Category

Also includes a “Recent Transactions” list.

/networth — Net Worth

A form for adding assets:

Asset name

Price

Account

Displays:

Total assets

A list of assets

A chart showing contribution by asset (canvas)

/about — About

Explains what the app is and what would be needed to make it production-ready:

persistent storage (SQLite/Postgres)

authentication

server-side validation
