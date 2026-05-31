import { useState, useEffect, useCallback } from "react";
import { C } from "../constants/theme";
import {
  generateSceneCards, writeScene, continueScene, summarizeScene,
  writeScenesInBatch, generateContinuityReport, mergeBibleUpdates,
} from "../utils/storyGeneration";
import {
  DEFAULT_INTENSITY, DEFAULT_EROTIC, DEFAULT_STREETLIT, DEFAULT_SUSPENSE,
} from "../data/storyData";

const FAST_DRAFT_MODELS = [
  { id: "claude-sonnet-4-6",  label: "Sonnet 4.6", badge: "Faster · Cheaper", note: "~35s per batch" },
  { id: "claude-opus-4-8",    label: "Opus 4.8",   badge: "Recommended",      note: "~60-90s · Best quality" },
];

// ─── NavigatorPanel ──────────────────────────────────────────────────────────

function NavigatorPanel({
  outline, chapterSceneCards, sceneProse, sceneLocked,
  chapterProse, chapterReports,
  activeChapter, activeScene, expandedChapters,
  generatingScenesCh, bible,
  onSelectChapter, onSelectScene, onToggleChapter, onGenerateSceneCards,
}) {
  const chapters = outline?.chapters || [];

  return (
    <div style={{
      width: 240, flexShrink: 0, overflowY: "auto",
      borderRight: "1px solid " + C.borderLight, background: C.surface,
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid " + C.borderLight }}>
        <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>
          Chapters
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {chapters.map((ch) => {
          const scenes = chapterSceneCards[ch.number] || [];
          const proseMap = sceneProse[ch.number] || {};
          const hasScenes = scenes.length > 0;
          const writtenScenes = scenes.filter(s => proseMap[s.sceneNumber]).length;
          const allDone = hasScenes && writtenScenes === scenes.length;
          const report = chapterReports[ch.number];
          const isActive = activeChapter === ch.number;
          const isExpanded = expandedChapters[ch.number];

          const reportColor = report
            ? (report.status === "PASS" ? C.teal : report.status === "WARNING" ? C.warn : C.err)
            : null;

          return (
            <div key={ch.number}>
              {/* Chapter row */}
              <div
                onClick={() => { onSelectChapter(ch.number); onToggleChapter(ch.number); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", cursor: "pointer",
                  background: isActive ? C.goldDim : "transparent",
                  borderLeft: isActive ? "2px solid " + C.gold : "2px solid transparent",
                  transition: "background 0.1s",
                }}>
                <span style={{ color: C.muted, fontSize: 9, width: 10, flexShrink: 0 }}>
                  {isExpanded ? "▼" : "▶"}
                </span>
                <span style={{ color: C.gold, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                  {ch.number}
                </span>
                <span style={{
                  color: isActive ? C.text : C.muted, fontSize: 11,
                  flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {ch.title}
                </span>
                {reportColor && (
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: reportColor, flexShrink: 0 }}/>
                )}
                {hasScenes && (
                  <span style={{ color: allDone ? C.teal : C.muted, fontSize: 9, flexShrink: 0 }}>
                    {writtenScenes}/{scenes.length}
                  </span>
                )}
              </div>

              {/* Scene rows when expanded */}
              {isExpanded && (
                <div style={{ paddingLeft: 24, paddingBottom: 4 }}>
                  {!hasScenes ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); onGenerateSceneCards(ch.number); }}
                      disabled={generatingScenesCh === ch.number || !bible}
                      style={{
                        margin: "4px 0 4px 2px", padding: "4px 10px",
                        background: bible ? C.glow : C.faint,
                        border: "1px solid " + (bible ? C.gold : C.borderLight),
                        borderRadius: 5, color: bible ? C.gold : C.muted,
                        fontSize: 9, cursor: bible ? "pointer" : "not-allowed",
                        fontFamily: "Nunito, sans-serif", fontWeight: 600,
                      }}>
                      {generatingScenesCh === ch.number ? "Generating..." : "+ Scene Cards"}
                    </button>
                  ) : (
                    scenes.map((scene) => {
                      const prose = proseMap[scene.sceneNumber];
                      const locked = !!sceneLocked[ch.number + "-" + scene.sceneNumber];
                      const isActiveScene = isActive && activeScene === scene.sceneNumber;
                      const icon = locked ? "🔒" : prose ? "✓" : "○";
                      const iconColor = locked ? C.muted : prose ? C.teal : C.muted;

                      return (
                        <div
                          key={scene.sceneNumber}
                          onClick={(e) => { e.stopPropagation(); onSelectScene(ch.number, scene.sceneNumber); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "5px 8px 5px 0", cursor: "pointer",
                            background: isActiveScene ? C.goldDim : "transparent",
                            borderLeft: isActiveScene ? "2px solid " + C.amber : "2px solid transparent",
                            borderRadius: "0 4px 4px 0", marginBottom: 1,
                          }}>
                          <span style={{ color: iconColor, fontSize: 9, width: 12, textAlign: "center" }}>{icon}</span>
                          <span style={{ color: C.amber, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                            S{scene.sceneNumber}
                          </span>
                          <span style={{
                            color: isActiveScene ? C.text : C.muted, fontSize: 10,
                            flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {scene.sceneTitle || scene.scenePurpose || "Scene " + scene.sceneNumber}
                          </span>
                        </div>
                      );
                    })
                  )}
                  {allDone && !chapterReports[ch.number] && (
                    <div style={{
                      padding: "5px 8px", color: C.teal, fontSize: 9,
                      fontWeight: 700, letterSpacing: 0.5,
                    }}>
                      ✓ All scenes written
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── StoryMemoryPanel ─────────────────────────────────────────────────────────

const MEMORY_TABS = ["characters", "threads", "arc", "summary"];

function StoryMemoryPanel({ bible, story, outline, chapterSummaries, activeChapter, storyHealthReport, memoryTab, onTabChange }) {
  const characters = bible?.characters || [];
  const threads = [
    ...(bible?.plot?.activeThreads || []),
    ...(bible?.plot?.mysteries || []),
    ...(bible?.plot?.manualThreads?.map(t => t.name || t) || []),
  ].filter(Boolean);
  const arc = story?.relationshipArc || [];
  const summaryEntries = Object.entries(chapterSummaries || {})
    .filter(([, s]) => s && s.summary)
    .sort(([a], [b]) => Number(b) - Number(a))
    .slice(0, 3);

  const scoreColor = (s) => s >= 8 ? C.teal : s >= 6 ? C.gold : C.amber;

  return (
    <div style={{
      width: 280, flexShrink: 0, overflowY: "auto",
      borderLeft: "1px solid " + C.borderLight, background: C.surface,
    }}>
      {/* Header */}
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid " + C.borderLight }}>
        <div style={{ color: C.gold, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>
          Story Memory
        </div>
        <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>Quick reference while writing</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "8px 10px", borderBottom: "1px solid " + C.borderLight, flexWrap: "wrap" }}>
        {MEMORY_TABS.map(t => (
          <button key={t} onClick={() => onTabChange(t)}
            style={{
              padding: "3px 10px", borderRadius: 10, border: "none", cursor: "pointer",
              background: memoryTab === t ? C.goldDim : "transparent",
              color: memoryTab === t ? C.gold : C.muted,
              fontSize: 10, fontWeight: memoryTab === t ? 700 : 400,
              textTransform: "capitalize", fontFamily: "Nunito, sans-serif",
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ padding: "14px 14px 24px" }}>
        {/* CHARACTERS */}
        {memoryTab === "characters" && (
          <div>
            {!bible && <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic" }}>Build your Story Bible to see characters here.</div>}
            {characters.map((c, i) => {
              const auditEntry = storyHealthReport?.characterAudit?.find(a => a.name === c.name);
              return (
                <div key={i} style={{
                  padding: "9px 11px", marginBottom: 7, background: C.card,
                  border: "1px solid " + C.borderLight, borderRadius: 8,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                    <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{c.name}</span>
                    <span style={{ color: C.muted, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      {c.role || c.archetype}
                    </span>
                  </div>
                  {c.wound && (
                    <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic", lineHeight: 1.4, marginTop: 2 }}>
                      "{c.wound}"
                    </div>
                  )}
                  {auditEntry?.developmentScore != null && (
                    <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: C.borderLight, overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: (auditEntry.developmentScore / 10 * 100) + "%",
                        background: scoreColor(auditEntry.developmentScore), borderRadius: 2,
                      }}/>
                    </div>
                  )}
                </div>
              );
            })}
            {characters.length === 0 && bible && (
              <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic" }}>No characters in bible yet.</div>
            )}
          </div>
        )}

        {/* THREADS */}
        {memoryTab === "threads" && (
          <div>
            {!bible && <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic" }}>Build your Story Bible to see active threads.</div>}
            {threads.length === 0 && bible && (
              <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic" }}>No active threads found in bible.</div>
            )}
            {threads.map((thread, i) => (
              <div key={i} style={{
                padding: "7px 10px", marginBottom: 5, background: C.card,
                border: "1px solid " + C.borderLight, borderRadius: 6,
                fontSize: 12, color: C.text, lineHeight: 1.4,
              }}>
                {typeof thread === "string" ? thread : thread.name || JSON.stringify(thread)}
              </div>
            ))}
          </div>
        )}

        {/* ARC */}
        {memoryTab === "arc" && (
          <div>
            {arc.length > 0 ? (
              <>
                <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
                  {arc.map((_, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 10,
                        background: i === 2 ? C.gold : C.borderLight,
                        border: "2px solid " + (i === 2 ? C.gold : C.borderLight),
                      }}/>
                      <span style={{ color: C.muted, fontSize: 8 }}>{i + 1}</span>
                    </div>
                  ))}
                </div>
                {arc.map((stage, i) => (
                  <div key={i} style={{
                    padding: "6px 10px", marginBottom: 5, background: C.card,
                    border: "1px solid " + C.borderLight, borderRadius: 6,
                    fontSize: 11, color: C.text,
                  }}>
                    <span style={{ color: C.amber, fontWeight: 700, marginRight: 6 }}>Stage {i + 1}</span>
                    {stage}
                  </div>
                ))}
              </>
            ) : (
              <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic" }}>
                {bible ? "No relationship arc data in bible." : "Build your Story Bible to see arc stages."}
              </div>
            )}
            {story?.spiceLevel != null && (
              <div style={{ marginTop: 12, color: C.muted, fontSize: 11 }}>
                Heat: {"🌶".repeat(Math.min(story.spiceLevel, 5))} · Spice {story.spiceLevel}
              </div>
            )}
          </div>
        )}

        {/* SUMMARY */}
        {memoryTab === "summary" && (
          <div>
            {summaryEntries.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 11, fontStyle: "italic" }}>Complete chapters to see summaries here.</div>
            ) : (
              summaryEntries.map(([chNum, s]) => (
                <div key={chNum} style={{
                  padding: "10px 12px", marginBottom: 10, background: C.card,
                  border: "1px solid " + C.borderLight, borderRadius: 8,
                }}>
                  <div style={{ color: C.amber, fontWeight: 700, fontSize: 11, marginBottom: 5 }}>
                    Chapter {chNum}
                  </div>
                  <div style={{ color: C.text, fontSize: 11, lineHeight: 1.6, marginBottom: 6 }}>
                    {s.summary?.slice(0, 180)}{s.summary?.length > 180 ? "…" : ""}
                  </div>
                  {s.openThreads?.length > 0 && (
                    <div style={{ color: C.amber, fontSize: 10 }}>
                      Open: {s.openThreads.slice(0, 2).join(" · ")}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SceneCenterPanel ─────────────────────────────────────────────────────────

function SceneCenterPanel({
  activeChapter, activeScene, outline, story, bible,
  chapterSceneCards, sceneProse, sceneSummaries, sceneLocked,
  chapterProse, chapterReports, checkingCh,
  editingScene, setEditingScene,
  writingScene, continuingScene, summarizingScene, generatingScenesCh,
  directorOpen, setDirectorOpen,
  sandboxInstruction, setSandboxInstruction,
  fromEditorMode, setFromEditorMode,
  pendingSceneDirectorIssue,
  onGoToEditorMode,
  onWrite, onContinue, onEdit, onSaveEdit, onCancelEdit, onRegen,
  onLock, onSummarize, onGenerateSceneCards, onCompleteChapter,
  renderReport, renderVersionHistory,
}) {
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [editBuffer, setEditBuffer] = useState("");

  const ch = outline?.chapters?.find(c => c.number === activeChapter);
  const scenes = chapterSceneCards[activeChapter] || [];
  const proseMap = sceneProse[activeChapter] || {};
  const scene = scenes.find(s => s.sceneNumber === activeScene);
  const prose = proseMap[activeScene];
  const locked = !!sceneLocked[activeChapter + "-" + activeScene];
  const isWriting = writingScene?.ch === activeChapter && writingScene?.sc === activeScene;
  const isContinuing = continuingScene?.ch === activeChapter && continuingScene?.sc === activeScene;
  const isSummarizing = summarizingScene?.ch === activeChapter && summarizingScene?.sc === activeScene;
  const isEditing = editingScene?.ch === activeChapter && editingScene?.sc === activeScene;
  const allScenesComplete = scenes.length > 0 && scenes.every(s => proseMap[s.sceneNumber]);
  const wordCount = prose ? prose.trim().split(/\s+/).filter(Boolean).length : 0;
  const directorIsOpen = directorOpen?.chapterNum === activeChapter && directorOpen?.sceneNum === activeScene;

  useEffect(() => {
    if (isEditing) setEditBuffer(prose || "");
  }, [isEditing, prose]);

  if (!activeChapter || !ch) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
        <div style={{ color: C.muted, fontFamily: "Cormorant Garamond, serif", fontSize: 22 }}>Select a chapter to begin</div>
        <div style={{ color: C.muted, fontSize: 12 }}>Choose a chapter from the navigator</div>
      </div>
    );
  }

  return (
    <div>
      {/* Chapter header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ color: C.gold, fontFamily: "Cormorant Garamond, serif", fontSize: 24, fontWeight: 700 }}>
            Ch. {ch.number}
          </span>
          <span style={{ color: C.text, fontFamily: "Cormorant Garamond, serif", fontSize: 22, fontWeight: 600 }}>
            {ch.title}
          </span>
          {chapterProse[activeChapter] && (
            <span style={{ color: C.muted, fontSize: 11, marginLeft: "auto" }}>
              {Object.values(proseMap).filter(Boolean).reduce((s, p) => s + p.trim().split(/\s+/).filter(Boolean).length, 0).toLocaleString()} words
            </span>
          )}
        </div>
        <div style={{ color: C.muted, fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{ch.beat}</div>
      </div>

      {/* No scene cards yet */}
      {scenes.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <button onClick={() => onGenerateSceneCards(activeChapter)} disabled={generatingScenesCh === activeChapter || !bible}
            style={{
              padding: "12px 24px", background: bible ? C.gold : C.faint, color: bible ? C.bg : C.muted,
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14,
              cursor: bible ? "pointer" : "not-allowed", fontFamily: "Nunito, sans-serif",
            }}>
            {generatingScenesCh === activeChapter ? "Architecting scenes…" : "🎬 Generate Scene Cards"}
          </button>
          {!bible && <div style={{ color: C.muted, fontSize: 11, marginTop: 10 }}>Initialize the Story Bible first</div>}
        </div>
      )}

      {/* Scene selected */}
      {scene && (
        <div>
          {/* Collapsible scene metadata */}
          <div
            onClick={() => setInfoExpanded(v => !v)}
            style={{
              padding: "10px 14px", background: C.card, border: "1px solid " + C.borderLight,
              borderRadius: 8, marginBottom: 16, cursor: "pointer",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: C.amber, fontWeight: 700, fontSize: 11 }}>Scene {scene.sceneNumber}</span>
              <span style={{ color: C.text, fontSize: 11, fontStyle: "italic", flex: 1 }}>
                {infoExpanded ? scene.sceneTitle : (scene.scenePurpose || scene.sceneTitle || "")}
              </span>
              <span style={{ color: C.muted, fontSize: 10 }}>{infoExpanded ? "▲" : "▼"}</span>
            </div>
            {infoExpanded && (
              <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 6, fontSize: 11 }}>
                {scene.scenePurpose && <div><span style={{ color: C.amber, fontWeight: 600 }}>Purpose: </span>{scene.scenePurpose}</div>}
                {scene.location && <div><span style={{ color: C.amber, fontWeight: 600 }}>Where: </span>{scene.location}</div>}
                {scene.characterGoal && <div><span style={{ color: C.amber, fontWeight: 600 }}>Goal: </span>{scene.characterGoal}</div>}
                {scene.conflictType && <div><span style={{ color: C.amber, fontWeight: 600 }}>Conflict: </span>{scene.conflictType}</div>}
                {scene.emotionalBeat && <div><span style={{ color: C.amber, fontWeight: 600 }}>Emotional: </span>{scene.emotionalBeat}</div>}
                {scene.romanceBeat && <div><span style={{ color: C.amber, fontWeight: 600 }}>Romance: </span>{scene.romanceBeat}</div>}
                {scene.targetWordCount && <div><span style={{ color: C.amber, fontWeight: 600 }}>Target: </span>{scene.targetWordCount.toLocaleString()} words</div>}
              </div>
            )}
          </div>

          {/* Prose area */}
          {!prose && !isWriting && (
            <div style={{ textAlign: "center", padding: "28px 0 20px" }}>
              <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic", marginBottom: 16 }}>
                {scene.scenePurpose || "Ready to write this scene"}
              </div>
              <button onClick={() => onWrite(activeChapter, activeScene)} disabled={!bible}
                style={{
                  padding: "12px 28px", background: bible ? C.gold : C.faint, color: bible ? C.bg : C.muted,
                  border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14,
                  cursor: bible ? "pointer" : "not-allowed", fontFamily: "Nunito, sans-serif",
                }}>
                ✦ Write Scene
              </button>
            </div>
          )}

          {isWriting && (
            <div style={{ textAlign: "center", padding: "28px 0", color: C.amber, fontSize: 13, fontStyle: "italic" }}>
              Writing scene…
            </div>
          )}

          {prose && !isEditing && (
            <div style={{
              fontFamily: "Cormorant Garamond, serif", fontSize: 16, lineHeight: 1.85,
              color: C.text, background: C.manuscript, border: "1px solid " + C.manuscriptBorder,
              borderRadius: 10, padding: "28px 32px", marginBottom: 14, whiteSpace: "pre-wrap",
            }}>
              {prose}
            </div>
          )}

          {/* Edit mode */}
          {isEditing && (
            <div style={{ marginBottom: 14 }}>
              <textarea
                value={editBuffer}
                onChange={e => setEditBuffer(e.target.value)}
                style={{
                  width: "100%", minHeight: 320, background: C.manuscript,
                  border: "1px solid " + C.gold, borderRadius: 8, padding: "20px 24px",
                  fontFamily: "Cormorant Garamond, serif", fontSize: 15, lineHeight: 1.8,
                  color: C.text, resize: "vertical", boxSizing: "border-box",
                }}/>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={() => onSaveEdit(activeChapter, activeScene, editBuffer)}
                  style={{ padding: "7px 16px", background: C.gold, color: C.bg, border: "none", borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  Save
                </button>
                <button onClick={() => onCancelEdit()}
                  style={{ padding: "7px 16px", background: "transparent", color: C.muted, border: "1px solid " + C.borderLight, borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Word count bar */}
          {prose && (
            <div style={{ marginBottom: 10, fontSize: 11, color: C.muted }}>
              {wordCount.toLocaleString()} / {(scene.targetWordCount || 900).toLocaleString()} words
              <div style={{ height: 2, background: C.borderLight, borderRadius: 1, marginTop: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 1, transition: "width 0.4s",
                  background: wordCount >= (scene.targetWordCount || 900) * 0.9 ? C.teal : C.amber,
                  width: Math.min(100, wordCount / (scene.targetWordCount || 900) * 100) + "%",
                }}/>
              </div>
            </div>
          )}

          {/* Action row */}
          {(prose || !isWriting) && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
              {prose && !isEditing && (
                <>
                  <ActionBtn onClick={() => { setEditingScene({ ch: activeChapter, sc: activeScene }); }}>✏️ Edit</ActionBtn>
                  <ActionBtn onClick={() => onRegen(activeChapter, activeScene)}>↻ Regen</ActionBtn>
                  <ActionBtn onClick={() => onContinue(activeChapter, activeScene)} disabled={isContinuing}>
                    {isContinuing ? "Continuing…" : "→ Continue"}
                  </ActionBtn>
                </>
              )}
              <ActionBtn
                active={directorIsOpen}
                onClick={() => {
                  if (directorIsOpen) { setDirectorOpen(null); setSandboxInstruction(""); setFromEditorMode(false); }
                  else setDirectorOpen({ chapterNum: activeChapter, sceneNum: activeScene });
                }}>
                ⚡ Director
              </ActionBtn>
              {prose && (
                <>
                  <ActionBtn onClick={() => onSummarize(activeChapter, activeScene)} disabled={isSummarizing}>
                    {isSummarizing ? "Summarizing…" : "∑ Summary"}
                  </ActionBtn>
                  <ActionBtn onClick={() => onLock(activeChapter, activeScene)}>
                    {locked ? "🔓 Unlock" : "🔒 Lock"}
                  </ActionBtn>
                </>
              )}
            </div>
          )}

          {/* Scene Director panel */}
          {directorIsOpen && (
            <div style={{
              marginBottom: 16, padding: "16px 18px", background: C.surface,
              border: "1px solid " + C.gold, borderRadius: 10,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ color: C.gold, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>Scene Director</div>
                  <div style={{ color: C.text, fontSize: 12, fontWeight: 600, marginTop: 2 }}>Ch. {activeChapter} · Scene {activeScene} · Sandbox</div>
                </div>
                <button onClick={() => { setDirectorOpen(null); setFromEditorMode(false); setSandboxInstruction(""); }}
                  style={{ background: "transparent", border: "1px solid " + C.borderLight, borderRadius: 5, color: C.muted, fontSize: 11, cursor: "pointer", padding: "3px 8px", fontFamily: "Nunito, sans-serif" }}>
                  × Close
                </button>
              </div>
              {fromEditorMode && !pendingSceneDirectorIssue && (
                <div style={{
                  padding: "8px 12px", background: "rgba(200,148,31,0.10)", border: "1px solid " + C.amber,
                  borderRadius: 8, marginBottom: 12, fontSize: 11, color: C.amber,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>⚠ Editing from Editor Mode · Ch {activeChapter}</span>
                  <button onClick={() => setFromEditorMode(false)} style={{ background: "transparent", border: "none", color: C.amber, cursor: "pointer", fontSize: 14 }}>×</button>
                </div>
              )}
              <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>Sandbox · Revision Instruction</div>
              <textarea
                value={sandboxInstruction}
                onChange={e => setSandboxInstruction(e.target.value)}
                placeholder="Describe what needs to change in this scene…"
                rows={4}
                style={{
                  width: "100%", background: C.bg, border: "1px solid " + C.borderLight, borderRadius: 6,
                  color: C.text, fontSize: 12, padding: "10px 12px", fontFamily: "Nunito, sans-serif",
                  resize: "vertical", lineHeight: 1.6, boxSizing: "border-box",
                }}/>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={() => { navigator.clipboard?.writeText(sandboxInstruction).catch(() => {}); setEditingScene({ ch: activeChapter, sc: activeScene }); }}
                  disabled={!sandboxInstruction.trim()}
                  style={{
                    padding: "7px 14px", background: sandboxInstruction.trim() ? C.gold : C.faint,
                    color: sandboxInstruction.trim() ? C.bg : C.muted,
                    border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11,
                    cursor: sandboxInstruction.trim() ? "pointer" : "not-allowed", fontFamily: "Nunito, sans-serif",
                  }}>
                  ✎ Open Scene Editor
                </button>
                {fromEditorMode && onGoToEditorMode && (
                  <button onClick={onGoToEditorMode}
                    style={{ padding: "7px 14px", background: "transparent", border: "1px solid " + C.amber, borderRadius: 6, color: C.amber, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                    ← Back to Editor Mode
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Continuity report */}
          {chapterReports[activeChapter] && renderReport && renderReport({ chapterNum: activeChapter })}

          {/* Summary */}
          {sceneSummaries[activeChapter]?.[activeScene] && (
            <div style={{ padding: "10px 14px", background: C.card, border: "1px solid " + C.borderLight, borderRadius: 8, marginBottom: 14, fontSize: 11, color: C.muted }}>
              <span style={{ color: C.amber, fontWeight: 700, marginRight: 6 }}>Scene Summary:</span>
              {sceneSummaries[activeChapter][activeScene].summary || ""}
            </div>
          )}
        </div>
      )}

      {/* No scene selected but chapter selected */}
      {scenes.length > 0 && !scene && (
        <div style={{ color: C.muted, fontSize: 13, fontStyle: "italic", padding: "20px 0" }}>
          Select a scene from the navigator.
        </div>
      )}

      {/* Complete Chapter banner */}
      {allScenesComplete && !chapterReports[activeChapter] && (
        <div style={{
          margin: "24px 0", padding: "16px 20px", background: C.tealDim,
          border: "1px solid " + C.teal, borderRadius: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ color: C.teal, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>All Scenes Complete</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Assemble the chapter and run continuity check</div>
          </div>
          <button onClick={() => onCompleteChapter(activeChapter)} disabled={checkingCh === activeChapter}
            style={{
              padding: "10px 20px", background: checkingCh === activeChapter ? C.faint : C.teal,
              color: checkingCh === activeChapter ? C.muted : C.surface,
              border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12,
              cursor: checkingCh === activeChapter ? "wait" : "pointer", fontFamily: "Nunito, sans-serif",
            }}>
            {checkingCh === activeChapter ? "Checking continuity…" : "✓ Complete Chapter"}
          </button>
        </div>
      )}

      {/* Continuity report for completed chapter (below banner) */}
      {chapterReports[activeChapter] && renderReport && (
        <div style={{ marginTop: 12 }}>
          {renderReport({ chapterNum: activeChapter })}
        </div>
      )}

      {/* Version history */}
      {renderVersionHistory && renderVersionHistory({ chapterNum: activeChapter })}
    </div>
  );
}

function ActionBtn({ onClick, children, disabled, active }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: "5px 12px", background: active ? C.goldDim : "transparent",
        border: "1px solid " + (active ? C.gold : C.borderLight),
        borderRadius: 6, color: active ? C.gold : disabled ? C.muted : C.text,
        fontSize: 11, cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Nunito, sans-serif",
      }}>
      {children}
    </button>
  );
}

// ─── SceneStudio (main) ───────────────────────────────────────────────────────

export default function SceneStudio({
  story, outline, bible, setBible, universe,
  chapterSceneCards, setChapterSceneCards,
  chapterProse, setChapterProse,
  chapterReports, setChapterReports,
  chapterSummaries, setChapterSummaries,
  chapterVersions, setChapterVersions,
  sceneProse, setSceneProse,
  sceneSummaries, setSceneSummaries,
  sceneLocked, setSceneLocked,
  maxWordsPerGen,
  forceSave,
  storyHealthReport,
  pendingSceneDirectorIssue, setPendingSceneDirectorIssue,
  onGoToEditorMode,
  // Render props for complex App.jsx components
  renderReport,
  renderVersionHistory,
}) {
  // ── Navigator state ──
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeScene, setActiveScene] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState({});

  // ── Loading state ──
  const [generatingScenesCh, setGeneratingScenesCh] = useState(null);
  const [writingScene, setWritingScene] = useState(null);
  const [continuingScene, setContinuingScene] = useState(null);
  const [summarizingScene, setSummarizingScene] = useState(null);
  const [checkingCh, setCheckingCh] = useState(null);
  const [err, setErr] = useState("");

  // ── Edit state ──
  const [editingScene, setEditingScene] = useState(null);

  // ── Fast Draft ──
  const [fastDraftMode, setFastDraftMode] = useState(false);
  const [fastDraftBatchSize, setFastDraftBatchSize] = useState(2);
  const [fastDraftModel, setFastDraftModel] = useState("claude-opus-4-8");
  const [writingBatch, setWritingBatch] = useState(null);

  // ── Scene Director ──
  const [directorOpen, setDirectorOpen] = useState(null);
  const [sandboxInstruction, setSandboxInstruction] = useState("");
  const [fromEditorMode, setFromEditorMode] = useState(false);

  // ── Memory panel ──
  const [memoryTab, setMemoryTab] = useState("characters");
  const [showNavigator, setShowNavigator] = useState(true);
  const [showMemory, setShowMemory] = useState(true);

  // ── On mount: auto-select first chapter with scene cards ──
  useEffect(() => {
    if (!outline?.chapters?.length) return;
    const firstWithCards = outline.chapters.find(ch => chapterSceneCards[ch.number]?.length > 0);
    const target = firstWithCards || outline.chapters[0];
    if (target) {
      setActiveChapter(target.number);
      setExpandedChapters(prev => ({ ...prev, [target.number]: true }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Consume pending issue from Editor Mode ──
  useEffect(() => {
    if (!pendingSceneDirectorIssue) return;
    const { chapterNum } = pendingSceneDirectorIssue;
    setActiveChapter(chapterNum);
    setExpandedChapters(prev => ({ ...prev, [chapterNum]: true }));
    const writtenNums = Object.keys(sceneProse?.[chapterNum] || {})
      .map(Number).filter(n => sceneProse[chapterNum][n]);
    const targetScene = writtenNums.length > 0 ? Math.max(...writtenNums) : 1;
    setActiveScene(targetScene);
    setDirectorOpen({ chapterNum, sceneNum: targetScene });
    setSandboxInstruction(pendingSceneDirectorIssue.instruction);
    setFromEditorMode(true);
    setPendingSceneDirectorIssue(null);
  }, [pendingSceneDirectorIssue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── saveChapterVersion ──
  const saveChapterVersion = useCallback((n) => {
    const current = chapterProse[n];
    if (!current?.trim()) return;
    const wc = current.trim().split(/\s+/).filter(Boolean).length;
    setChapterVersions(prev => {
      const existing = prev[n] || [];
      if (existing.length > 0 && existing[existing.length - 1].prose === current) return prev;
      const version = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        prose: current, wordCount: wc, savedAt: Date.now(),
        label: "v" + (existing.length + 1) + " · " + wc.toLocaleString() + " words",
      };
      return { ...prev, [n]: [...existing.slice(-4), version] };
    });
  }, [chapterProse, setChapterVersions]);

  // ── Handlers ──
  const handleGenerateSceneCards = useCallback(async (chapterNum) => {
    if (!outline || !bible) return;
    setGeneratingScenesCh(chapterNum); setErr("");
    try {
      const result = await generateSceneCards(story, outline, chapterNum, bible, {
        spiceLevel: story.spiceLevel || 2,
        romanceIntensity: story.romanceIntensity || DEFAULT_INTENSITY,
        eroticRomance: story.eroticRomance || DEFAULT_EROTIC,
        streetLitEng: story.streetLitEng || DEFAULT_STREETLIT,
        suspenseEng: story.suspenseEng || DEFAULT_SUSPENSE,
      });
      setChapterSceneCards(prev => ({ ...prev, [chapterNum]: result.scenes || [] }));
      setExpandedChapters(prev => ({ ...prev, [chapterNum]: true }));
    } catch (e) { setErr(e.message); }
    finally { setGeneratingScenesCh(null); }
  }, [story, outline, bible, setChapterSceneCards]);

  const handleWrite = useCallback(async (chapterNum, sceneNumber) => {
    const scene = (chapterSceneCards[chapterNum] || []).find(s => s.sceneNumber === sceneNumber);
    if (!scene) return;
    setWritingScene({ ch: chapterNum, sc: sceneNumber }); setErr("");
    try {
      const prevSummary = sceneNumber > 1 ? sceneSummaries[chapterNum]?.[sceneNumber - 1] : null;
      const prevSummaryText = prevSummary ? (prevSummary.summary || (prevSummary.majorEvents || []).join("; ")) : null;
      const text = await writeScene(story, outline, chapterNum, sceneNumber, bible, scene, {
        spiceLevel: story.spiceLevel || 2,
        romanceIntensity: story.romanceIntensity || DEFAULT_INTENSITY,
        eroticRomance: story.eroticRomance || DEFAULT_EROTIC,
        streetLitEng: story.streetLitEng || DEFAULT_STREETLIT,
        suspenseEng: story.suspenseEng || DEFAULT_SUSPENSE,
        maxWordsPerGen: maxWordsPerGen || 2500,
        scenesInChapter: chapterSceneCards[chapterNum] || [],
        previousSceneSummary: prevSummaryText,
      });
      setSceneProse(prev => ({ ...prev, [chapterNum]: { ...(prev[chapterNum] || {}), [sceneNumber]: text } }));
    } catch (e) { setErr(e.message); }
    finally { setWritingScene(null); }
  }, [story, outline, bible, chapterSceneCards, sceneSummaries, maxWordsPerGen, setSceneProse]);

  const handleContinue = useCallback(async (chapterNum, sceneNumber) => {
    const scene = (chapterSceneCards[chapterNum] || []).find(s => s.sceneNumber === sceneNumber);
    const existing = sceneProse[chapterNum]?.[sceneNumber];
    if (!scene || !existing) return;
    setContinuingScene({ ch: chapterNum, sc: sceneNumber }); setErr("");
    try {
      const extra = await continueScene(story, outline, chapterNum, sceneNumber, bible, scene, existing, {
        currentWordCount: existing.trim().split(/\s+/).filter(Boolean).length,
        maxWordsPerGen: maxWordsPerGen || 2500,
      });
      setSceneProse(prev => ({ ...prev, [chapterNum]: { ...(prev[chapterNum] || {}), [sceneNumber]: existing + "\n\n" + extra } }));
    } catch (e) { setErr(e.message); }
    finally { setContinuingScene(null); }
  }, [story, outline, bible, chapterSceneCards, sceneProse, maxWordsPerGen, setSceneProse]);

  const handleSummarize = useCallback(async (chapterNum, sceneNumber) => {
    const scene = (chapterSceneCards[chapterNum] || []).find(s => s.sceneNumber === sceneNumber);
    const prose = sceneProse[chapterNum]?.[sceneNumber];
    if (!scene || !prose) return;
    setSummarizingScene({ ch: chapterNum, sc: sceneNumber }); setErr("");
    try {
      const summary = await summarizeScene(story, bible, chapterNum, sceneNumber, scene, prose);
      setSceneSummaries(prev => ({ ...prev, [chapterNum]: { ...(prev[chapterNum] || {}), [sceneNumber]: summary } }));
    } catch (e) { setErr(e.message); }
    finally { setSummarizingScene(null); }
  }, [story, bible, chapterSceneCards, sceneProse, setSceneSummaries]);

  const handleRegen = useCallback((chapterNum, sceneNumber) => {
    if (!window.confirm(`Regenerate Scene ${sceneNumber} of Chapter ${chapterNum}? Current prose will be replaced.`)) return;
    setSceneProse(prev => {
      const c = { ...prev };
      if (c[chapterNum]) { const cc = { ...c[chapterNum] }; delete cc[sceneNumber]; c[chapterNum] = cc; }
      return c;
    });
    setSceneSummaries(prev => {
      const c = { ...prev };
      if (c[chapterNum]) { const cc = { ...c[chapterNum] }; delete cc[sceneNumber]; c[chapterNum] = cc; }
      return c;
    });
    setTimeout(() => handleWrite(chapterNum, sceneNumber), 50);
  }, [handleWrite, setSceneProse, setSceneSummaries]);

  const handleSaveEdit = useCallback((chapterNum, sceneNumber, text) => {
    setSceneProse(prev => ({ ...prev, [chapterNum]: { ...(prev[chapterNum] || {}), [sceneNumber]: text } }));
    setSceneSummaries(prev => {
      const c = { ...prev };
      if (c[chapterNum]) { const cc = { ...c[chapterNum] }; delete cc[sceneNumber]; c[chapterNum] = cc; }
      return c;
    });
    setEditingScene(null);
  }, [setSceneProse, setSceneSummaries]);

  const handleLock = useCallback((chapterNum, sceneNumber) => {
    const key = chapterNum + "-" + sceneNumber;
    setSceneLocked(prev => ({ ...prev, [key]: !prev[key] }));
  }, [setSceneLocked]);

  const handleCompleteChapter = useCallback(async (chapterNum) => {
    const scenes = chapterSceneCards[chapterNum] || [];
    const proseMap = sceneProse[chapterNum] || {};
    if (!scenes.every(s => proseMap[s.sceneNumber])) {
      setErr("Cannot complete chapter — some scenes are not written yet."); return;
    }
    const isRecomplete = !!(chapterProse[chapterNum]?.trim());
    if (isRecomplete) saveChapterVersion(chapterNum);
    const assembled = scenes.map(s => proseMap[s.sceneNumber]).join("\n\n");
    setChapterProse(prev => ({ ...prev, [chapterNum]: assembled }));
    setCheckingCh(chapterNum); setErr("");
    try {
      const report = await generateContinuityReport(story, bible, chapterNum, assembled, outline);
      setChapterReports(prev => ({ ...prev, [chapterNum]: report }));
      const updated = mergeBibleUpdates(bible, report, chapterNum);
      setBible(updated);
    } catch (e) { setErr(e.message); }
    finally { setCheckingCh(null); }
  }, [story, outline, bible, setBible, chapterSceneCards, sceneProse, chapterProse, saveChapterVersion, setChapterProse, setChapterReports]);

  // ── Totals for header ──
  const totalWords = Object.values(sceneProse)
    .flatMap(ch => Object.values(ch || {}))
    .filter(Boolean)
    .reduce((sum, p) => sum + p.trim().split(/\s+/).filter(Boolean).length, 0);
  const chaptersWritten = Object.values(chapterProse).filter(Boolean).length;
  const totalChapters = outline?.chapters?.length || 0;

  const btnStyle = (active) => ({
    padding: "4px 10px", background: "transparent",
    border: "1px solid " + (active ? C.gold : C.borderLight),
    borderRadius: 5, color: active ? C.gold : C.muted,
    fontSize: 11, cursor: "pointer", fontFamily: "Nunito, sans-serif",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", overflow: "hidden", background: C.bg }}>

      {/* ── Top strip ── */}
      <div style={{
        display: "flex", alignItems: "center", padding: "8px 16px",
        borderBottom: "1px solid " + C.borderLight, background: C.surface,
        gap: 8, flexShrink: 0,
      }}>
        <span style={{ color: C.gold, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", flex: 1 }}>
          Scene Studio
        </span>
        {outline && (
          <span style={{ color: C.muted, fontSize: 11 }}>
            {chaptersWritten} of {totalChapters} chapters · {totalWords.toLocaleString()} words
          </span>
        )}
        <button onClick={forceSave} style={btnStyle(true)} title="Save · Cmd+S">↓ Save</button>
        <button onClick={() => setShowNavigator(v => !v)} style={btnStyle(showNavigator)} title="Toggle navigator">☰</button>
        <button onClick={() => setShowMemory(v => !v)} style={btnStyle(showMemory)} title="Toggle story memory">◧</button>
      </div>

      {/* ── Fast draft bar (when active) ── */}
      {fastDraftMode && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "6px 16px",
          background: C.glow, borderBottom: "1px solid " + C.gold, flexShrink: 0,
        }}>
          <span style={{ color: C.gold, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>FAST DRAFT</span>
          <select value={fastDraftBatchSize} onChange={e => setFastDraftBatchSize(Number(e.target.value))}
            style={{ padding: "2px 6px", background: C.card, color: C.text, border: "1px solid " + C.borderLight, borderRadius: 4, fontSize: 11 }}>
            <option value={2}>2 scenes/batch</option>
            <option value={3}>3 scenes/batch</option>
          </select>
          <select value={fastDraftModel} onChange={e => setFastDraftModel(e.target.value)}
            style={{ padding: "2px 6px", background: C.card, color: C.text, border: "1px solid " + C.borderLight, borderRadius: 4, fontSize: 11 }}>
            {FAST_DRAFT_MODELS.map(m => <option key={m.id} value={m.id}>{m.label} · {m.badge}</option>)}
          </select>
          {activeChapter && (chapterSceneCards[activeChapter] || []).length > 0 && (() => {
            const scenes = chapterSceneCards[activeChapter] || [];
            const batches = [];
            for (let i = 0; i < scenes.length; i += fastDraftBatchSize) batches.push(scenes.slice(i, i + fastDraftBatchSize));
            return batches.map((batch, bi) => {
              const first = batch[0].sceneNumber, last = batch[batch.length - 1].sceneNumber;
              const isW = writingBatch?.ch === activeChapter && writingBatch.scenes.includes(first);
              return (
                <button key={bi} disabled={!!writingBatch || !bible}
                  onClick={async () => {
                    if (!batch.length || writingBatch) return;
                    setWritingBatch({ ch: activeChapter, scenes: batch.map(s => s.sceneNumber) }); setErr("");
                    try {
                      const result = await writeScenesInBatch(story, outline, activeChapter, batch, bible, {
                        spiceLevel: story.spiceLevel || 2,
                        romanceIntensity: story.romanceIntensity || DEFAULT_INTENSITY,
                        eroticRomance: story.eroticRomance || DEFAULT_EROTIC,
                        streetLitEng: story.streetLitEng || DEFAULT_STREETLIT,
                        suspenseEng: story.suspenseEng || DEFAULT_SUSPENSE,
                        model: fastDraftModel,
                      });
                      setSceneProse(prev => {
                        const chMap = { ...(prev[activeChapter] || {}) };
                        Object.entries(result).forEach(([sn, p]) => { if (p) chMap[sn] = p; });
                        return { ...prev, [activeChapter]: chMap };
                      });
                    } catch (e) { setErr(e.message); }
                    finally { setWritingBatch(null); }
                  }}
                  style={{ padding: "4px 10px", background: (isW || !bible) ? C.faint : C.gold, color: (isW || !bible) ? C.muted : C.bg, border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
                  {isW ? "Drafting…" : first === last ? `⚡ S${first}` : `⚡ S${first}–${last}`}
                </button>
              );
            });
          })()}
          <div style={{ flex: 1 }}/>
          <button onClick={() => setFastDraftMode(false)} style={{ ...btnStyle(false), borderColor: C.borderLight }}>Exit Fast Draft</button>
        </div>
      )}

      {/* ── Error bar ── */}
      {err && (
        <div style={{ padding: "8px 16px", background: C.errBg, borderBottom: "1px solid " + C.err, color: C.err, fontSize: 12, flexShrink: 0 }}>
          ⚠ {err} <button onClick={() => setErr("")} style={{ background: "none", border: "none", color: C.err, cursor: "pointer", float: "right" }}>×</button>
        </div>
      )}

      {/* ── 3-panel body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>

        {showNavigator && (
          <NavigatorPanel
            outline={outline}
            chapterSceneCards={chapterSceneCards}
            sceneProse={sceneProse}
            sceneLocked={sceneLocked}
            chapterProse={chapterProse}
            chapterReports={chapterReports}
            activeChapter={activeChapter}
            activeScene={activeScene}
            expandedChapters={expandedChapters}
            generatingScenesCh={generatingScenesCh}
            bible={bible}
            onSelectChapter={(ch) => { setActiveChapter(ch); setActiveScene(null); }}
            onSelectScene={(ch, sc) => { setActiveChapter(ch); setActiveScene(sc); setDirectorOpen(null); }}
            onToggleChapter={(ch) => setExpandedChapters(prev => ({ ...prev, [ch]: !prev[ch] }))}
            onGenerateSceneCards={handleGenerateSceneCards}
          />
        )}

        {/* Center */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", minWidth: 0 }}>
          {/* Fast Draft toggle (when not active) */}
          {!fastDraftMode && activeChapter && (chapterSceneCards[activeChapter] || []).length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ color: C.muted, fontSize: 11 }}>Fast Draft</span>
              <button onClick={() => setFastDraftMode(true)}
                style={{ width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer", background: C.borderLight, position: "relative" }}>
                <span style={{ position: "absolute", top: 2, left: 2, width: 16, height: 16, borderRadius: 8, background: "#fff" }}/>
              </button>
            </div>
          )}
          <SceneCenterPanel
            activeChapter={activeChapter}
            activeScene={activeScene}
            outline={outline} story={story} bible={bible}
            chapterSceneCards={chapterSceneCards}
            sceneProse={sceneProse} sceneSummaries={sceneSummaries} sceneLocked={sceneLocked}
            chapterProse={chapterProse} chapterReports={chapterReports} checkingCh={checkingCh}
            editingScene={editingScene} setEditingScene={setEditingScene}
            writingScene={writingScene} continuingScene={continuingScene}
            summarizingScene={summarizingScene} generatingScenesCh={generatingScenesCh}
            directorOpen={directorOpen} setDirectorOpen={setDirectorOpen}
            sandboxInstruction={sandboxInstruction} setSandboxInstruction={setSandboxInstruction}
            fromEditorMode={fromEditorMode} setFromEditorMode={setFromEditorMode}
            pendingSceneDirectorIssue={pendingSceneDirectorIssue}
            onGoToEditorMode={onGoToEditorMode}
            onWrite={handleWrite} onContinue={handleContinue}
            onEdit={(ch, sc) => setEditingScene({ ch, sc })}
            onSaveEdit={handleSaveEdit} onCancelEdit={() => setEditingScene(null)}
            onRegen={handleRegen} onLock={handleLock} onSummarize={handleSummarize}
            onGenerateSceneCards={handleGenerateSceneCards}
            onCompleteChapter={handleCompleteChapter}
            renderReport={renderReport}
            renderVersionHistory={renderVersionHistory}
          />
        </div>

        {showMemory && (
          <StoryMemoryPanel
            bible={bible} story={story} outline={outline}
            chapterSummaries={chapterSummaries}
            activeChapter={activeChapter}
            storyHealthReport={storyHealthReport}
            memoryTab={memoryTab}
            onTabChange={setMemoryTab}
          />
        )}
      </div>
    </div>
  );
}
