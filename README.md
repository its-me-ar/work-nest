# WorkNest

WorkNest is an Angular application focused on workplace task and leave management with authentication, toasts, and server entry code (SSR-ready files present).

## 🚀 Features

### Core
- Email/password authentication (login via `AuthService`, persisted user via `UserService`)
- User-specific task management: add, update, delete, toggle complete, filter (all/completed/pending)
- Leave management (admin view): load leaves, approve, reject with reason (modal)
- Toast notifications for user feedback
- Server-side entrypoints present (`src/server.ts`, `src/main.server.ts`) — SSR-ready

### Technical
- Uses Angular standalone components and Angular signals for state
- REST API-driven: expects `/users`, `/tasks`, `/leaves` endpoints

## 🛠️ Tech Stack
- Frontend: Angular (standalone components)
- State: Angular signals (computed + signal)
- HTTP: Angular HttpClient
- Testing: Jasmine/Karma-style unit specs present
- SSR: Node/Express server entrypoint (`src/server.ts`)

## 📁 Project structure (high level)

```
src/
├── app/
│   ├── components/         # Header, Sidebar, Toast, Leaves modal
│   ├── core/
│   │   ├── services/       # AuthService, UserService, TaskService, LeaveManagementService, ToastService, StorageService, UiStateService
│   │   └── models/         # user.model.ts, task.model.ts, leave.model.ts
│   └── pages/              # login, dashboard (leave-management, tasks, etc.)
├── environments/           # environment.ts, environment.prod.ts
├── main.ts                  # client bootstrap
├── main.server.ts           # server bootstrap (SSR)
└── server.ts                # Express server for SSR
```

## 🔗 API (expected)

Base URL: `environment.apiUrl` (dev: `http://localhost:3000`, prod: `https://json-server-h1vo.onrender.com`)

Common endpoints used by the code:
- `GET /users` (login lookup by email+password)
- `GET /tasks?userId=<id>` (load tasks for user)
- `POST /tasks` (create task)
- `PUT /tasks/:id` (update task)
- `DELETE /tasks/:id` (delete task)
- `GET /leaves` (load leaves)
- `PATCH /leaves/:id` (approve/reject leave)

## ✅ Scripts (run with npm)

- `npm start` / `ng serve` — dev server
- `npm run build` — build production bundle
- `npm test` — run unit tests
- `npm run e2e` — run e2e tests (if configured)

Check `package.json` for exact script names.

## 📱 Pages (what's in the app)

- `/login` — login page (reactive form, validation, server auth)
- `/` — dashboard layout (header + sidebar)
	- `/dashboard/tasks` — tasks CRUD & filtering
	- `/dashboard/leave-management` — admin leaves list, approve/reject

## 🧪 Tests

Unit tests exist for key pages/components (`*.spec.ts`). They use TestBed with mocks for services.

## ⚠️ Notes

- The app reads and writes user/token via `StorageService` cookies used by `UserService`.
- Environment `apiUrl` controls backend endpoints; adjust `src/environment/environment.ts` for local API.

## 📞 Want format changes?

If you want a full README in the exact layout you pasted (sections like Tech Stack, Project Structure, Getting Started, Env vars table, API endpoints table), tell me and I'll update `README.md` accordingly.
