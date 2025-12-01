# CampusChat

CampusChat is just a lightweight chat app built for a university Web Applications project. It includes private groups, rooms, direct messages, friendships, notifications, and simple user profiles.
The backend runs on Cloudflare Workers with a D1 database, and the frontend is built with React and Vite. The project follows a clean structure using services, repositories, Drizzle ORM, Redwood SDK, and JWT authentication. Messages happen in realtime!

## Requirements

-   Has been tested on Node.js 22.x (Other versions should also work, for example 20)
-   pnpm recommended! Install with:

```
npm install -g pnpm
```

## Environment

-   Create a .env file in the project root (.env content is provided within the zip delivered)

## Installation

```
pnpm install
```

## Database

Migrate

```
pnpm run migrate:dev
```

Seed demo data

```
pnpm run seed
```

**Note:** If you're not running on 5173 you have to change package.json script to the port you're on!
**Note:** You have to have a **RUNNING\*** instance (app) in order to seed, because we're using URLs.

## Start the app

```
pnpm run dev
```

Open the URL shown in the terminal (usually localhost:5173
).

## Made with ❤️ by Blazej, Stefan & Karolina.
