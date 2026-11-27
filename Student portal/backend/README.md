# CampusIQ – Java JDBC Backend (based on your OOPS PBL PDF)

This backend follows the attached GM University OOPS PBL brief: Java implementation, JDBC + CRUD, student/faculty/course/resource/activity management, resource booking, exception handling, collections, Streams/lambdas, generics, interfaces, inheritance and polymorphism. The supplied Student Portal frontend is included unchanged in `frontend/`.

## Requirements
- JDK 17 or newer
- Apache Maven 3.8+
- Internet once, to download Maven dependencies

## Run in VS Code / Windows
1. Extract this ZIP.
2. Open the extracted `CampusIQ_Java_Backend` folder in VS Code.
3. Open Terminal in that folder and run:
   ```powershell
   mvn clean package
   java -jar target/campusiq-backend-1.0.0-jar-with-dependencies.jar
   ```
4. Open `http://localhost:8080/login.html`.

The SQLite database `campusiq.db` is created automatically in the project folder.

## Demo student login
- Email: `student@gmu.edu`
- Password: `Student@123`

Change demo credentials before using outside a classroom demo. The server stores password hashes using PBKDF2. This is a project demonstration backend, not a production college identity/payment service.

## API routes
All routes except `/api/health` and `/api/login` require the session cookie created at login.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/login` | Form URL encoded email/password; compatible with current login form |
| POST | `/api/logout` | Sign out |
| GET | `/api/me` | Current student profile |
| PATCH | `/api/profile` | Update name, phone, department, semester |
| GET | `/api/dashboard` | Student and module counts |
| GET/POST | `/api/{module}` | List/create records |
| GET/PUT/PATCH/DELETE | `/api/{module}/{id}` | Read/update/delete record |
| POST | `/api/bookings` | Create synchronized resource booking |

Supported `{module}` names: `assignments`, `attendance`, `calendar`, `events`, `grievances`, `library`, `payments`, `quizzes`, `quiz_attempts`, `results`, `timetable`, `notifications`, `students`, `faculty`, `courses`, `resources`, `activities`, `bookings`.

## Example API call from your frontend JavaScript
```js
const response = await fetch('/api/grievances', {
  method: 'POST',
  credentials: 'include',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({subject: 'Timetable issue', category: 'Academic', priority: 'Normal', description: 'Please review.'})
});
const result = await response.json();
```

## Important frontend integration note
Your existing `app.js` already posts the login form to `/api/login`. However, the grievance, assignment submission and quiz attempt handlers currently write to `localStorage` and explicitly display demo-only messages. Those handlers still need to be switched to the API examples above for the data to persist in SQLite. The backend does not silently modify your completed frontend design.

## How the PBL concepts are represented
- **Classes/objects:** `Entity`, `CampusRecord`, `BookingService`.
- **Inheritance/polymorphism:** `CampusRecord extends Entity`; overridden `displayLabel()`.
- **Interface:** `BookingService.AvailabilityPolicy` and generic `Repository<T, ID>` contract.
- **Generics:** `Repository<T, ID>`.
- **Collections / Streams / lambda:** concurrent session map, sets, lists, stream sorting in record retrieval.
- **Synchronization / multithreading:** HTTP server thread pool; synchronized booking service prevents duplicate slot booking.
- **Exception handling:** validation and HTTP error responses.
- **File handling:** static frontend assets are served from the `frontend` directory; SQLite DB file persists data.
- **JDBC / CRUD:** SQLite access uses JDBC prepared statements.

This implementation focuses on the Java backend required by the PDF and keeps the provided frontend files unchanged. It provides generic CRUD APIs for the modules; the existing portal screens still need the noted API wiring to use them.
