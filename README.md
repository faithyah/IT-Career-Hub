# IT Career Hub (PHP + MySQL)

## Setup (XAMPP or WAMP)
1. Copy this folder to `htdocs/it-career-hub` (XAMPP) or `www/it-career-hub` (WAMP).
2. Start **Apache** and **MySQL** in the control panel.
3. Open http://localhost/phpmyadmin, go to **Import**, choose `database.sql`, click **Go**.
4. If your MySQL user or password is not `root` / empty, edit `config.php`.
5. Open http://localhost/it-career-hub/ and create an account.

## Files
- `login.php`, `logout.php`: authentication
- `api.php`: JSON backend for profile data
- `config.php`: database connection and sessions
- `database.sql`: schema for phpMyAdmin
- `index.php`: app shell (requires login)
- `assets/css/style.css`: design
- `assets/js/catalog.js`, `app.js`: catalog data and UI logic
