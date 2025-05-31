# NLP Task Manager - User Guide

This guide provides detailed instructions on how to use the NLP Task Manager application effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Account Management](#account-management)
3. [Project Management](#project-management)
4. [Working with Tasks](#working-with-tasks)
5. [Natural Language Processing](#natural-language-processing)
6. [Collaboration](#collaboration)
7. [Search and Filters](#search-and-filters)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the Application

1. Open your web browser and navigate to the application URL
2. You'll be presented with the landing page showcasing the application's features
3. Click on "Login" if you already have an account, or "Get Started" to create a new account

### Creating an Account

1. Click on "Get Started" or "Register" button
2. Fill in the registration form:
   - Name
   - Email address
   - Password (minimum 8 characters)
3. Click "Register" to create your account
4. You'll be redirected to the login page

### Logging In

1. Enter your email and password
2. Click "Login"
3. Upon successful login, you'll be directed to your dashboard

## Account Management

### User Profile

Currently, the application offers limited profile management functionality. Your name and email are displayed in the top-right dropdown menu.

### Logging Out

1. Click on your name in the top-right corner
2. Select "Logout" from the dropdown menu

## Project Management

### Creating a Project

1. From your dashboard, click the "+ New Project" button
2. Enter a project name (required)
3. Add an optional description
4. Click "Create Project"

### Viewing Projects

1. Your dashboard displays all your projects as cards
2. Each card shows:
   - Project name
   - Brief description (if provided)
   - Created date
   - Number of tasks

### Updating a Project

1. Navigate to the project you want to edit
2. Click on the "..." (options) button on the project card
3. Select "Edit" from the dropdown
4. Update the project name or description
5. Click "Save Changes"

### Deleting a Project

1. Navigate to the project you want to delete
2. Click on the "..." (options) button on the project card
3. Select "Delete" from the dropdown
4. Confirm deletion when prompted

## Working with Tasks

### Viewing Tasks

1. Click on a project card to open the project view
2. Tasks are displayed in a list format with columns for:
   - Task name
   - Assignee
   - Due date
   - Priority
   - Status (complete/incomplete)

### Adding Tasks Manually

1. In the project view, locate the task input field at the top
2. Type your task using natural language (see [Natural Language Processing](#natural-language-processing))
3. Press Enter or click "Add Task"

### Editing Tasks

1. Click on any field of an existing task to edit it:
   - Click on the task name to edit the description
   - Click on the assignee to change the assigned person
   - Click on the due date to modify it
   - Click on the priority to change it
2. Make your changes and press Enter or click outside the field to save

### Marking Tasks as Complete

1. Click the checkbox next to a task to mark it as complete
2. Completed tasks are visually distinguished (strikethrough text)

### Deleting Tasks

1. Hover over the task you want to delete
2. Click the trash icon that appears
3. Confirm deletion when prompted

## Natural Language Processing

The NLP Task Manager allows you to create tasks using natural language input. The system will automatically parse your input to extract task details.

### Task Input Format

When adding a task, you can use natural language to specify:

1. **Task Name**: The main description of what needs to be done
2. **Assignee**: The person responsible (must be a registered user)
3. **Due Date/Time**: When the task should be completed
4. **Priority**: How important the task is (P1-P4)

### Examples of Natural Language Inputs

```
Create wireframes for the landing page by tomorrow at 2pm P1
```
Parsed as:
- Task: Create wireframes for the landing page
- Due: Tomorrow at 2:00 PM
- Priority: P1 (highest)
- Assignee: Current user (if no assignee specified)

```
Review client proposal with Aman on Friday at 10am
```
Parsed as:
- Task: Review client proposal
- Assignee: Aman
- Due: Friday at 10:00 AM
- Priority: P3 (default)

```
Submit tax documents by end of month P2
```
Parsed as:
- Task: Submit tax documents
- Due: Last day of current month
- Priority: P2
- Assignee: Current user (if no assignee specified)

### Priority Levels

- **P1**: Highest priority, urgent tasks
- **P2**: High priority
- **P3**: Normal priority (default)
- **P4**: Low priority

## Collaboration

### Sharing Projects

1. Navigate to the project you want to share
2. Click on the "Share" button
3. Enter the email address of the registered user you want to share with
4. Click "Share Project"

### Collaborator Access

Collaborators have read-only access to projects shared with them. They can:
- View all tasks in the project
- See task details
- Filter and search tasks

Collaborators cannot:
- Add new tasks
- Edit existing tasks
- Delete tasks
- Share the project with others

## Search and Filters

### Searching Tasks

1. In the project view, use the search bar at the top
2. Type keywords related to task name or assignee
3. Results will update as you type

### Filtering Tasks

Use the filter options to narrow down tasks:

1. **Assignee Filter**: Click the assignee dropdown to filter by specific team members
2. **Priority Filter**: Select from P1-P4 to see tasks of specific priority
3. **Due Date Filter**: Use date filters (Today, This Week, This Month, etc.)
4. **Status Filter**: Toggle between All, Complete, or Incomplete tasks

### Clearing Filters

Click "Clear Filters" to reset all applied filters and see all tasks again.

## Troubleshooting

### Common Issues

#### Login Problems
- Ensure you're using the correct email and password
- Check your internet connection
- Clear browser cache and cookies

#### Task Creation Issues
- Ensure your natural language input is clear
- If a specific field isn't being parsed correctly, try to be more explicit
- Check that assignees are registered users in the system

#### Performance Issues
- Refresh the page if the application becomes unresponsive
- Ensure you're using a supported browser (Chrome, Firefox, Safari, Edge)

### Getting Help

For additional assistance:
- Check the documentation
- Contact the system administrator
- Report bugs through the appropriate channels

---

We hope this guide helps you make the most of the NLP Task Manager. Happy organizing! 