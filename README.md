# QuizardLabs Web

Next.js project for the QuizardLabs web app.

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
