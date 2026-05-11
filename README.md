# Automify

Automify is a Next.js automation SaaS for connecting apps and building workflow automations. The app provides an authenticated dashboard where users can connect services such as Google Drive, Discord, Notion, and Slack, then compose workflows with trigger/action nodes for tasks like sending messages, creating Notion entries, and reacting to Google Drive activity.

## Tech stack

- Next.js 15 App Router with React 19 and TypeScript
- Auth.js/NextAuth for Google and GitHub OAuth login
- Prisma with PostgreSQL for persistence
- Razorpay for paid plan checkout
- Tailwind CSS and Radix UI for the interface
- OAuth integrations for Google Drive, Discord, Notion, and Slack

## Prerequisites

- Node.js compatible with Next.js 15
- npm (this repo includes `package-lock.json`)
- PostgreSQL database
- OAuth apps/credentials for the integrations you plan to use
- Auth.js application secret and OAuth credentials for Google/GitHub login
- Razorpay key ID and key secret if billing pages/API are used

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local environment files. This project currently reads variables from both `.env` and `.env.local`; keep secrets in `.env.local` and public/client-safe values in `.env`.

3. Configure the database and generate Prisma artifacts:

   ```bash
   npx prisma generate
   npm run db:migrate
   ```

4. If using the current development script, create local HTTPS certificates at `ssl/key.pem` and `ssl/cert.pem`. The `npm run dev` script runs `node server.js`, and that server reads those files before starting on `https://localhost:3000`.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open `https://localhost:3000`.

## Environment variables

The exact values depend on your Auth.js, OAuth, Razorpay, and database setup. Variables discovered in the app are listed below.

### Required core variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Secret used to sign Auth.js sessions |
| `NEXTAUTH_URL` | Base app URL used by Auth.js callbacks |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials for app login |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth credentials for app login |
| `LOCAL_AUTH_ENABLED` | Optional local login fallback toggle |
| `LOCAL_AUTH_SECRET` | Optional local login session signing secret |
| `LOCAL_AUTH_EMAIL` / `LOCAL_AUTH_PASSWORD` | Optional production local fallback credentials |
| `NEXT_PUBLIC_URL` | Base application URL used by OAuth callbacks |
| `RAZORPAY_KEY_ID` | Razorpay key ID used to create checkout orders |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret used to create orders and verify payment signatures |

### Integration variables

| Variable | Purpose |
| --- | --- |
| `DISCORD_CLIENT_ID` / `NEXT_PUBLIC_DISCORD_CLIENT_ID` | Discord OAuth client ID |
| `DISCORD_CLIENT_SECRET` | Discord OAuth client secret |
| `DISCORD_REDIRECT_URI` | Discord OAuth callback URL |
| `DISCORD_TOKEN` | Discord bot/application token, if needed by Discord features |
| `DISCORD_PUBLIC_KEY` | Discord public key, if needed by Discord features |
| `NOTION_CLIENT_ID` / `NEXT_PUBLIC_NOTION_CLIENT_ID` | Notion OAuth client ID |
| `NOTION_CLIENT_SECRET` | Notion OAuth client secret |
| `NOTION_REDIRECT_URI` | Notion OAuth callback URL |
| `NOTION_ENCRYPTION_KEY` | Key used when storing Notion connection data |
| `SLACK_CLIENT_ID` / `NEXT_PUBLIC_SLACK_CLIENT_ID` | Slack OAuth client ID |
| `SLACK_CLIENT_SECRET` | Slack OAuth client secret |
| `SLACK_REDIRECT_URI` | Slack OAuth callback URL |
| `SLACK_SIGNING_SECRET` | Slack request signing secret |
| `SLACK_BOT_TOKEN` | Slack bot token |
| `SLACK_APP_TOKEN` | Slack app-level token |
| `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `OAUTH2_REDIRECT_URI` | Google OAuth redirect URI used by Drive API routes |
| `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` | Google Drive OAuth callback URL used by connection cards |
| `NEXT_PUBLIC_GOOGLE_SCOPES` | Google OAuth scopes, if configured externally |
| `NEXT_PUBLIC_OAUTH2_ENDPOINT` | Google OAuth endpoint, if configured externally |
| `NGROK_URI` | Public tunnel URL for Google Drive change notifications |
| `CRON_JOB_KEY` | Bearer token used by scheduled/notification flows |

### Other public configuration

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_DOMAIN` | Public app domain |
| `NEXT_PUBLIC_SCHEME` | URL scheme, such as `http` or `https` |
| `NEXT_PUBLIC_UPLOAD_CARE_CSS_SRC` | Uploadcare CSS source, if Uploadcare UI is enabled |
| `NEXT_PUBLIC_UPLOAD_CARE_SRC_PACKAGE` | Uploadcare package source, if Uploadcare UI is enabled |

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the custom HTTPS Next.js development server via `node server.js` |
| `npm run build` | Runs `prisma generate`, applies deployed migrations, then builds Next.js |
| `npm run start` | Starts the production Next.js server |
| `npm run lint` | Runs the configured Next.js lint command |
| `npm run db:migrate` | Runs Prisma migrations with `.env.local` loaded through `dotenv-cli` |

## Database

Prisma schema lives in `prisma/schema.prisma` and targets PostgreSQL. The main models are users, connected accounts, workflow definitions, and provider-specific connection records for Google, Discord, Notion, and Slack.

Typical local workflow:

```bash
npx prisma generate
npm run db:migrate
```

### Migration workflow and safety

- Required environment: set `DATABASE_URL` in `.env.local` before running migrations. It must point at the intended PostgreSQL database; Prisma reads it through `env("DATABASE_URL")` in `prisma/schema.prisma`.
- Local command behavior: `npm run db:migrate` loads `.env.local` with `dotenv-cli` and runs `npx prisma migrate dev`. Use it for local development databases because it may create new migration files, apply pending migrations, and ask for/reset local state when Prisma detects drift.
- Staging/production behavior: do not run `npm run db:migrate` against shared, staging, or production databases. For deployed environments, review committed migration SQL first, take a database backup/snapshot, then apply migrations with Prisma's deploy flow, for example `npx prisma migrate deploy`, using the environment-specific `DATABASE_URL`.
- Backup expectation: take a restorable backup before applying migrations anywhere with shared or customer data. Confirm the backup can be restored before running destructive or uniqueness-changing migrations.
- Rollback expectation: Prisma migrations are forward-only in this project. If a migration has already been applied to a shared environment, prefer a new forward-fix migration over editing or deleting the applied migration. Only use database restores as an operational rollback after confirming the restore target and data-loss impact.
- Validation commands before opening a PR or deploying:

  ```bash
  npm pkg get scripts
  npx prisma validate
  npx prisma migrate status
  ```

  `npx prisma migrate status` requires `DATABASE_URL`; run it only against the database you intend to inspect.

## OAuth callback routes

Configure provider dashboards to point back to the matching app routes and set the corresponding redirect URI variables:

- Discord: `/api/auth/callback/discord`
- Notion: `/api/auth/callback/notion`
- Slack: `/api/auth/callback/slack`
- Google Drive: `/api/auth/callback/googleDrive`

For local development, make sure the callback URLs match the HTTPS localhost or tunnel URL used by the running app.

## Notes for development

- The repository currently has a custom `server.js` development entrypoint that requires local SSL files. If those files are absent, `npm run dev` fails before Next.js starts.
- Google Drive activity notifications require a publicly reachable callback URL, so local testing usually needs a tunnel such as ngrok and a matching `NGROK_URI`.
- Do not commit real `.env` or `.env.local` values.
