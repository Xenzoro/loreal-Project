# Secrets setup for the Lori Worker

A one time walkthrough for the keys and tokens the new Worker (`lori-api`) needs. Do these yourself. The values never go into this repo, a commit, a chat, or a file on disk.

**Golden rule:** a key or token is only ever typed or pasted into one of three places: your password manager, a GitHub secret field, or a Cloudflare secret field. If one ever lands anywhere else (a chat, a commit, a screenshot), jump to [If something leaks](#if-something-leaks).

## What you'll end up with

| Name | What it is | Where it lives | When |
|---|---|---|---|
| `CHANNEL3_API_KEY` | Lets the Worker search products | Cloudflare, on `lori-api` | Step 6 |
| `OPENAI_API_KEY` | Lets the Worker talk to OpenAI | Cloudflare, on `lori-api` | Step 6 |
| `STATS_TOKEN` | Password for your private `/stats` page | Cloudflare, on `lori-api`, and your password manager | Step 6 |
| `CLOUDFLARE_API_TOKEN` | Lets GitHub deploy the Worker | GitHub repo secret | Step 5 |
| `CLOUDFLARE_ACCOUNT_ID` | Tells GitHub which Cloudflare account to deploy to | GitHub repo secret | Step 5 |

Steps 1 to 5 can be done now. Step 6 waits until the first deploy has created `lori-api`; I'll tell you when.

## Step 1: Channel3 API key

1. Go to https://trychannel3.com and sign up. No credit card is needed for the free tier (1,000 credits a month).
2. In the Channel3 dashboard, open the API keys section and create a key. Name it `lori-api`.
3. Copy it straight into your password manager as **Channel3 lori-api**. You'll paste it into Cloudflare in step 6.

Don't add a payment method. Without one you can never be billed, and the Worker's credit guard stops at 900 credits anyway.

## Step 2: A dedicated OpenAI key

You can't read the existing key back out of Cloudflare (secret values are write only), and a separate key per Worker means you can turn one off without breaking the other.

1. Go to https://platform.openai.com and open the **API keys** page.
2. Create a new secret key named `lori-api`.
3. Copy it into your password manager as **OpenAI lori-api**. OpenAI only shows it once.
4. While you're there, check your monthly budget limit under billing. Your existing cap protects both Workers.

## Step 3: Your Cloudflare account ID

This isn't a secret on its own, but keep it in GitHub secrets so it isn't sitting in the repo.

1. Open https://dash.cloudflare.com and go to **Workers & Pages**.
2. In **Account Details**, select the copy button next to **Account ID**.
   (Or press `Ctrl + K` anywhere in the dashboard, type `Copy account ID`, and press Enter.)
3. Keep it in your clipboard for step 5, or save it in your password manager.

## Step 4: A Cloudflare API token for GitHub

This token lets GitHub Actions deploy Workers and nothing else.

1. In the Cloudflare dashboard, go to **Manage Account**, then **Account API Tokens** (direct link: https://dash.cloudflare.com/?to=/:account/api-tokens).
2. Select **Create Token**.
3. Use the **Edit Cloudflare Workers** template. It includes Workers Scripts and Workers KV Storage edit permissions.
4. Name it `github loreal-Project deploy`.
5. **Account Resources:** pick **Include** and your one account. Never "All accounts".
6. **Zone Resources:** if you have no domains on Cloudflare, leave the default. If you do, pick **Include** and a specific zone you don't mind, or remove that row if the page lets you; the Worker only uses its free `workers.dev` address.
7. **TTL:** optional. Leaving it empty means no expiry; setting a date means you'll need a new token when it runs out.
8. Select **Continue to summary**, check that it lists only Workers and KV permissions for your account, then **Create Token**.
9. Copy the token (shown once) into your password manager as **Cloudflare GitHub deploy**.

## Step 5: Add the two GitHub secrets

1. Open https://github.com/Xenzoro/loreal-Project.
2. Go to **Settings**, then **Secrets and variables**, then **Actions**.
3. Select **New repository secret**.
   - Name: `CLOUDFLARE_API_TOKEN`
   - Secret: the token from step 4
   - Select **Add secret**.
4. Select **New repository secret** again.
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Secret: the account ID from step 3
   - Select **Add secret**.
5. Both should now be listed by name. GitHub never shows the values again, which is expected.

Then tell me "GitHub secrets are in". I'll push the Worker, the deploy Action will run, and it will create `lori-api`.

## Step 6: Add the Worker's secrets (after the first deploy)

Wait until I say `lori-api` exists.

1. Make the stats password. In Ubuntu (WSL):

   ```bash
   openssl rand -hex 32
   ```

   Copy the output into your password manager as **Lori stats token**. It's shown only in your terminal and isn't saved anywhere else.

2. In the Cloudflare dashboard, go to **Workers & Pages**, select **lori-api**, then **Settings**.
3. Under **Variables and Secrets**, select **Add**.
4. For each of these, set **Type** to **Secret**, type the **Variable name** exactly, and paste the **Value** from your password manager:

   | Variable name | Value |
   |---|---|
   | `OPENAI_API_KEY` | OpenAI lori-api (step 2) |
   | `CHANNEL3_API_KEY` | Channel3 lori-api (step 1) |
   | `STATS_TOKEN` | Lori stats token (this step) |

   Use **Add variable** to add the next one in the same panel.
5. Select **Deploy**.
6. Tell me "Worker secrets are in". I'll check what I can see from here (that `lori-api` is running and its secret names exist, never the values) and run the first real tests.

Future deploys from GitHub keep these secrets, so this is one time.

## After setup

- To see usage, open `/stats` on the Worker with your stats token. I'll give you the exact command when it's live.
- The old `loreal-worker` keeps its own `OPENAI_API_KEY`. You don't need to change it.
- When you're done with the redesign for a while, you can delete the token from step 4 in Cloudflare; deploys simply stop until you make a new one.

## If something leaks

If a key or token ends up somewhere it shouldn't:

1. **Revoke it first**, then make a new one:
   - Channel3 key: delete it in the Channel3 dashboard.
   - OpenAI key: delete it on the OpenAI API keys page.
   - Cloudflare token: **Account API Tokens**, then **Roll** or **Delete**.
   - Stats token: run step 6.1 again.
2. Put the new value in the same place as the old one (step 5 or step 6).
3. If it was committed to Git, removing it in a new commit isn't enough because it stays in history. Revoking it in step 1 is what actually protects you.
