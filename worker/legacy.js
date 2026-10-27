// Reference copy of the old `loreal-worker`, exported from Cloudflare on 2026-10-26.
// Kept only so the new Worker matches its rate limit rules and KV record format.
// Do not deploy this file. No secrets live here: OPENAI_API_KEY comes from Cloudflare.

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const now = Date.now();
    const RATE_LIMIT = 5;
    const WINDOWS_MS = 60 * 1000;
    const TIMEOUT_1_MS = 5 * 60 * 1000;
    const TIMEOUT_2_MS = 60 * 60 * 1000;
    const OFFENSE_RESET_MS = 24 * 60 * 60 * 1000;

    // intitalize new person with vals starting at 0
    let record = await env.RATE_LIMIT_KV.get(ip, {type: 'json'});
    if (!record) {
      record = {count:0, windowStart: now, offenseCount: 0, timeoutUntil: 0, lastOffenseAt: 0};
    }

    // if in timeout rn, block immediately
    if (record.timeoutUntil && now < record.timeoutUntil) {
      const message = record.offenseCount >= 2
        ? "See now you've abused it, now you're timed out for an hour."
        : "SYSTEM: whoa there cowboy, I'm not made of cash, I'm on a college student budget. (5msg/min)"
      return new Response(JSON.stringify({error: 'rate_limited', message}), {
        status: 429,
        headers: corsHeaders
      });
    }

    // Reset the 1-min counting window if it's expired
    if (now - record.windowStart > WINDOWS_MS) {
      record.count = 0;
      record.windowStart = now;
    }

    record.count += 1;

    //timeout if user exceeds limit
    if (record.count > RATE_LIMIT) {
      //resets offense after 24 hours/ago
      if (!record.lastOffenseAt || now - record.lastOffenseAt > OFFENSE_RESET_MS) {
        record.offenseCount = 0;
      }
      record.offenseCount += 1;
      record.lastOffenseAt = now;
      record.timeoutUntil = now + (record.offenseCount >= 2 ? TIMEOUT_2_MS: TIMEOUT_1_MS);
      record.count = 0;

      await env.RATE_LIMIT_KV.put(ip, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 2 });

       const message = record.offenseCount >= 2
        ? "See now you've abused it, now you're timed out for an hour."
        : "SYSTEM: whoa there cowboy, I'm not made of cash, I'm on a college student budget. (5msg/min)"
      return new Response(JSON.stringify({ error: 'rate_limited', message }), {
        status: 429,
        headers: corsHeaders
      });
    }

    // save updated (non-timeout) record
    await env.RATE_LIMIT_KV.put(ip,JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 2});

    // Normal request, forward to openAI
    const apiKey = env.OPENAI_API_KEY; // Make sure to name your secret OPENAI_API_KEY in the Cloudflare Workers dashboard
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const userInput = await request.json();

    const requestBody = {
      model: 'gpt-4o',
      messages: userInput.messages,
      max_completion_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  }
};
