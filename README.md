# CampusConnect

CampusConnect is a web-based Student Event and Study Group Finder created for the CSC 5750 term project. Students can register, maintain an academic profile, discover or create study groups, join groups, browse events, and manage RSVPs. Administrators can review participation and manage accounts and content.

## Technology

- React and Vite frontend
- Node.js and Express REST API
- SQLite relational database powered by SQL.js
- JWT authentication and bcrypt password hashing
- Netlify-ready frontend configuration

## Project structure and ownership

| Area | Primary owner | Main folders |
| --- | --- | --- |
| Frontend and user interface | Ahsas Zaidi | `client/src/components`, `client/src/pages`, `client/src/styles` |
| Backend and authentication | Nihal Ahmed | `server/src/auth`, `server/src/middleware`, `server/src/profile` |
| Database and study groups | Shazib Bosu | `server/src/database`, `server/src/groups` |
| Events and administration | Ihtesham Elahi | `server/src/events`, `server/src/admin` |
| Deployment and testing | Tajwar Khan | `server/test`, environment files, Netlify configuration, testing and deployment documentation |

See [CONTRIBUTIONS.md](CONTRIBUTIONS.md) for the detailed responsibility map.

## Windows requirements

1. Node.js 20 or newer
2. Visual Studio Code
3. A modern browser such as Chrome or Edge
4. Git is optional for local development but recommended for team collaboration

## Run the project on Windows

Open the `campusconnect` folder in VS Code. Then open **Terminal > New Terminal** and run:

```powershell
npm install
```

Create the server environment file:

```powershell
Copy-Item server\.env.example server\.env
```

Create the client environment file:

```powershell
Copy-Item client\.env.example client\.env
```

Start the frontend and backend together:

```powershell
npm run dev
```

Open:

- Frontend: `http://localhost:5173`
- API health check: `http://localhost:4000/api/health`

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Student | `student@campusconnect.edu` | `Student123!` |
| Administrator | `admin@campusconnect.edu` | `Admin123!` |

Change all demonstration passwords before a real public launch.

## Available features

- Registration, login, logout, and protected pages
- Editable student profile
- Study-group creation, editing, deletion, searching, joining, and leaving
- Group capacity and ownership rules
- Event creation, editing, deletion, RSVP, and RSVP cancellation
- Administrator statistics and account management
- Responsive desktop and mobile interface
- Persistent local relational data
- Sample accounts, groups, and events
- Automated API tests

## Automated testing

Run:

```powershell
npm test
```

The automated tests verify the API health check, authentication, group listing and creation, event creation, and RSVP workflow. Complete the additional scenarios in [MANUAL_TEST_PLAN.md](MANUAL_TEST_PLAN.md).

## Production build

Run:

```powershell
npm run build
```

The compiled frontend is written to `client/dist`.

## Database

The server automatically creates `server/data/campusconnect.sqlite` on its first run and inserts demonstration data. To reset local data, stop the server and delete that file. The next server start recreates the database.

The relational schema contains:

- `users`
- `study_groups`
- `group_members`
- `events`
- `event_rsvps`

See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

## Deployment status

The repository includes a Netlify configuration for the React frontend. The Express API must be deployed to a Node-compatible host with persistent file storage, and the deployed frontend must set `VITE_API_URL` to that API URL. The API host must set `CLIENT_URL` to the deployed Netlify URL.

Deployment should be completed only after the team confirms which backend hosting account it will use. Record every deployment step and environment variable in the final reproduction guide.

## Important security notes

- Set a strong, private `JWT_SECRET` in production.
- Never commit `.env` files.
- Use HTTPS for deployed services.
- Replace the demo passwords before public use.
- The current SQLite configuration is appropriate for the course demonstration and local development. A larger production deployment should use a managed database such as PostgreSQL.
