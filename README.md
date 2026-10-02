# BookABite

Restaurant table-booking platform for Pune. Customers discover restaurants and book tables, owners manage restaurants / menus / bookings (after admin approval), and admins approve owners.

**Stack:** Flask + SQLAlchemy + SQL Server (backend) · React 19 + Vite (frontend)

## Roles

| Role | Can do |
|------|--------|
| Customer | Browse, favorite, book / cancel tables, review |
| Owner | Manage own restaurants, menu, bookings. New owners wait for admin approval |
| Admin | Approve / reject owners, manage anything |

## Prerequisites

- Python 3.10+ and Node 18+
- SQL Server (Express is fine) + [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server)

## 1. Backend

```bash
cd bookabite-backend
python -m venv venv
venv\Scripts\activate            # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env           # macOS/Linux: cp .env.example .env
```

Edit `.env` and fill in `DB_SERVER` and generate real secrets:

```bash
python -c "import secrets; print(secrets.token_hex(32))"   # run twice: SECRET_KEY, JWT_SECRET_KEY
```

Create the database, in this order:

```bash
# 1. Run database/schema.sql in SSMS / sqlcmd (creates BookABiteDB and tables)
python database/migrate_and_seed_menu.py     # menu items, owner column, demo owner
python database/migrate_owner_approval.py    # owner-approval column
python database/seed_data.py                 # sample restaurants
python database/seed_more_data.py            # more restaurants only (reviews are never auto-generated)
python database/seed_more_data_2.py          # more restaurants + coupons
python database/create_admin.py admin@bookabite.com "ChooseAStrongPassword" "Admin"
```

Run it: `python app.py` → http://127.0.0.1:5000 (health check: `/api/health`)

## 2. Frontend

```bash
cd bookabite-frontend
npm install
copy .env.example .env
npm run dev                      # http://localhost:5173
```

Make sure `CORS_ORIGINS` in the backend `.env` includes the frontend URL.

## 3. Tests

Booking tests run on an in-memory SQLite database, so they need no SQL Server and never touch real data:

```bash
cd bookabite-backend
pip install pytest
python -m pytest tests -q
```

They cover login, validation, capacity per time slot, cancel/re-open, and who may view or change which booking.

## Demo accounts

The menu seeder creates or resets `owner@bookabite.com` and `diner@bookabite.com` to the demo password in `database/migrate_and_seed_menu.py`. Rerun that seeder if either demo account can no longer sign in. **These are demo credentials; change or delete them before any real deployment.**

## Security notes

- `.env` files are git-ignored; commit only `.env.example`.
- The logged-in user always comes from the JWT, never from request fields.
- Flask debug mode is **off** unless `FLASK_DEBUG=1` is set.
- Use Razorpay **test** keys only.

## Known limitations

- Two people booking the last seats at the same instant could both succeed (no row locking yet).
- The `backend/` folder (Node/Express) is an unused early stub; the real API is `bookabite-backend/`.
