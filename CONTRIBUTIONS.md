# CampusConnect Responsibility Map

The application is a single integrated deliverable. The ownership below identifies the primary contributor responsible for understanding, testing, improving, and presenting each component.

## Ahsas Zaidi - Frontend and user interface

- `client/src/components/`
- `client/src/pages/`
- `client/src/styles/main.css`
- Responsive navigation, forms, dashboards, cards, and accessibility
- Frontend integration with the API

## Nihal Ahmed - Backend and authentication

- `server/src/auth/`
- `server/src/middleware/`
- `server/src/profile/`
- Registration, login, JWT authentication, password hashing, protected routes, and profile API

## Shazib Bosu - Database and study-group system

- `server/src/database/`
- `server/src/groups/`
- Relational schema, persistent SQLite database, sample records, group search, membership, capacity, and ownership rules

## Ihtesham Elahi - Events and administration

- `server/src/events/`
- `server/src/admin/`
- Event management, RSVP workflows, administrator dashboard, statistics, account roles, and moderation

## Tajwar Khan - Cloud deployment and testing

- `server/test/`
- `client/netlify.toml`
- `.env.example`
- Deployment configuration, automated API testing, manual test checklist, README, and reproduction guide

## Shared integration work

All team members participate in end-to-end testing, debugging, documentation review, presentation preparation, and final project evaluation.
