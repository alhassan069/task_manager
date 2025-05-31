# NLP Task Manager

![NLP Task Manager](https://via.placeholder.com/800x400?text=NLP+Task+Manager)

A modern task management application that uses natural language processing to parse task details from plain text input.

## Features

- 🧠 **Natural Language Processing**: Add tasks using natural language (e.g., "Finish landing page by tomorrow at 5pm P1")
- 📂 **Project Management**: Organize tasks into different projects
- 👥 **Collaboration**: Share projects with team members
- 🔍 **Search & Filter**: Find tasks quickly with powerful search and filtering options
- ✅ **Task Tracking**: Mark tasks as complete, edit details, and track progress

## Tech Stack

### Frontend
- React
- Tailwind CSS
- ShadCN UI
- React Router
- Context API for state management

### Backend
- Node.js with Express
- JWT Authentication
- Sequelize ORM
- OpenAI GPT-4-turbo for NLP
- SQLite (development) / PostgreSQL (production)

## Project Structure

```
.
├── backend/           # Express server, API routes, database models
├── frontend/          # React application, UI components
├── README.md          # This file
└── todo.md            # Development tasks list
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL (for production)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/alhassan069/task_manager.git
   cd nlp-task-manager
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   cp .env.example .env   # Update with your environment variables
   ```

3. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

1. Set up your environment variables in `/backend/.env`:
   - `DATABASE_URL` - Database connection string
   - `JWT_SECRET` - Secret key for JWT
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `NODE_ENV` - 'development' or 'production'

### Running the Application

1. Start the backend server
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:`

## Documentation

- [Backend API Documentation](/backend/README.md)
- [Frontend Documentation](/frontend/README.md)
- [User Guide](docs/user-guide.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-4-turbo API
- All the contributors to this project 