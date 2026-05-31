import { MODEL_CONFIG } from "./modelConfig";

// Streaming Anthropic proxy client. apiCall returns reassembled text; apiCallJSON
// parses the first JSON object out of it.

// ── API ───────────────────────────────────────────────────────
export async function apiCall(sys, user, maxTokens, model) {
  // Streamed request. Long generations (e.g. the chapter outline) take ~30s,
  // which exceeds the proxy/gateway inactivity timeout for a buffered response.
  // Streaming keeps bytes flowing so the connection stays alive, and we
  // reassemble the text deltas into the same string the callers expect.
  let res;
  try {
    res = await fetch("/api/anthropic/v1/messages", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-proxy-secret": import.meta.env.VITE_PROXY_SECRET || "",
      },
      body:JSON.stringify({
        model: model || MODEL_CONFIG.prose,
        max_tokens: maxTokens||1500,
        system:sys,
        messages:[{role:"user",content:user}],
        stream:true
      })
    });
  } catch(e) { throw new Error("Network: "+e.message); }

  // Non-streaming error responses (auth, rate limit, bad request) come back as
  // JSON with a non-2xx status — surface their message.
  if (!res.ok || !res.body) {
    let msg = "API error ("+res.status+")";
    try {
      const t = await res.text();
      try { msg = (JSON.parse(t).error?.message) || msg; } catch { if (t) msg = t.slice(0,200); }
    } catch {}
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", text = "", apiError = null;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream:true });
      let nl;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        let evt;
        try { evt = JSON.parse(payload); } catch { continue; }
        if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
          text += evt.delta.text;
        } else if (evt.type === "error") {
          apiError = evt.error?.message || "API stream error";
        }
      }
    }
  } catch(e) { throw new Error("Network: "+e.message); }

  if (apiError) throw new Error(apiError);
  const raw = text.replace(/```json|```/g,"").trim();
  if (!raw) throw new Error("Empty response");
  return raw;
}

export async function apiCallJSON(sys, user, maxTokens, model) {
  const raw = await apiCall(sys, user, maxTokens, model);
  const s = raw.indexOf("{");
  const e = raw.lastIndexOf("}");
  if (s===-1||e===-1) throw new Error("No JSON. Got: "+raw.slice(0,100));
  try {
    return JSON.parse(raw.slice(s,e+1));
  } catch(pe) {
    throw new Error("Bad JSON: "+raw.slice(s,s+120));
  }
}
