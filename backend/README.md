# NLP Task Manager - Backend

The backend for the NLP Task Manager application, built with Node.js, Express, and Sequelize.

## Features

- RESTful API design
- JWT-based authentication
- OpenAI GPT-4-turbo integration for natural language parsing
- Sequelize ORM with support for SQLite (development) and PostgreSQL (production)
- Comprehensive error handling and validation

## Directory Structure

```
backend/
├── controllers/        # Route controllers
│   ├── authController.js
│   ├── projectController.js
│   └── taskController.js
│
├── middlewares/        # Custom middleware
│   ├── authMiddleware.js
│   └── errorHandler.js
│
├── models/             # Sequelize models
│   ├── index.js
│   ├── user.js
│   ├── project.js
│   └── task.js
│
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── taskRoutes.js
│
├── services/           # Business logic
│   └── nlpService.js
│
├── utils/              # Utility functions
│   └── parseDate.js
│
├── .env                # Environment variables
├── .env.example        # Example environment file
├── server.js           # Application entry point
└── package.json        # Dependencies and scripts
```

## API Endpoints

### Authentication

| Method | Endpoint       | Description           | Request Body                          | Response                        |
|--------|----------------|-----------------------|--------------------------------------|--------------------------------|
| POST   | /api/register  | Register a new user   | `{name, email, password}`            | `{user, token}`                |
| POST   | /api/login     | Login                 | `{email, password}`                  | `{user, token}`                |

### Projects

| Method | Endpoint               | Description               | Request Body              | Response                        |
|--------|------------------------|---------------------------|--------------------------|--------------------------------|
| POST   | /api/projects          | Create a new project      | `{name, description}`    | `{id, name, description, ...}` |
| GET    | /api/projects          | Get all user projects     | -                        | `[{project}, ...]`             |
| GET    | /api/projects/:id      | Get project by ID         | -                        | `{project}`                    |
| PUT    | /api/projects/:id      | Update a project          | `{name, description}`    | `{project}`                    |
| DELETE | /api/projects/:id      | Delete a project          | -                        | `{message}`                    |
| POST   | /api/projects/share    | Share project with user   | `{projectId, email}`     | `{message}`                    |

### Tasks

| Method | Endpoint                          | Description                | Request Body                         | Response                        |
|--------|-----------------------------------|----------------------------|-------------------------------------|--------------------------------|
| POST   | /api/tasks                        | Create task with NLP       | `{rawText, projectId}`              | `{task}`                        |
| GET    | /api/tasks?projectId=PROJECT_ID   | Get all tasks for a project| -                                   | `[{task}, ...]`                 |
| PUT    | /api/tasks/:id                    | Update a task              | `{taskName, dueDate, priority, ...}`| `{task}`                        |
| DELETE | /api/tasks/:id                    | Delete a task              | -                                   | `{message}`                     |
| PATCH  | /api/tasks/:id/complete           | Toggle task completion     | `{isComplete}`                      | `{task}`                        |

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgres://user:pass@host:port/dbname
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
TIMEZONE=Asia/Kolkata
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Install dependencies
   ```bash
   npm install
   ```

2. Set up environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. Run database migrations
   ```bash
   npx sequelize-cli db:migrate
   ```

### Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## NLP Task Parsing

The NLP service uses OpenAI's GPT-4-turbo to extract structured information from natural language task inputs.

Example input:
```
Finish landing page Aman by 11pm 20th June P2
```

Parsed output:
```json
{
  "taskName": "Finish landing page",
  "assignedTo": "Aman",
  "dueDate": "2023-06-20T23:00:00.000Z",
  "priority": "P2"
}
```

## Error Handling

Errors are handled through a global error handler middleware that formats errors consistently:

```json
{
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "status": 400
  }
}
```

## Testing

```bash
npm test
```

## License

MIT 