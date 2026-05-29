// Production counterpart to the Vite dev proxy. The client posts to
// /api/anthropic/v1/messages; netlify.toml redirects that to this function,
// which injects the API key + version header server-side and forwards to
// Anthropic. The key lives in Netlify's environment variables, never in the
// client bundle.
export default async (request) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return json({ error: { message: "Server is missing the ANTHROPIC_API_KEY environment variable." } }, 500);
  }

  // Shared-secret guard. The client sends x-proxy-secret (VITE_PROXY_SECRET,
  // baked into the build); the function compares it against the server-side
  // ANTHROPIC_PROXY_SECRET. NOTE: a build-baked secret is publicly readable in
  // the client bundle, so this only blocks naive direct calls — it is not a
  // substitute for real authentication.
  const expected = process.env.ANTHROPIC_PROXY_SECRET;
  if (!expected) {
    return json({ error: { message: "Server is missing the ANTHROPIC_PROXY_SECRET environment variable." } }, 500);
  }
  const provided = request.headers.get("x-proxy-secret") || "";
  if (provided !== expected) {
    return json({ error: { message: "Forbidden: invalid or missing proxy secret." } }, 403);
  }

  const url = new URL(request.url);
  const subpath =
    url.pathname
      .replace(/^\/api\/anthropic/, "")
      .replace(/^\/\.netlify\/functions\/anthropic/, "") || "/v1/messages";
  const target = "https://api.anthropic.com" + subpath + url.search;

  const init = {
    method: request.method,
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  let resp;
  try {
    resp = await fetch(target, init);
  } catch (e) {
    return json({ error: { message: "Upstream request failed: " + e.message } }, 502);
  }

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { "content-type": resp.headers.get("content-type") || "application/json" },
  });
};

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
}
