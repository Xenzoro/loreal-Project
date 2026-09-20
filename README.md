# L'Oréal Smart Product Advisor

An AI beauty advisor chatbot for L'Oréal products. You pick products from a catalog, and the chatbot (Lori) builds you a personalized routine using only the products you actually selected. It won't recommend something you didn't pick.

## Stack

- Vanilla JS, HTML, and CSS on the frontend. No frameworks.
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

## Setup

The Worker needs:

- `OPENAI_API_KEY` set as a secret.
- A KV namespace bound as `RATE_LIMIT_KV` for the rate limiting to work.

The frontend is just static files (`index.html`, `style.css`, `script.js`), so you can serve those from anywhere. Just point `script.js` at your deployed Worker URL.
