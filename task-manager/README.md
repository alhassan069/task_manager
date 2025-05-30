# Task Manager App

A natural language task management application built with Next.js, Prisma, and OpenAI.

## Features

- Natural language task input ("Call John tomorrow at 5pm")
- Project management
- Task assignment and tracking
- Due date parsing
- Priority management

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS with glassmorphism
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js
- **Natural Language Processing**: OpenAI GPT-4

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (or use SQLite for development)
- OpenAI API key

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd task-manager
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   # Copy the example env file
   cp env.example .env
   
   # Then edit .env with your values
   ```

4. Set up the database
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Create database tables
   npx prisma migrate dev --name init
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Visit http://localhost:3000 to see the application

## Development

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Database Management

```bash
# Open Prisma Studio (database GUI)
npx prisma studio
```

## Deployment

```bash
# Build the app
npm run build

# Start the app
npm start
```

## Project Structure

```
/
├── app/              # Next.js App Router
├── components/       # React Components
├── lib/              # Utility functions
├── prisma/           # Database schema
├── public/           # Static assets
├── styles/           # Global styles
└── __tests__/        # Test files
```

## License

MIT
