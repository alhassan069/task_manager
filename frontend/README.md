# NLP Task Manager - Frontend

The frontend for the NLP Task Manager application, built with React, Tailwind CSS, and ShadCN UI.

## Features

- Modern, glassmorphism UI design
- Intuitive natural language task input
- Project management with sharing capabilities
- Task list with search and filtering
- Responsive design for desktop viewing
- JWT authentication and protected routes

## Directory Structure

```
frontend/
├── public/             # Static files
│   └── ...
│
├── src/
│   ├── assets/         # Images, icons, etc.
│   │
│   ├── components/     # Reusable UI components
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── tasks/
│   │   └── ui/
│   │
│   ├── context/        # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ...
│   │
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.js
│   │   └── ...
│   │
│   ├── pages/          # Page components
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   ├── Project/
│   │   └── ...
│   │
│   ├── services/       # API service functions
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── ...
│   │
│   ├── styles/         # Global styles and Tailwind config
│   │
│   ├── utils/          # Utility functions
│   │
│   ├── App.jsx         # Main application component
│   ├── index.jsx       # Application entry point
│   └── ...
│
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── tailwind.config.js  # Tailwind CSS configuration
```

## Component Guide

### Key Components

- **AuthForm**: Handles login and registration
- **ProjectCard**: Displays project information with options
- **TaskInput**: Natural language task input with parsing
- **TaskItem**: Individual task display with inline editing
- **FilterBar**: Filters for searching and filtering tasks
- **GlassCard**: Styled card component with glassmorphism effect

## Styling

The application uses a customized design system with:

- Glassmorphism UI elements
- Professional color palette:
  - Primary Blue: `#0073b1`
  - Dark Blue: `#004471`
  - Glass White: `rgba(255,255,255,0.15)`
  - Mist Gray: `#e6e9ec`
  - Deep Charcoal: `#1e1e1e`
  - Accent Teal: `#00b5ad`
- Custom components built with ShadCN UI
- Inter font for typography

## State Management

- React Context API for global state
- Local component state for UI interactions
- API service layer for backend communication

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

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

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173/

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Using NLP Task Input

The application allows natural language task creation:

1. Type a task in natural language in the task input field:
   ```
   Call John about project proposal tomorrow at 3pm P1
   ```

2. The system parses this into structured fields:
   - Task name: "Call John about project proposal"
   - Due date: Tomorrow at 3:00 PM
   - Priority: P1 (High)

3. The parsed task is displayed in the task list

## User Guide

See the [User Guide](../docs/user-guide.md) for detailed usage instructions.

## Troubleshooting

**Authentication Issues**
- Ensure the backend server is running
- Check that the API URL is correctly set in environment variables
- Verify browser localStorage is enabled

**Task Parsing Issues**
- Ensure the OpenAI API key is valid
- Format tasks with clear indications of date/time and priority
- Check network requests for error responses

## License

MIT
