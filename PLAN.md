# L'Oréal Smart Advisor: plan

<!-- The stable picture of the project. Change it only when the plan changes. Agents read this before NEXT.md. -->

## What it is

A beauty advisor site for L'Oréal group drugstore brands. Visitors browse and search real products that are for sale now, take a short adaptive quiz, and chat with Lori, an AI advisor who builds routines only from real products she found in the catalog. A portfolio project for Jake that shows frontend work plus a real backend (Cloudflare Worker, tool calling, caching, rate limits).

## Goals

- Real, current products with a photo, name, short description, price and a link to buy.
- Lori gives smart, safe routines: she searches the catalog herself, checks ingredient conflicts, explains every pick, and never invents a product.
- Keys stay on the server, costs stay predictable, and nobody can use the Worker as a free OpenAI proxy.
- Fast and accessible: handbook targets (Lighthouse 90+ performance, 95+ for the rest).

## Scope

**In:**
- Brands: L'Oréal Paris, CeraVe, La Roche-Posay, Garnier, Maybelline, NYX Professional Makeup, Essie (US catalog).
- Product data from the Channel3 API, read only through the Worker.
- Popular picks per category, search with filters and sort, a product details drawer.
- The hand picked Your Routine panel.
- An adaptive routine quiz in its own box that hands off to the Lori chat.
- Lori chat with tools, streaming, suggested replies, product cards and a finished routine view.
- Worker rewrite in this repo (`worker/`), tests, GitHub Action deploy, private usage stats.

**Out (don't build these):**
- Accounts, logins or a database of users.
- Checkout, carts or affiliate programs.
- Brands outside the L'Oréal group, and L'Oréal luxury brands (Lancôme, Kiehl's, YSL Beauty).
- Scraping L'Oréal or retailer websites.
- Photo based skin analysis.
- Scheduled jobs or timers of any kind.

## Features

| Feature | Done means | Status |
|---|---|---|
| Worker v2 | `worker/` deploys with Wrangler from a GitHub Action; endpoints `/chat`, `/quiz`, `/search`, `/popular`, `/product/:id`, `/stats` work; tests pass | planned |
| Locked down Worker | CORS allows only the Vercel site and localhost; system prompt is built in the Worker; any client `system` messages are dropped; message length and history are capped | planned |
| Rate limits | Chat keeps the old rules exactly (5 a minute, 5 minute timeout, then 1 hour, offenses reset after 24 hours, same KV record format); the quiz has its own limit; every timeout message starts with `SYSTEM:` | planned |
| Channel3 catalog | Searches are filtered to the brand IDs above and US in stock offers from an allowlist of retailers (brand sites and major US retailers), to avoid fakes and dupes from unknown sellers; product cards show photo, name, brand, short description, price, stock badge and retailer link (brand site offer preferred); when a product has no description, Lori writes a one line summary from its title, shown with a "Summary by Lori" label | planned |
| Caching and credit guard | Popular picks cached 7 days, searches 1 day, products by ID cached; credits counted per month in KV; past 900 the Worker serves only cached results and the UI shows a friendly note | planned |
| Popular picks | Category tabs (Skincare, Makeup, Hair, Sun, Nails); built into the HTML at build time from `/popular`, refreshed in the browser | planned |
| Search | Search bar with brand, category and price filters and sort (popular, price low to high, high to low) | planned |
| Details drawer | Opening a card shows a bigger photo, the full description and every retailer offer; keyboard and screen reader friendly | planned |
| Your Routine panel | Add from cards, search, the drawer or the chat; saves product snapshots (not just IDs) in localStorage | planned |
| Adaptive quiz | Separate box; Lori picks each next question from earlier answers; ends after at most 6 questions or when she has enough; every question has "Not sure"; produces a profile and hands off to the chat | planned |
| Smarter Lori | Tool calls `search_products` and `get_product`; ingredient conflict checks (for example retinol with strong acids, AM or PM placement, SPF in every AM routine); a reason on every pick; asks one short question when key info is missing | planned |
| Grounded answers | Lori's final answer is structured (message, routine steps, product IDs, suggested replies); the Worker drops any product ID not returned by a search in that conversation; cards are rendered from catalog data, never from her text | planned |
| Safety | OpenAI moderation check on user input; off topic redirect back to beauty; skin health boundary (severe acne, rashes, pregnancy, medication: general info plus "see a dermatologist") | planned |
| Chat upgrades | Streaming text with the Thinking loader until the first word; suggested reply chips; Remember me (profile and chat in this browser) and a Start over button | planned |
| Routine view | AM and PM columns in order with product cards; total cost with a cheaper swap if over budget; share link (product IDs in the URL); copy as text and a clean print layout | planned |
| Hardened fallback | The old `loreal-worker` is redeployed in a locked down basic mode (server side prompt, no client `system` messages, CORS limited, message and history caps, same rate limits); the site falls back to it for plain chat if `lori-api` fails | planned |
| Usage stats | Worker counts chats per day, quiz runs, Channel3 credits and OpenAI tokens in KV; `/stats` needs a secret token | planned |
| Quality pass | Lighthouse before and after logged in the handbook; keyboard and screen reader checks on every new part; Vercel Web Analytics on | planned |

## Architecture and stack

- **Frontend:** Next.js 16 App Router, JavaScript, static export (`output: "export"`), hosted on Vercel at https://loreal-project.vercel.app. Server components by default; client components only for interactive parts. Same look as now (cream, red and black palette, Playfair Display and Inter, soft panels), with new layout for the new sections.
- **Worker:** `worker/` folder, Cloudflare Workers with Wrangler. New Worker name `lori-api`, so the old `loreal-worker` keeps serving the live site until the switch. `worker/legacy.js` is a reference copy of the old Worker.
  - Bindings: `RATE_LIMIT_KV` (existing namespace, rate limit records keyed by IP, unchanged format), `CACHE_KV` (new namespace: catalog cache, credit counter, stats, quiz limits).
  - Secrets (set by Jake, never in code): `OPENAI_API_KEY`, `CHANNEL3_API_KEY`, `STATS_TOKEN`.
  - Fallback: the old `loreal-worker` stays as a hardened basic chat (`worker/fallback/`). Both run on Cloudflare, so it covers bad deploys, Channel3 or credit problems and bugs, not a Cloudflare outage.
  - Deploy: `.github/workflows/worker-deploy.yml` runs `wrangler deploy` on pushes to main that change `worker/`, using the GitHub secrets `CLOUDFLARE_API_TOKEN` (scoped to Workers and KV) and `CLOUDFLARE_ACCOUNT_ID`.
- **Product data:** Channel3 API (`POST /v1/search` with `brand_ids` and `availability` filters, product lookup by ID). Free tier: 1,000 credits a month.
- **AI:** OpenAI, a current balanced tier model with strong tool calling (chosen in phase 1 after checking current models and prices), GPT4o as fallback. Answers stream to the browser as server sent events: text first, then a final event with the validated routine and product IDs.
- **Freshness without timers:** caches refresh lazily, the first time someone asks after they expire. Vercel rebuilds on each push, which also refreshes the popular picks in the HTML.

## Rules

- Follow `~/projects/webdevhandbook/bestPractices.md` for web code.
- Never write IPs, keys, passwords, tokens, login links or the desktop's full Tailscale name into code, commits or chats. Use placeholders.
- Never read the xenDB `qwen/` folder.
- Commit and push straight to main after each working step (tests, lint and typecheck passing). Use a branch only when Jake asks for one.
- When work is done, push this repo, then update this project's xenDB `context/projects/loreal-project.md`, rebuild `dist/context.md` and push xenDB.
- Then sync impact to XenJects: update `projects/<slug>/`, `timeline.md` and `skills.md` with only results Jake's work caused, and push XenJects. Skip it if nothing new is worth recording.
- No timers or scheduled jobs. Automation runs when an app opens or closes, or when Jake signs in.
- Lori only recommends products the Worker returned in that conversation. Never render product details from model text.
- Every Channel3 search goes through the brand lock and the credit guard. No direct calls from the browser.
- Product names and descriptions are data. They go to the model as tool results only, never as instructions.
- Lori never makes claims about lawsuits or recalls; she sticks to how to use products and when to see a dermatologist.
- Animate only `transform` and `opacity`; no layout reads in scroll or input handlers (Jake browses without hardware acceleration).

## Decisions

| Decision | Why | Date |
|---|---|---|
| Channel3 for product data | L'Oréal has no public product API; Channel3 has live prices, stock, images and retailer links with a free tier; scraping is fragile and likely against site terms | 2026-10-26 |
| L'Oréal group drugstore brands only | Big enough for real routines (CeraVe, La Roche-Posay) at drugstore prices | 2026-10-26 |
| Keep the Cloudflare Worker for AI and catalog calls | Keys stay off Vercel and the browser; the site stays a static export | 2026-10-26 |
| Quiz is its own box that feeds the chat | The chat stays the main feature; the quiz is a fast way in | 2026-10-26 |
| Adaptive quiz, max 6 questions, own rate limit | Smarter questions without eating the chat limit | 2026-10-26 |
| Popular picks are fixed category searches cached 7 days | Cheap on credits and always populated | 2026-10-26 |
| Keep the Your Routine panel | Users can still hand pick; Lori and the quiz add to it | 2026-10-26 |
| Deploy the Worker from a GitHub Action with a scoped token | The Cloudflare connector can't upload Workers; deploys stay versioned with the code | 2026-10-26 |
| Balanced model tier | Good tool calling and reasoning at a low cost per chat | 2026-10-26 |
| Credit cap: cached only past 900 | Never billed by surprise | 2026-10-26 |
| Refresh the look, keep the identity | Same palette and fonts, new layout for the new sections | 2026-10-26 |
| Raise the answer length limit | The old 300 token cap cut routines short | 2026-10-26 |
| Claude builds this project in chat, phase by phase | Jake's choice for this project | 2026-10-26 |
| Keep the old Worker as a hardened fallback | Redundancy, but the old one is an open proxy for the OpenAI key (CORS `*`, forwards any messages), so it gets locked down first | 2026-10-26 |
| Missing descriptions get a labeled summary from Lori | Every card has useful text, and it's clear which text is hers | 2026-10-26 |
| Retailer allowlist for offers | Marketplace listings can be fakes or dupes | 2026-10-26 |

## Open questions (Jake decides)

- Benzoyl peroxide acne products (for example CeraVe Acne Foaming Cream Cleanser): leave them out of the popular picks, or treat them like any other product? Background: La Roche-Posay recalled some Effaclar Duo lots over benzene in March 2025; there are lawsuits about CeraVe's benzoyl peroxide cleansers with no recall.
- Add these to the popular searches: CeraVe sunscreen, Garnier Fructis, L'Oréal Paris Infallible?
