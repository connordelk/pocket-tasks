# Demo video outline (3–5 minutes)

Record the **deployed Netlify site**, not localhost. Upload the video to YouTube as **unlisted** and add its URL to the README.

1. **0:00–0:30 — Introduce Pocket Tasks.** Say it is a private task manager built with Codex, JavaScript, Supabase, and Netlify. Show the deployed URL in the browser.
2. **0:30–1:20 — Accounts.** Create a test account, log out, and log back in. If you chose to keep email confirmation enabled, show that step too.
3. **1:20–2:40 — Database and CRUD.** Add a task, refresh the browser to show it was saved, edit the title, mark it done, try the filters, and delete it. Open the Supabase table to show that the task appears there while it exists.
4. **2:40–3:40 — Code tour.** Show `index.html` (interface), `src/main.js` (auth and task operations), `database.sql` (the table and security policies), and `netlify.toml` (hosting settings). Keep this brief.
5. **3:40–4:15 — Wrap up.** Show the README, live site link, and video link. Mention that the task data belongs to the logged-in user.

Before recording, use a test account and avoid showing passwords or secret keys. Verify the deployed app works from a fresh browser session.
