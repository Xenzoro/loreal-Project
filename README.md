# L'Oréal Smart Product Advisor

An AI beauty advisor chatbot for L'Oréal products. You pick products from a catalog, and the chatbot (Lori) builds you a personalized routine using only the products you actually selected. It won't recommend something you didn't pick.

Live: https://loreal-project.vercel.app/

## Stack

- Next.js 16 (App Router, JavaScript), built as a static export and hosted on Vercel.
- OpenAI GPT4o for the actual chat responses.
- A Cloudflare Worker sitting between the frontend and OpenAI, so the API key never touches the browser.

## How the recommendations stay honest

The system prompt sent to GPT4o is written so Lori only ever talks about the products the user selected. Nothing invented, nothing substituted in from the wider catalog. If you didn't pick it, it's not part of the routine.

## Rate limiting

The Worker tracks requests per IP using Cloudflare KV. If you send more than 5 messages in a minute:

- First offense: 5 minute timeout.
- If you offend again after that: 1 hour timeout.
- The offense count resets after 24 hours of normal use.

While you're in an active timeout, any message you send just gets the timeout message repeated back. No new escalation, and no request goes to OpenAI, so someone spamming the chat while blocked can't rack up API cost.

Timeout messages show up in the chat prefixed with `SYSTEM:` so it's clear that's a system message and not something Lori said.

There's also a monthly spending cap set directly on the OpenAI account. That's a separate, independent layer of protection on top of the rate limiting, not a replacement for it.

## Project structure

```
app/
  layout.js        Fonts (next/font), metadata, header, <main>, footer
  page.js          The page (server component, rendered to HTML at build time)
  globals.css      All styles
  fonts/           Self hosted Inter and Playfair Display (variable, latin)
components/
  SiteHeader.js    Logo and hero (server)
  SiteFooter.js    Footer (server)
  AdvisorProvider.js  Shared state: selected products and chat (client)
  ProductGrid.js, ProductCard.js, SelectedProducts.js   Product picker (client)
  ChatPanel.js     Chat window, Thinking loader and message form (client)
lib/
  products.js      Product catalog
  lori.js          Worker URL, system prompt, routine request text
  selectionStore.js  Selected products in localStorage
public/img/        Logo (WebP)
.github/workflows/pages-redirect.yml   GitHub Pages redirect to Vercel
```

## Develop

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in out/
```

## Deploy

Vercel builds and deploys every push to `main` automatically, and gives every other branch a preview URL.

The old GitHub Pages address (https://xenzoro.github.io/loreal-Project/) only redirects to Vercel, keeping the rest of the path. `.github/workflows/pages-redirect.yml` publishes that redirect page; it runs when the workflow file changes or by hand from the Actions tab. One time setup: Settings, Pages, Build and deployment, Source: **GitHub Actions**.

## Worker setup

The Worker needs:

- `OPENAI_API_KEY` set as a secret.
- A KV namespace bound as `RATE_LIMIT_KV` for the rate limiting to work.

The frontend points at the Worker URL in `lib/lori.js`. If the Worker restricts which sites may call it (CORS), allow `https://loreal-project.vercel.app`.
