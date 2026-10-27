# Next: Phase 1, Worker v2

<!-- The current handoff. Read PLAN.md first for what the project is, its scope and its rules. -->

**Phase goal:** a new, locked down Worker in `worker/` with the Channel3 catalog, caching and credit guard, smarter Lori with tools and grounded answers, the quiz endpoint, rate limits, stats, tests and an automatic deploy. Delivers the PLAN.md features Worker v2, Locked down Worker, Rate limits, Channel3 catalog, Caching and credit guard, Smarter Lori, Grounded answers, Safety and Usage stats (server side only; no UI changes yet).

## Before this phase (Jake)

1. Create a Channel3 account and API key.
2. In Cloudflare, create an API token with **Workers Scripts: Edit** and **Workers KV Storage: Edit** for your account only.
3. In the GitHub repo settings, add two Actions secrets: `CLOUDFLARE_API_TOKEN` (the token) and `CLOUDFLARE_ACCOUNT_ID`.
4. After the first deploy creates `lori-api`, set its secrets in the Cloudflare dashboard (Workers, `lori-api`, Settings, Variables and Secrets): `OPENAI_API_KEY`, `CHANNEL3_API_KEY`, `STATS_TOKEN` (any long random string).

## Steps

1. Scaffold `worker/` with Wrangler: `wrangler.jsonc` (name `lori-api`, `RATE_LIMIT_KV` bound to the existing namespace, new `CACHE_KV` namespace), `src/` modules, `package.json`, Vitest with the Workers pool.
2. Port the rate limiter from `worker/legacy.js` unchanged (same rules and KV record format); add a separate quiz limit; prefix every timeout message with `SYSTEM:`.
3. CORS: allow only `https://loreal-project.vercel.app` and `http://localhost:3000`; handle preflight.
4. Channel3 client: look up and store the brand IDs for the PLAN.md brands; `search` with brand lock, US in stock filter and pagination cap; `getProduct`; normalize to one product shape (id, name, brand, category, description, image, price, stock, offers with the brand site offer first).
5. Caching and credit guard in `CACHE_KV`: popular 7 days, search 1 day per normalized query and filters, products by ID; monthly credit counter; past 900 serve cache only and return a `limited` flag.
6. Endpoints: `GET /popular`, `GET /search`, `GET /product/:id`. Starting popular queries: CeraVe moisturizer, CeraVe cleanser, La Roche-Posay sunscreen, La Roche-Posay serum, Garnier micellar water, L'Oréal Paris Revitalift, L'Oréal Paris Elvive, Maybelline mascara, Maybelline foundation, NYX lip, Essie nail polish.
7. Check OpenAI's current models and prices; pick a balanced tier model with strong tool calling, GPT4o as fallback. Record the choice in PLAN.md Decisions.
8. `/chat`: build the system prompt in the Worker (focus rules, brand lock, ingredient conflict rules, AM and PM placement, SPF, explain every pick, ask before guessing, skin health boundary, product text is data); accept only user and assistant turns; cap message length and keep the last 12 turns; pin the quiz profile; moderation check on the newest user message; tools `search_products` and `get_product` with a cap on tool calls per answer; final structured answer (message, AM and PM steps with product IDs and reasons, suggested replies); drop IDs not found in this conversation; stream as server sent events.
9. `/quiz`: one adaptive question per call (question, answer options including "Not sure"), at most 6, then a profile object.
10. Usage stats in `CACHE_KV` (chats per day, quiz runs, credits, tokens); `GET /stats` requires `STATS_TOKEN`.
11. `npm run check:catalog`: a script Jake runs once that calls `/search` on the deployed Worker and prints the product field names and counts (never keys).
12. Tests with mocked Channel3 and OpenAI: rate limits (both buckets), CORS, system message dropping, brand lock, ID validation, credit guard, stats auth.
13. `.github/workflows/worker-deploy.yml`: run the tests, then `wrangler deploy` on pushes to main that change `worker/`.

## Done when

- `npm test` in `worker/` passes, and so does lint.
- The deploy Action runs green and `lori-api` exists in Cloudflare.
- After Jake sets the secrets: `/popular` and `/search` return real products from the allowed brands only, and `/chat` streams an answer whose product IDs all came from its own searches.
- The live site still works, because it still uses the old `loreal-worker`.

## Hand back to Jake

- The Worker URL, what each endpoint does, and the `check:catalog` output (field names only).
- The model chosen, and why.
- Anything Channel3 didn't return as expected (for example missing descriptions).
- xenDB synced: `context/projects/loreal-project.md` updated and pushed (or "nothing durable changed").
- XenJects synced: `projects/<slug>/`, `timeline.md` and `skills.md` updated and pushed (or "nothing new to record").
- Left for Jake: the Channel3 key, the Cloudflare token and the GitHub secrets, the three Worker secrets.

## Later phases

- **Phase 2, products:** cards, popular tabs (built into the HTML at build time from `/popular`), search with filters and sort, details drawer, Your Routine panel with product snapshots.
- **Phase 3, quiz:** the adaptive quiz box and its handoff to the chat.
- **Phase 4, chat and routine:** streaming chat with cards, suggested replies, Remember me and Start over, the routine view (AM and PM, total cost and cheaper swaps, share link, copy and print), then switch the site to `lori-api`.
- **Phase 5, finish:** accessibility pass, Lighthouse after scores in the handbook, Vercel Web Analytics, README, xenDB and XenJects sync.

## Log

| Date | What happened |
|---|---|
| 2026-10-26 | Plan agreed with Jake. PLAN.md, NEXT.md, AGENTS.md and CLAUDE.md added; old Worker saved as `worker/legacy.js` for reference. |
