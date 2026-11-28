# CampusIQ Faculty Portal Backend

Java 17+ (works with Java 27), built-in `HttpServer`, SQLite JDBC. No Maven required.

## 1. Add SQLite JDBC driver
Copy your existing `sqlite-jdbc-3.54.1.0.jar` into this folder:
`lib\sqlite-jdbc-3.54.1.0.jar`

The ZIP intentionally does not redistribute the JDBC driver.

## 2. Run
Open PowerShell in this backend folder and run:
```powershell
.\run.bat
```
The server starts at `http://localhost:8081`. The database is created automatically at:
`database\faculty_portal.db`

## Demo account
- Email: `faculty@campusiq.edu`
- Password: `Faculty@123`

## API
- `GET /health` (public)
- `POST /api/login` JSON `{ "email":"faculty@campusiq.edu", "password":"Faculty@123" }`
- `POST /api/logout`
- `GET, PUT, PATCH /api/profile`
- `GET /api/dashboard`
- `GET /api/reports/attendance`
- CRUD collections: `/api/courses`, `/api/attendance`, `/api/assignments`, `/api/grades`, `/api/timetable`, `/api/events`, `/api/announcements`, `/api/leaves`
- For update/delete use `/api/{collection}/{id}`.

All `/api/*` endpoints except login require `Authorization: Bearer YOUR_TOKEN`.

## Important frontend note
The supplied frontend `script.js` currently contains no `fetch()` or API calls. This backend is ready and provides the database/API, but the existing pages remain static until the frontend is connected. No frontend files were changed in this package.
