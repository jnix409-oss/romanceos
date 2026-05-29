import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

// Read ANTHROPIC_API_KEY straight from .env.local/.env. We don't rely solely on
// loadEnv() because an empty ANTHROPIC_API_KEY exported in the shell can shadow
// the file value, leaving the proxy without a key.
function readKeyFromFile(dir) {
  for (const f of [".env.local", ".env"]) {
    try {
      const txt = fs.readFileSync(path.join(dir, f), "utf8");
      const m = txt.match(/^\s*ANTHROPIC_API_KEY\s*=\s*(.+?)\s*$/m);
      if (m) {
        let v = m[1].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        if (v) return v;
      }
    } catch {
      /* file may not exist */
    }
  }
  return "";
}

// The app calls Anthropic at /api/anthropic/* (a same-origin path). This dev
// proxy forwards those calls to https://api.anthropic.com and injects the API
// key + version header server-side, so the key is never shipped to the browser.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const KEY =
    (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.trim()) ||
    readKeyFromFile(process.cwd()) ||
    "";

  if (!KEY) {
    console.warn("[vite] No ANTHROPIC_API_KEY found — /api/anthropic calls will 401.");
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        "/api/anthropic": {
          target: "https://api.anthropic.com",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/anthropic/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              // x-proxy-secret is only for our own Netlify function; strip it
              // so it isn't forwarded upstream to Anthropic.
              proxyReq.removeHeader("x-proxy-secret");
              if (KEY) proxyReq.setHeader("x-api-key", KEY);
              proxyReq.setHeader("anthropic-version", "2023-06-01");
            });
          },
        },
      },
    },
  };
});
