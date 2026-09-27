// Story OS → Anthropic proxy.
// The browser calls /api/anthropic/v1/messages (routed here by netlify.toml).
// This function checks the private app password, then forwards the request to
// Anthropic with the API key, which never leaves Netlify.
//
// Netlify environment variables (Project configuration → Environment variables):
//   ANTHROPIC_API_KEY      Anthropic key (sk-ant-...). Functions scope.
//   STORY_OS_ACCESS_TOKEN  The app password you type into Story OS. Functions scope.
import { timingSafeEqual } from "node:crypto";

const MAX_TOKENS_CAP = 16000;
const RATE_LIMIT = 60; // requests per IP per 10 minutes (per warm instance)
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: { message: "Method not allowed" } }, 405);
  }

  const key = process.env.ANTHROPIC_API_KEY;
  const expected = process.env.STORY_OS_ACCESS_TOKEN;
  if (!key) return json({ error: { message: "Server is missing ANTHROPIC_API_KEY." } }, 500);
  if (!expected) return json({ error: { message: "Server is missing STORY_OS_ACCESS_TOKEN." } }, 500);

  const provided = request.headers.get("x-story-os-access-token") || "";
  if (!safeEqual(provided.trim(), expected.trim())) {
    return json({ error: { message: "Private access token required" } }, 401);
  }

  const ip = request.headers.get("x-nf-client-connection-ip") || "unknown";
  if (!allow(ip)) {
    return json({ error: { message: "Too many requests. Wait a few minutes and try again." } }, 429);
  }

  let body;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return json({ error: { message: "Invalid JSON body." } }, 400);
  }
  if (typeof body.model !== "string" || !body.model.startsWith("claude-")) {
    return json({ error: { message: "Invalid model." } }, 400);
  }
  body.max_tokens = Math.min(Number(body.max_tokens) || 1500, MAX_TOKENS_CAP);

  // Sonnet 5+ think by default, and thinking counts against max_tokens — with the
  // app's 1.5k–4.5k budgets that can leave zero tokens for the actual text
  // ("Empty response"), and it eats into Netlify's 60s streaming limit. The app
  // wants direct prose/JSON, so turn thinking off unless the caller set it.
  const wantsDefaultThinking = body.thinking === undefined;
  const firstBody = wantsDefaultThinking ? { ...body, thinking: { type: "disabled" } } : body;

  let resp;
  try {
    resp = await callAnthropic(key, firstBody);
    // If a model rejects `thinking: disabled`, retry without it but with more room.
    if (wantsDefaultThinking && resp.status === 400) {
      const errText = await resp.clone().text();
      if (/thinking/i.test(errText)) {
        resp = await callAnthropic(key, {
          ...body,
          max_tokens: Math.min(body.max_tokens * 3, MAX_TOKENS_CAP),
        });
      }
    }
  } catch (e) {
    return json({ error: { message: "Upstream request failed: " + e.message } }, 502);
  }

  // A rejected Anthropic key must not look like a wrong app password (the app
  // treats 401 as "re-enter your password"), so report it as an upstream error.
  if (resp.status === 401 || resp.status === 403) {
    return json({ error: { message: "Anthropic rejected the API key. Check ANTHROPIC_API_KEY in Netlify." } }, 502);
  }

  // Stream straight through so long generations keep bytes flowing and don't time out.
  return new Response(resp.body, {
    status: resp.status,
    headers: {
      "content-type": resp.headers.get("content-type") || "application/json",
      "cache-control": "no-cache",
    },
  });
};

function callAnthropic(key, body) {
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
}

function safeEqual(a, b) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function allow(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length <= RATE_LIMIT;
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
