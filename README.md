# Online Casino Project

A modern online casino built with Next.js, Prisma, and Tailwind CSS.

## Features

- **User System**: Login, Register, Dashboard, Balance Management.
- **Games**:
  - Blackjack
  - European Roulette
  - Book of Ra (Slot)
  - Starburst (Slot)
  - Lucky Lady's Charm (Slot)
- **Admin Panel**: User management, statistics.
- **Security**: Secure password hashing, session management.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn/UI.
- **Backend**: Next.js API Routes.
- **Database**: SQLite (Development), Prisma ORM.
- **Auth**: NextAuth.js.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Initialize the database:
    ```bash
    npx prisma migrate dev --name init
    ```
4.  Generate Prisma Client:
    ```bash
    npx prisma generate
    ```
5.  Run the development server:
    ```bash
    npm run dev
    ```
6.  Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts

- **User**: Register a new account.
- **Admin**: (Manually update role in database to 'ADMIN')

## Database Schema

See `prisma/schema.prisma` for the full schema definition.
