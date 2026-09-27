#!/usr/bin/env python3
"""Apply Story OS fixes to the de-minified July build (app.pretty.js -> app.fixed.js)."""
import re, sys

src = open("app.pretty.js", encoding="utf-8").read()
lines = src.split("\n")

# ── 1. Remove duplicate "04 · Heat Level" card block (Spice Level panel is canonical) ──
start = end = None
for i, l in enumerate(lines):
    if '"04 \\xB7 Heat Level"' in l:
        # walk back to the opening jsxs("div"
        j = i
        while '(0, f.jsxs)("div", {' not in lines[j]:
            j -= 1
        start = j
        indent = len(lines[j]) - len(lines[j].lstrip())
        k = i
        while not (lines[k].strip() == "})," and len(lines[k]) - len(lines[k].lstrip()) == indent):
            k += 1
        end = k
        break
assert start and end, "heat block not found"
block = "\n".join(lines[start:end + 1])
assert "h7.map" in block and "Dne" in block, "unexpected heat block"
del lines[start:end + 1]
src = "\n".join(lines)

def sub(old, new, count=1):
    global src
    n = src.count(old)
    if n != count:
        sys.exit(f"expected {count} match(es), found {n}: {old[:80]!r}")
    src = src.replace(old, new)

# Renumber Advanced Story Layers now that section 04 is gone
sub('"05 \\xB7 Advanced Story Layers "', '"04 \\xB7 Advanced Story Layers "')

# Keep the legacy `heat` value in sync with Spice Level so prompts never disagree
sub(
    "    [oe, xe] = (0, Ve.useState)(t.spiceLevel || r.defaultSpiceLevel || 2),\n",
    "    [oe, xe] = (0, Ve.useState)(t.spiceLevel || r.defaultSpiceLevel || 2),\n"
    "    __heatSync = (0, Ve.useEffect)(() => {\n      v(oe);\n    }, [oe]),\n",
)

# ── 2. Contemporary Black Romance missing from default blend (showed "%" and no bar) ──
sub("      healing: 5,\n      community: 0,\n",
    "      contemporary: 0,\n      healing: 5,\n      community: 0,\n")
sub("              healing: 5,\n              community: 0,\n",
    "              contemporary: 0,\n              healing: 5,\n              community: 0,\n")
# Defensive: slider/labels never render undefined
sub("children: [r, \"%\"],", "children: [r || 0, \"%\"],")
sub("        value: t,\n        onChange: (i) => n(+i.target.value),",
    "        value: t || 0,\n        onChange: (i) => n(+i.target.value),")

# ── 3. Market pattern weights: express as shares of the activated patterns (sum = 100) ──
sub(
"""    Object.entries(t)
      .sort((r, n) => n[1] - r[1])
      .slice(0, 3)
      .map(([r, n]) => {
        let i = Ore.find((a) => a.id === r);
        return i ? { ...i, blendWeight: Math.round(n) } : null;
      })
      .filter(Boolean)""",
"""    (() => {
      let top = Object.entries(t)
          .sort((r, n) => n[1] - r[1])
          .slice(0, 3)
          .map(([r, n]) => [Ore.find((a) => a.id === r), n])
          .filter(([r]) => r),
        total = top.reduce((r, [, n]) => r + n, 0) || 1,
        out = top.map(([r, n]) => ({ ...r, blendWeight: Math.round((n / total) * 100) }));
      if (out.length) {
        let drift = 100 - out.reduce((r, n) => r + n.blendWeight, 0);
        out[0].blendWeight += drift;
      }
      return out;
    })()""")
sub('children: [a.blendWeight, "% weight"],', 'children: [a.blendWeight, "% of blend"],')

# ── 4. "Market signal" line duplicated the tagline — show the pattern's market note ──
sub('children: ["Market signal: ", a.promise],',
    'children: ["Market signal: ", a.notes || a.audience || ""],')

# ── 5. Save banner said "SAVED" when nothing had been saved ──
sub(
"""          : e?.backupDue
            ? {""",
"""          : r === "idle"
            ? {
                color: "#8A7F72",
                bg: "#F7F3EC",
                border: "#D9CFC0",
                label: "Not saved yet",
              }
          : e?.backupDue
            ? {""")

# ── 6. Hero/heroine recommendations shouldn't share a profession ──
sub(
"""    Di = r7(t7, an, 5),
    Fa = r7(e7, an, 5),""",
"""    Di = r7(t7, an, 20)
      .filter((Ee) => !(x && __sameRole(Ee, x)))
      .slice(0, 5),
    Fa = r7(e7, an, 30)
      .filter((Ee) => !(p ? [p] : Di).some((qe) => __sameRole(Ee, qe)))
      .slice(0, 5),""")
helper = r'''
var __ROLE_STOP = new Set(["the","a","an","of","and","executive","exec","leader","officer","chief","mogul","king","queen","boss","self","made","self-made","head","senior","director","vp","president","founder","ceo","heir","heiress","owner","her","his"]),
  __ROLE_SYN = { chro: ["hr"], "human": ["hr"], resources: ["hr"], talent: ["hr"], people: ["hr"], hospital: ["healthcare"], medical: ["healthcare"], doctor: ["healthcare"], surgeon: ["healthcare"], nurse: ["healthcare"], realtor: ["real","estate"], attorney: ["law"], lawyer: ["law"], legal: ["law"] };
function __roleTokens(e) {
  let t = String(e?.n || "").toLowerCase().replace(/[^a-z0-9 -]+/g, " ").split(/[\s-]+/).filter(Boolean),
    r = new Set();
  return (
    t.forEach((n) => {
      (__ROLE_SYN[n] || [n]).forEach((i) => {
        __ROLE_STOP.has(i) || i.length < 2 || r.add(i);
      });
    }),
    r
  );
}
function __sameRole(e, t) {
  if (!e || !t) return !1;
  let r = __roleTokens(e);
  for (let n of __roleTokens(t)) if (r.has(n)) return !0;
  return !1;
}
'''
sub("function r7(e, t, r = 5) {", helper + "function r7(e, t, r = 5) {")

# ── 7. Locked sidebar items: readable + explain why they're locked ──
sub("""                            ? "rgba(255,253,247,0.20)"
                            : "rgba(255,253,247,0.68)",""",
    """                            ? "rgba(255,253,247,0.42)"
                            : "rgba(255,253,247,0.68)",""")
sub("                        opacity: s ? 0.5 : 1,\n",
    "                        opacity: 1,\n")
sub("""                      onClick: () => !s && t(A.id),
                      disabled: s,""",
    """                      onClick: () => !s && t(A.id),
                      disabled: s,
                      title: s ? "Unlocks after you generate a story blueprint" : void 0,""")
sub("""                        (0, f.jsx)("span", {
                          style: { flex: 1 },
                          children: A.label,
                        }),""",
    """                        (0, f.jsx)("span", {
                          style: { flex: 1 },
                          children: A.label,
                        }),
                        s &&
                          (0, f.jsx)("span", {
                            style: { fontSize: 10, opacity: 0.7 },
                            "aria-label": "Locked until a blueprint exists",
                            children: "\\u{1F512}",
                          }),""")

# ── 8. Trope counter copy ──
sub("""                                  children: [
                                    "Selected: ",
                                    s.length,
                                    "/4 recommended for marketing",
                                  ],""",
    """                                  children: [
                                    s.length,
                                    " selected \\xB7 2\\u20134 tropes is the sweet spot for marketing",
                                  ],""")

# ── 9. API client: stream responses (avoids function timeouts), clearer errors ──
old_dh_start = src.index("async function dh(e, t, r) {")
old_dh_end = src.index("async function zA(e, t, r) {")
new_dh = r'''async function dh(e, t, r) {
  let n;
  try {
    let A = Pre(),
      o = Ou();
    n = await fetch("/api/anthropic/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Story-OS-Client": "private-studio",
        ...(A ? { "X-Story-OS-Access-Token": A } : {}),
      },
      body: JSON.stringify({
        model: o.model || ml.model,
        max_tokens: r || 1500,
        system: e,
        messages: [{ role: "user", content: t }],
        stream: !0,
      }),
    });
  } catch (A) {
    throw new Error("Network: " + A.message);
  }
  if (n.status === 401)
    throw (
      zre(),
      new Error(
        "Private Story OS access token was missing or incorrect. Use the app password stored as STORY_OS_ACCESS_TOKEN in Netlify, not your Netlify deploy token.",
      )
    );
  if (!n.ok || !n.body) {
    let A = "API error (" + n.status + ")";
    try {
      let o = await n.text();
      try {
        A = JSON.parse(o).error?.message || A;
      } catch {
        o && !/^\s*</.test(o) && (A = o.slice(0, 200));
      }
    } catch {}
    throw new Error(A);
  }
  let i = n.body.getReader(),
    a = new TextDecoder(),
    s = "",
    l = "",
    u = null;
  try {
    for (;;) {
      let { done: A, value: o } = await i.read();
      if (A) break;
      s += a.decode(o, { stream: !0 });
      let v;
      for (; (v = s.indexOf("\n")) !== -1; ) {
        let p = s.slice(0, v).trim();
        if (((s = s.slice(v + 1)), !p.startsWith("data:"))) continue;
        let c = p.slice(5).trim();
        if (!c || c === "[DONE]") continue;
        let x;
        try {
          x = JSON.parse(c);
        } catch {
          continue;
        }
        x.type === "content_block_delta" && x.delta?.type === "text_delta"
          ? (l += x.delta.text)
          : x.type === "error" && (u = x.error?.message || "API stream error");
      }
    }
  } catch (A) {
    throw new Error("Network: " + A.message);
  }
  if (u) throw new Error(u);
  let A = l.replace(/```json|```/g, "").trim();
  if (!A) throw new Error("Empty response");
  return A;
}
'''
src = src[:old_dh_start] + new_dh + src[old_dh_end:]

open("app.fixed.js", "w", encoding="utf-8").write(src)
print("patched OK")
