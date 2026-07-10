# Eat the Frog 🐸

A personal frog-eating coach. Log the tasks you've been dreading, pick today's frog, eat it first, and build momentum.

Based on the "eat the frog" productivity method: if the first thing you do each morning is eat a live frog, you can go through the rest of the day knowing the worst is behind you.

## Features

- 🐸 **Track your frogs** — log tasks with a title and optional notes
- 🤖 **AI-estimated frog size** — Claude picks a size (1-5) based on the task, with an encouraging note. Override anytime.
- 🪣 **Buckets** — organize frogs by project or area (Email, Home Errands, Financial Homework, etc.)
- 🎯 **Today's Frog** — one prominent task to focus on each day
- ✅ **Eaten log** — keep a record of frogs you've crushed
- 📱 **Works on your phone** — responsive web app, bookmark it on your home screen
- 🔒 **Personal use** — simple password login, just for you

## Tech Stack

- Next.js 14 (App Router) — full-stack React framework
- Prisma + PostgreSQL — database
- NextAuth.js — authentication
- Claude API (Haiku 4.5) — smart frog sizing
- Vercel — free hosting

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Generate a NextAuth secret:

```bash
openssl rand -base64 32
```

Generate a bcrypt hash for your password:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password-here', 10))"
```

> **Note:** when pasting the hash into `.env.local`, escape every `$` as `\$`
> (e.g. `ADMIN_PASSWORD_HASH=\$2b\$10\$abc...`). Next.js expands `$VAR`
> references in env files, which silently corrupts an unescaped bcrypt hash
> and makes login fail. Env vars set in the Vercel dashboard don't need this.

Get an Anthropic API key at https://console.anthropic.com/

For the database, set up a local PostgreSQL or use a hosted option (Neon, Supabase, Vercel Postgres).

### 3. Push the schema to your database

```bash
npx prisma db push
```

### 4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to the login page.

## Deploying to Vercel

1. Push this repo to GitHub
2. Go to vercel.com and import the repo
3. On the Vercel dashboard, go to **Storage → Create Database → Postgres** (free tier)
4. In project settings, add environment variables:
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your Vercel URL, e.g. `https://your-app.vercel.app`)
   - `ADMIN_USERNAME` (your chosen username)
   - `ADMIN_PASSWORD_HASH` (bcrypt hash of your password)
   - `ANTHROPIC_API_KEY`
   - `DATABASE_URL` (Vercel Postgres sets this automatically when you connect the database)
5. Deploy
6. After first deploy, run `npx prisma db push` against the production database to create the tables

## Project Structure

```
frogs/
├── prisma/schema.prisma      # Database models: Bucket and Frog
└── src/
    ├── middleware.js          # Route protection (must live in src/)
    ├── app/
    │   ├── page.js            # Main dashboard
    │   ├── login/             # Login page
    │   ├── api/
    │   │   ├── auth/          # NextAuth handler
    │   │   ├── frogs/         # Frog CRUD + AI estimate
    │   │   └── buckets/       # Bucket CRUD
    │   └── globals.css
    ├── components/            # React components
    └── lib/
        ├── prisma.js          # DB client
        ├── auth.js            # Auth config
        └── ai.js              # Claude API integration
```
