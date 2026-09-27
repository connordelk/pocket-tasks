# Pocket Tasks

Pocket Tasks is a small, private task manager. Create an account, log in, add tasks, edit their names, mark them done, and delete them. Each person sees only their own tasks.

**Live app:** [Pocket Tasks on Netlify](https://incandescent-kangaroo-36ee2b.netlify.app/)  
**GitHub repository:** [connordelk/pocket-tasks](https://github.com/connordelk/pocket-tasks)  
**Demo video:** (https://www.youtube.com/watch?v=CdIOgh4GKqk)

## What the app does

- Email and password registration, login, and logout
- Create, read, update, and delete tasks
- Mark tasks complete or incomplete
- Filter tasks by all, to do, and done
- Save tasks in a Supabase database with row level security so users can access only their own rows

## Technologies used

- HTML, CSS, and JavaScript for the interface
- Vite for local development and the production build
- Supabase Auth for accounts
- Supabase Postgres for the `tasks` table
- Netlify for hosting
- OpenAI Codex as the AI development assistant

## Setup instructions

### 1. Create the Supabase backend

1. Create a free project at [Supabase](https://supabase.com/dashboard).
2. In its **SQL Editor**, paste and run the full contents of [`database.sql`](database.sql). This creates the `tasks` table and the policies that protect each user's data.
3. In **Authentication → Providers → Email**, make sure email authentication is enabled. For this small class demo, turn **Confirm Email** off so a grader can create an account and log in right away. [Supabase's default email service](https://supabase.com/docs/guides/auth/auth-smtp) sends confirmation mail only to addresses on your project team; supporting public email confirmation would require a separate SMTP service. Password login and the database policies still protect each user's tasks.
4. In the project's **Connect** dialog or **Settings → API Keys**, copy the project URL and **publishable key**. Never use a secret or service role key in this app.

### 2. Run locally

Node.js 20.19+ or 22.12+ is needed for Vite 7. The included lockfile uses pnpm. If you only have npm, use `npm install`, `npm run dev`, and `npm run build` in place of the pnpm commands below.

```bash
pnpm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred. Edit `.env` with the URL and publishable key from your Supabase project:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Then run:

```bash
pnpm dev
```

Open the local address printed by Vite. The `.env` file is ignored by Git. The publishable key is designed for browser use; the database policies in `database.sql` provide the actual data protection.

### 3. Deploy on Netlify

The live app above was deployed with **Netlify Drop**. To publish an updated version:

1. With `.env` configured, run `pnpm build`.
2. In [Netlify](https://app.netlify.com/), open the Pocket Tasks site and upload the `dist` folder or a zip of its **contents**. Netlify serves `index.html` from the top level.
3. Keep the site public so a grader can open it. The app still requires a Supabase account for task access.
4. In Supabase **Authentication → URL Configuration**, set **Site URL** to the live address and add that address under **Redirect URLs**. This has already been done for the current site.
5. Test registration, login, adding a task, editing it, completing it, deleting it, and logout on the deployed site.
6. Add your unlisted demo video URL to the top of this README.

This Netlify site is a manual deployment, so a GitHub push does **not** update the site automatically. `netlify.toml` is included if you later connect the repository for automatic deployment; in that case add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as Netlify build environment variables.

## Project structure

```text
index.html          Page structure and forms
src/main.js         Authentication, task CRUD, filters, and UI updates
src/style.css       Responsive design
database.sql        Supabase table and row level security policies
netlify.toml        Netlify build settings
.env.example        Names of the two required configuration values
DEMO_GUIDE.md       3–5 minute video outline
```

## GitHub and submission

This project has a series of meaningful commits on `main`. After recording, edit this README on GitHub to add your unlisted video link, then commit that change. Submit the [public GitHub repository](https://github.com/connordelk/pocket-tasks) URL on Canvas. See [`DEMO_GUIDE.md`](DEMO_GUIDE.md) for a short walkthrough plan.
