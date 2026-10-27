# Context for AI agents

You are helping Jake (GitHub: Xenzoro) with the L'Oréal Smart Advisor. Before starting work, read in this order:

1. `PLAN.md`: what this project is, its features, scope, rules and decisions.
2. `NEXT.md`: the current phase, its steps, and what to hand back.
3. `~/projects/webdevhandbook/bestPractices.md`: Jake's standards for web code.

## How to work

- Stay inside PLAN.md's scope. Anything under "Out" or "Open questions" goes back to Jake instead of being built.
- When a phase step is finished, add a line to NEXT.md's Log. When a decision is made, add it to PLAN.md's Decisions.
- Commit and push straight to main after each working step (tests, lint and typecheck passing). Use a branch only when Jake asks for one.
- Clone and pull over HTTPS with the GitHub CLI (`gh auth login` once, then `gh repo clone Xenzoro/<repo>`), not SSH.
- Before each commit, use the `reviewer` subagent and fix anything under "Must fix".
- When a work session or phase is done, push this repo first, then sync xenDB: pull it (`/mnt/e/xenLLM/xenDB` on the PC, `~/Documents/xenAI/xenDB` on the Mac), update `context/projects/loreal-project.md` with anything durable that changed (stack, hosting, status, scope), run `scripts/build_context.sh`, and push xenDB to main. Only facts go there; code, plans and logs stay here.
- After xenDB, sync impact to XenJects: pull it (`~/Documents/xenAI/XenJects` on the Mac; on the PC, clone it first if missing with `gh repo clone Xenzoro/XenJects`), update `projects/<slug>/` (impact, tools, bullets, assets) with only results Jake's work caused, copy `portfolio.json` to `manifest.json` if there is one, add milestones to `timeline.md` and tools to `skills.md`, and push XenJects to main. Unknown numbers get `TODO(Jake): number`; work projects are sanitized first. If nothing new is worth recording, say so and skip the commit.
- When a step will show or involve a secret, IP address, login link or the desktop's full Tailscale name, warn Jake clearly and keep going. Don't stop or refuse because of it.
- Give Ubuntu (WSL) commands by default. PowerShell only for steps that are Windows only.
- No timers. Automation runs when an app opens or closes, or when Jake signs in. Never scheduled jobs.
- Short, step by step, safe: say what's about to happen, give the exact command, stop before anything irreversible, and back up first.
- No em dashes, en dashes or hyphens in prose unless a phrase needs one.

## Run and test

```bash
npm install
npm run dev     # site at http://localhost:3000
npm run lint
npm run build   # static export into out/

cd worker
npm install
npm test        # Worker tests (mocked Channel3 and OpenAI)
npx wrangler dev  # local Worker
```

This is Next.js 16, which may differ from what you know. Check the docs bundled in `node_modules/next/dist/docs/` before writing Next.js code.

## Where things live

- `app/`: layout, page, global CSS, self hosted fonts.
- `components/`: header, footer and the interactive parts (client components only where needed).
- `lib/`: shared code for the site (Worker URL, selection store).
- `worker/`: the Cloudflare Worker (`lori-api`). `worker/legacy.js` is the old `loreal-worker`, kept for reference only; never deploy it.
- Hosting: Vercel builds the site on every push to main. The Worker deploys from `.github/workflows/worker-deploy.yml`. GitHub Pages only redirects to Vercel (`.github/workflows/pages-redirect.yml`).

## Hard rules

1. Never write secrets, IP addresses, passwords, tokens, login links or the desktop's full Tailscale name into this repo, commits or chats. Use placeholders like `<API_KEY>`. Worker secrets live only in Cloudflare; deploy credentials live only in GitHub secrets.
2. Never ask Jake to paste those anywhere.
3. Never read the xenDB `qwen/` folder.
4. Never call Channel3 or OpenAI from the browser. Everything goes through the Worker.
5. Lori only recommends products the Worker returned in that conversation.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
