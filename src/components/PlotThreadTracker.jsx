import { useState } from "react";
import { C } from "../constants/theme";

// Plot Thread Tracker — surfaces mysteries/secrets/subplots/manual threads and
// flags dormant ones. Shared between the Story Bible viewer and Editor Mode.
export default function PlotThreadTracker({ bible, currentChapterCount, onAddManualThread }) {
  const [newThread, setNewThread] = useState("");
  const [adding, setAdding] = useState(false);

  if (!bible) return null;

  const threads = [
    ...(bible.plot?.mysteries || []).map(m => ({ name: m.name, type:"Mystery", status: m.status || "open" })),
    ...(bible.plot?.secrets || []).filter(s => !s.revealedIn).map(s => ({ name: s.owner + ": " + s.secret, type:"Secret", status:"open" })),
    ...(bible.plot?.subplots || []).map(s => ({ name: typeof s === "string" ? s : s.name || s, type:"Subplot", status:"open" })),
    ...(bible.plot?.manualThreads || []).map(t => ({ name: t.name, type:"Manual", status: t.status || "open" })),
  ];

  const chapterEntries = bible.chapters || [];
  threads.forEach(thread => {
    let lastSeen = 0;
    chapterEntries.forEach(ch => {
      const allText = [ ...(ch.unresolvedThreads || []), ...(ch.majorEvents || []) ].join(" ").toLowerCase();
      if (allText.includes(thread.name.toLowerCase().slice(0, 15))) {
        lastSeen = Math.max(lastSeen, ch.number || 0);
      }
    });
    thread.lastActiveChapter = lastSeen;
    const chaptersSince = currentChapterCount - lastSeen;
    thread.dormant = (thread.status !== "resolved" && lastSeen > 0 && chaptersSince >= 3);
  });

  const TYPE_COLORS = { Mystery: "#4888C8", Secret: "#9F7AEA", Subplot: "#2D8B7A", Manual: "#B8841C" };
  const STATUS_COLORS = { open: "#D88830", closing: "#2D8B7A", resolved: "#6B665E", issue: "#B8342D" };

  return (
    <div style={{ marginTop:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ color:C.gold, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", fontWeight:700 }}>
          🧵 Plot Thread Tracker · {threads.length} threads
        </div>
        <button onClick={() => setAdding(!adding)}
          style={{ padding:"3px 10px", background:"transparent", color:C.amber, border:"1px solid "+C.amber, borderRadius:4, fontSize:10, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
          + Add Thread
        </button>
      </div>

      {adding && (
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <input value={newThread} onChange={e => setNewThread(e.target.value)}
            placeholder="Thread name or description..."
            style={{ flex:1, padding:"6px 10px", background:C.card, color:C.text, border:"1px solid "+C.border, borderRadius:6, fontSize:12, fontFamily:"Nunito, sans-serif" }}/>
          <button onClick={() => { if (!newThread.trim()) return; onAddManualThread && onAddManualThread(newThread.trim()); setNewThread(""); setAdding(false); }}
            style={{ padding:"6px 12px", background:C.gold, color:C.bg, border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Nunito, sans-serif" }}>
            Add
          </button>
        </div>
      )}

      <div style={{ display:"grid", gap:6 }}>
        {threads.length === 0 && (
          <div style={{ color:C.muted, fontSize:12, fontStyle:"italic", padding:"10px 0" }}>
            No plot threads detected yet. Initialize the Story Bible to auto-populate.
          </div>
        )}
        {threads.map((t, i) => (
          <div key={i} style={{ padding:"8px 12px", background:C.bg, border:"1px solid " + (t.dormant ? "#B8342D" : C.borderLight), borderRadius:6, borderLeft: "3px solid " + TYPE_COLORS[t.type] }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:6 }}>
              <span style={{ color:C.text, fontSize:12, fontWeight:600, flex:1, minWidth:120 }}>{t.name}</span>
              <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
                <span style={{ padding:"1px 6px", background:TYPE_COLORS[t.type]+"22", border:"1px solid "+TYPE_COLORS[t.type], borderRadius:8, fontSize:9, color:TYPE_COLORS[t.type], fontWeight:700 }}>{t.type}</span>
                <span style={{ padding:"1px 6px", background:STATUS_COLORS[t.status]+"22", border:"1px solid "+STATUS_COLORS[t.status], borderRadius:8, fontSize:9, color:STATUS_COLORS[t.status], fontWeight:700, textTransform:"uppercase" }}>{t.status}</span>
                {t.lastActiveChapter > 0 && (<span style={{ color:C.muted, fontSize:10 }}>Ch {t.lastActiveChapter}</span>)}
                {t.dormant && (<span style={{ color:"#B8342D", fontSize:10, fontWeight:700 }}>⚠ Dormant</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
