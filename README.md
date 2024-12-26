# Vertex Backend

this is the backend for the project

## Getting Started

### Prerequisites

- Node.js 18.18.0
- pnpm

### Installation

1.install dependencies

```bash
pnpm install
```

2.create a .env file

```bash
cp .env.example .env
```

3.prepare the database

```bash
pnpm db:push && pnpm db:generate && pnpm db:migrate
```

4.run the server

```bash
pnpm dev
```

5.open the browser and go to http://localhost:3000
