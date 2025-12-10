# QuizardLabs Web

Digital test platform enabling teachers to create tests with audio dictation and students to take tests with audio accommodations.

## Project Status

Track progress using [backlog.md](https://github.com/MrLesk/Backlog.md):

```bash
# View Kanban board in terminal
backlog board

# Launch web UI at http://localhost:6420
backlog browser

# List all tasks
backlog task list

# View specific task details
backlog task 2
```

**Current Features:**

- ✅ Feature 1: Foundation & Setup (task-7) - Complete
- ✅ Feature 2: User Role Management (task-1) - Complete
- 🔲 Feature 3: Test Creation & Listing (task-2) - Next
- 🔲 Features 4-7: Pending

## Running the project

Install the following:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

Start the local database:

```bash
docker compose up -d
```

Install the application dependencies:

```bash
pnpm install
```

Setup the database schema:

```bash
pnpm db:migrate
```

Run the development server:

```bash
pnpm dev
```

You can now access the application at [http://localhost:3000](http://localhost:3000).

You can also inspect the local database by running the following command in separate terminal:

```bash
pnpm db:studio
```
