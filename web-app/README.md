# TRAITS-PMS

Property Management System built with PHP (backend) and React (frontend).

## Setup Instructions

### Backend
1. Place the `backend/` folder in your web server (e.g., XAMPP `htdocs`).
2. Update `backend/config/db.php` with your MySQL credentials.
3. Import `database.sql` into MySQL to create the database and tables.
4. Ensure PHP 7+ with PDO is installed.
5. Start your web server (e.g., Apache).

### Frontend
1. Navigate to `web-app/`.
2. Run `npm install` to install dependencies.
3. Update `src/services/api.js` baseURL to match your backend (e.g., `http://localhost/TRAITS-PMS/backend/api/`).
4. Add a `logo.png` to `public/` or adjust the path in code.
5. Run `npm start` to start the React app (defaults to `localhost:3000`).

### Usage
- Login with `admin`/`password` (replace with real auth logic in `auth.php`).
- Navigate through Dashboard, Lease, Property, Tenant, Rent, Cheque, and Reports modules.

## Notes
- Replace dummy auth in `auth.php` with a proper user table.
- Secure `jwt.php` secret key.
- Test responsiveness and adjust Tailwind as needed.
