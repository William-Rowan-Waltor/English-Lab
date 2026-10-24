const SK = "ielts_writing_lab_v1";
const CK = "ielts_lab_configs";
const AK = "ielts_lab_active";
// LOCAL date (not UTC) — was UTC-based which gave wrong "today" in UTC+7 timezones near midnight.
// Same shape (YYYY-MM-DD) so existing completedDays state remains compatible.
const localDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
};
const TODAY = () => localDateStr(new Date());
const DAY_MS = 86400000;
// Subtract N calendar days from a date (DST-safe — uses date arithmetic, not millis).
const addDays = (d, n) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

function hasMeaningfulProgress(stored) {
  if (!stored || typeof stored !== "object") return false;
  const hasDaily = stored.completedDays && Object.keys(stored.completedDays).length > 0;
  const hasMastery = stored.mastery && Object.keys(stored.mastery).length > 0;
  const hasCustom = stored.customVocab && Object.keys(stored.customVocab).length > 0;
  return !!(
    hasDaily || hasMastery || hasCustom ||
    (stored.essays || []).length ||
    (stored.writingTests || []).length ||
    (stored.readingTests || []).length ||
    (stored.listeningTests || []).length ||
    (stored.speakingTests || []).length ||
    (stored.bandHistory || []).length
  );
}

function defaultStudyPlans() {
  const skillOrder = ["vocab","listening","reading","speaking","writing"];
  return {
    skillOrder,
    targets:{daily:"",weekly:"",examDate:"",monthly:"",yearly:""},
    horizonPlan:{status:"none",draft:null,confirmed:null,qa:[],updatedAt:null},
    dailyPlan:{date:TODAY(),items:[],sortedByAI:false}
  };
}

function normalizeStudyPlans(raw) {
  const base = defaultStudyPlans();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const targets = raw.targets && typeof raw.targets === "object" ? raw.targets : {};
  const horizon = raw.horizonPlan && typeof raw.horizonPlan === "object" ? raw.horizonPlan : {};
  const daily = raw.dailyPlan && typeof raw.dailyPlan === "object" ? raw.dailyPlan : {};
  const allowedSkills = ["vocab","listening","reading","speaking","writing"];
  const skillOrder = Array.isArray(raw.skillOrder)
    ? [...new Set(raw.skillOrder.filter(skill=>allowedSkills.includes(skill))),...allowedSkills].filter((skill,index,arr)=>arr.indexOf(skill)===index)
    : base.skillOrder;
  const cleanText = (value) => typeof value === "string" ? value.slice(0,300) : "";
  const cleanTime = (value) => typeof value === "string" && /^\d{2}:\d{2}$/.test(value) ? value : "";
  const items = Array.isArray(daily.items) ? daily.items.map((item,index)=>({
    id: typeof item?.id === "string" && item.id ? item.id : `plan-${Date.now()}-${index}`,
    title: cleanText(item?.title || item?.task || "").slice(0,120),
    skill: ["writing","reading","listening","speaking","vocab","review"].includes(item?.skill) ? item.skill : "writing",
    estMins: Math.max(1,Math.min(240,Math.round(Number(item?.estMins)||20))),
    time: cleanTime(item?.time),
    difficulty: ["easy","medium","hard"].includes(item?.difficulty) ? item.difficulty : "medium",
    reason: cleanText(item?.reason).slice(0,180),
    done: !!item?.done,
    notifiedAt: typeof item?.notifiedAt === "string" ? item.notifiedAt : ""
  })).filter(item=>item.title) : [];
  const status = horizon.status === "draft" ? "drafting" : (["none","drafting","confirmed"].includes(horizon.status) ? horizon.status : "none");
  return {
    skillOrder,
    targets:{
      daily:cleanText(targets.daily),
      weekly:cleanText(targets.weekly),
      examDate:typeof targets.examDate === "string" ? targets.examDate.slice(0,20) : "",
      monthly:cleanText(targets.monthly),
      yearly:cleanText(targets.yearly)
    },
    horizonPlan:{
      status,
      draft:horizon.draft || null,
      confirmed:horizon.confirmed || null,
      qa:Array.isArray(horizon.qa) ? horizon.qa.map(turn=>({
        q:cleanText(turn?.q).slice(0,200),
        a:cleanText(turn?.a).slice(0,500)
      })).filter(turn=>turn.q || turn.a).slice(0,12) : [],
      updatedAt:typeof horizon.updatedAt === "string" ? horizon.updatedAt : null
    },
    dailyPlan:{
      date:typeof daily.date === "string" && daily.date ? daily.date : TODAY(),
      items,
      sortedByAI:!!daily.sortedByAI
    }
  };
}

function defaultState() {
  return {
    startDate:TODAY(),
    onboardingComplete:false,
    learnerMode:"starter",
    completedDays:{},
    wordCache:{},
    mastery:{},
    priorityWords:[],
    bandHistory:[],
    wordsPerDay:3,
    activeSublists:[1,2,3,4,5,6,7,8,9,10],
    targetBand:7.0,
    examDate:null,
    customVocab:{},
    vocabSession:null,
    vocabQuizSession:null, // resume an in-progress vocab quiz (phase + completed-phase results)
    feedbackStyle:"coach",
    designEra:"modern",
    writingGoal:"",
    translationHistory:[], // FEATURE: entries from the standalone Translate widget (capped at 200)
    translateWidgetPos:null, // {edge:"left"|"right"|"top"|"bottom", offset:number} - null = default corner
    essays:[],   // FEATURE: archive of saved practice essays (drafts + graded)
    writingDrafts:{}, // unsaved in-progress Writing work, restored when switching tabs/pages
    writingWorkTabs:{},
    writingTests:[],
    readingTests:[],
    readingDraft:{},
    readingWorkTabs:{},
    readingDataset:[],
    listeningTests:[],
    listeningDraft:{},
    listeningWorkTabs:{},
    speakingTests:[],
    speakingDraft:{},
    speakingBackendUrl:"http://localhost:8000",
    useLocalGrader:true, // route writing grading to the local fine-tuned IELTS model (Ollama) when reachable
    localGraderUrl:"http://localhost:11434/v1/chat/completions",
    markingExamples:[], // teacher-corrected files distilled into grading calibration profiles
    saved:[], // user-bookmarked items: questions, vocab, grammar notes, exercises (see saveItem/isItemSaved)
    // V5 — Per-day learning telemetry. Persists REAL progress (not just "done" boolean).
    // Shape: { "2026-05-22": { target: 3, extra: 5, words: ["analyse","approach", ...] } }
    //   target: how many words the scheduled session asked for
    //   extra:  how many ADDITIONAL words user studied past the daily limit
    //   words:  unique list of words studied today (used to dedupe & display)
    studyPlans:defaultStudyPlans(),
    dailyStats:{},
    // UNIFIED EXAM SYSTEM & VOCAB PATCHES
    targetTrack:"all", // "ielts" | "thptqg" | "vact" | "all"
    targetExamScore:{ ielts: 7.0, thptqg: 9.0, vact: 250 },
    diagnosticCompleted:false,
    diagnosticResults:null,
    userProfile:{
      level:"intermediate",
      primaryExam:"all",
      weakAreas:[],
      targetDate:""
    },
    vocabPatches:(typeof VN_DEFAULT_PATCHES !== "undefined" ? VN_DEFAULT_PATCHES : {}),
    flashcardStats:{},
    guidedStudyMode:true,
    activeStudyMode:"flashcard", // "flashcard" | "learn" | "match" | "test"
    activePatchId:"all"
  };
}
// ─── Saved items (bookmarks) ───────────────────────────────────────────────────
// One store for anything the user bookmarks: a reading question, a vocab word, a
// grammar note, an exercise. Each item: {id, type, title, body, meta, source, sig, savedAt}.
const SAVED_TYPES = [
  {id:"question", label:"Question"},
  {id:"vocab",    label:"Vocabulary"},
  {id:"grammar",  label:"Grammar"},
  {id:"exercise", label:"Exercise"},
  {id:"note",     label:"Note"}
];
// Identity signatures for a save item. If the caller supplies a STABLE `key` (e.g.
// "vocab:analyse", "reading:<qid>"), identity is based on that — so a bookmark keeps matching
// even when the DISPLAY body changes (vocab card enriched by AI, reading answer revealed after
// submit, etc.). We also always include the legacy content signature so older saved entries
// (stored before `key` existed) still toggle off when their content is unchanged.
function _savedSigs(item) {
  const sigs = [];
  if (item && item.key) sigs.push("k:" + String(item.key).toLowerCase().trim());
  sigs.push([
    item && item.type || "note",
    String(item && item.title || "").trim().toLowerCase(),
    String(item && item.body || "").trim().toLowerCase().slice(0,160)
  ].join("|"));
  return sigs;
}
// Primary signature stored on an item (the stable key sig when available, else content sig).
function savedSignature(item) { return _savedSigs(item)[0]; }
function isItemSaved(state, item) {
  const sigs = _savedSigs(item);
  return (state && Array.isArray(state.saved) ? state.saved : []).some(s=>sigs.includes(s.sig));
}
function makeSavedItem(item) {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,7),
    type: SAVED_TYPES.some(t=>t.id===(item&&item.type)) ? item.type : "note",
    title: String(item && item.title || "").trim() || "Untitled",
    body: String(item && item.body || "").trim(),
    meta: (item && item.meta && typeof item.meta==="object") ? item.meta : {},
    source: String(item && item.source || "").trim(),
    key: String(item && item.key || ""),
    sig: savedSignature(item),
    savedAt: new Date().toISOString()
  };
}
// Toggle: returns a NEW saved array. Already saved (by any matching sig) -> remove; else prepend.
function toggleSavedItem(savedArr, item) {
  const arr = Array.isArray(savedArr) ? savedArr : [];
  const sigs = _savedSigs(item);
  return arr.some(s=>sigs.includes(s.sig)) ? arr.filter(s=>!sigs.includes(s.sig)) : [makeSavedItem(item), ...arr];
}
function removeSavedById(savedArr, id) {
  return (Array.isArray(savedArr) ? savedArr : []).filter(s=>s.id!==id);
}
// Edit a saved item's title/body (e.g. a Note). Recomputes sig so identity stays consistent
// (key-based items keep their stable key; content-based items get a fresh content sig).
function updateSavedItem(savedArr, id, patch={}) {
  return (Array.isArray(savedArr) ? savedArr : []).map(s=>{
    if (s.id !== id) return s;
    const next = {
      ...s,
      title: patch.title != null ? (String(patch.title).trim() || s.title) : s.title,
      body: patch.body != null ? String(patch.body).trim() : s.body
    };
    next.sig = savedSignature(next);
    return next;
  });
}

function loadState() {
  try {
    const r = localStorage.getItem(SK);
    if (!r) return defaultState();
    const stored = JSON.parse(r);
    // Migration: ensure new fields exist for old state
    const migrated = {
      ...defaultState(),
      ...stored,
      wordsPerDay: stored.wordsPerDay || 3,
      onboardingComplete: typeof stored.onboardingComplete === "boolean" ? stored.onboardingComplete : hasMeaningfulProgress(stored),
      learnerMode: typeof stored.learnerMode === "string" ? stored.learnerMode : "starter",
      activeSublists: Array.isArray(stored.activeSublists) && stored.activeSublists.length > 0
        ? stored.activeSublists
        : [1,2,3,4,5,6,7,8,9,10],
      essays: Array.isArray(stored.essays) ? stored.essays : [],   // FEATURE: archive migration
      translationHistory: Array.isArray(stored.translationHistory) ? stored.translationHistory : [],
      translateWidgetPos: (stored.translateWidgetPos && typeof stored.translateWidgetPos === "object"
        && ["left","right","top","bottom"].includes(stored.translateWidgetPos.edge)
        && typeof stored.translateWidgetPos.offset === "number") ? stored.translateWidgetPos : null,
      writingDrafts: (stored.writingDrafts && typeof stored.writingDrafts === "object") ? stored.writingDrafts : {},
      writingWorkTabs: (stored.writingWorkTabs && typeof stored.writingWorkTabs === "object") ? stored.writingWorkTabs : {},
      writingTests: Array.isArray(stored.writingTests) ? stored.writingTests : [],
      readingTests: Array.isArray(stored.readingTests) ? stored.readingTests : [],
      readingDraft: (stored.readingDraft && typeof stored.readingDraft === "object") ? stored.readingDraft : {},
      readingWorkTabs: (stored.readingWorkTabs && typeof stored.readingWorkTabs === "object") ? stored.readingWorkTabs : {},
      listeningTests: Array.isArray(stored.listeningTests) ? stored.listeningTests : [],
      listeningDraft: (stored.listeningDraft && typeof stored.listeningDraft === "object") ? stored.listeningDraft : {},
      listeningWorkTabs: (stored.listeningWorkTabs && typeof stored.listeningWorkTabs === "object") ? stored.listeningWorkTabs : {},
      speakingTests: Array.isArray(stored.speakingTests) ? stored.speakingTests : [],
      speakingDraft: (stored.speakingDraft && typeof stored.speakingDraft === "object") ? stored.speakingDraft : {},
      speakingBackendUrl: typeof stored.speakingBackendUrl === "string" && stored.speakingBackendUrl ? stored.speakingBackendUrl : "http://localhost:8000",
      useLocalGrader: typeof stored.useLocalGrader === "boolean" ? stored.useLocalGrader : true,
      localGraderUrl: typeof stored.localGraderUrl === "string" && stored.localGraderUrl ? stored.localGraderUrl : "http://localhost:11434/v1/chat/completions",
      markingExamples: Array.isArray(stored.markingExamples) ? stored.markingExamples : [],
      saved: Array.isArray(stored.saved) ? stored.saved : [],
      studyPlans: normalizeStudyPlans(stored.studyPlans),
      vocabSession: (stored.vocabSession && typeof stored.vocabSession === "object") ? stored.vocabSession : null,
      vocabQuizSession: (stored.vocabQuizSession && typeof stored.vocabQuizSession === "object") ? stored.vocabQuizSession : null,
      readingDataset: Array.isArray(stored.readingDataset) ? stored.readingDataset : (
        // Migrate prior readingLibrary entries (older shape) to the new dataset format
        Array.isArray(stored.readingLibrary) ? stored.readingLibrary.map(e => ({
          id: e.id,
          source: "imported",
          title: e.title,
          topic: e.topic || "",
          topicTags: [],
          level: e.level || "",
          section: 2,
          questionCount: e.questionCount || 0,
          wordCount: e.wordCount || 0,
          paragraphLabels: (e.data?.sections?.[0]?.passage?.paragraphs || []).map((_,i)=>String.fromCharCode(65+i)),
          testData: e.data,
          useAsFewShot: true,
          createdAt: e.importedAt || new Date().toISOString()
        })) : []
      ),
      dailyStats: (stored.dailyStats && typeof stored.dailyStats === "object") ? stored.dailyStats : {},  // V5: telemetry
      targetTrack: ["ielts", "thptqg", "vact", "all"].includes(stored.targetTrack) ? stored.targetTrack : "all",
      targetExamScore: (stored.targetExamScore && typeof stored.targetExamScore === "object") ? stored.targetExamScore : { ielts: 7.0, thptqg: 9.0, vact: 250 },
      diagnosticCompleted: !!stored.diagnosticCompleted,
      diagnosticResults: (stored.diagnosticResults && typeof stored.diagnosticResults === "object") ? stored.diagnosticResults : null,
      userProfile: (stored.userProfile && typeof stored.userProfile === "object") ? stored.userProfile : {
        level: "intermediate",
        primaryExam: "all",
        weakAreas: [],
        targetDate: ""
      },
      vocabPatches: (stored.vocabPatches && typeof stored.vocabPatches === "object" && Object.keys(stored.vocabPatches).length > 0)
        ? stored.vocabPatches
        : (typeof VN_DEFAULT_PATCHES !== "undefined" ? VN_DEFAULT_PATCHES : {}),
      flashcardStats: (stored.flashcardStats && typeof stored.flashcardStats === "object") ? stored.flashcardStats : {},
      guidedStudyMode: typeof stored.guidedStudyMode === "boolean" ? stored.guidedStudyMode : true,
      activeStudyMode: ["flashcard", "learn", "match", "test"].includes(stored.activeStudyMode) ? stored.activeStudyMode : "flashcard",
      activePatchId: typeof stored.activePatchId === "string" ? stored.activePatchId : "all"
    };
    // v6 schema migration: drop cached word entries from previous versions so they get rebuilt
    // with: distinct per-form VI+EN, non-circular EN definitions, collocation panel data.
    if (migrated.wordCache && typeof migrated.wordCache === "object") {
      const cleaned = {};
      let dropped = 0;
      for (const [k,v] of Object.entries(migrated.wordCache)) {
        if (v && typeof v === "object" && (v.version || 0) >= 7) cleaned[k] = v;
        else dropped++;
      }
      if (dropped > 0) console.info(`[cache-migration] Dropped ${dropped} pre-v7 word cache entries to apply schema upgrade.`);
      migrated.wordCache = cleaned;
    }
    return migrated;
  } catch { return defaultState(); }
}
const STORAGE_SAVE_ERROR_EVENT = "ielts-storage-save-error";

function describeStorageError(e, key) {
  const name = e?.name || "";
  const msg = e?.message || String(e || "unknown error");
  const quota = name.includes("Quota") || msg.toLowerCase().includes("quota");
  return quota
    ? `Browser storage is full while saving ${key}. Run with node scripts/serve.mjs for folder storage, or export and reduce old datasets.`
    : `Browser storage save failed for ${key}: ${msg}`;
}

function reportStorageSaveError(key, e) {
  const message = describeStorageError(e, key);
  try { console.warn("[storage]", message, e); } catch {}
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_SAVE_ERROR_EVENT, {
      detail: { key, message, errorName: e?.name || "" }
    }));
  } catch {}
}

function saveJSONToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch(e) {
    reportStorageSaveError(key, e);
    return false;
  }
}

function saveState(s) { return saveJSONToLocalStorage(SK, s); }
function loadConfigs() {
  try {
    const r = localStorage.getItem(CK);
    const arr = r ? JSON.parse(r) : [];
    // Migration: auto-correct format based on URL (fixes configs saved before the format-bug fix)
    return arr.map(c => {
      if (c.url?.includes("generativelanguage.googleapis.com")) c.format = "gemini";
      else if (c.url?.includes("api.anthropic.com")) c.format = "anthropic";
      else if (!c.format) c.format = "openai";
      return typeof normalizeAPIConfig === "function" ? normalizeAPIConfig(c) : c;
    });
  } catch { return []; }
}
function saveConfigs(c) { return saveJSONToLocalStorage(CK, c); }
function loadActiveId() { try { return localStorage.getItem(AK)||null; } catch { return null; } }
function saveActiveId(id) {
  try {
    if (id) localStorage.setItem(AK,id);
    else localStorage.removeItem(AK);
    return true;
  } catch(e) {
    reportStorageSaveError(AK, e);
    return false;
  }
}

const STORAGE_FILE_LABEL = "data/app-state.json";
const SERVER_STORAGE_ENDPOINT = "/api/storage";

// Folder / Cloud storage is available on localhost AND deployed web hosts (like Vercel).
function folderStorageAvailable() {
  try {
    return typeof location !== "undefined" && location.protocol.startsWith("http");
  } catch { return false; }
}
// User-chosen storage source. DEFAULT = browser localStorage (does NOT read/write the
// folder file). Set to "folder" to sync with data/app-state.json. Toggle in the sidebar.
const STORAGE_MODE_KEY = "ielts-storage-mode";
function getStorageMode() {
  try {
    const isCloudHost = typeof location !== "undefined" && !["localhost", "127.0.0.1", "::1"].includes(location.hostname);
    const stored = localStorage.getItem(STORAGE_MODE_KEY);
    if (stored) return stored === "folder" ? "folder" : "browser";
    // On Vercel / Cloud host, default to cloud folder sync so user dataset is automatically preserved!
    return isCloudHost ? "folder" : "browser";
  }
  catch { return "browser"; }
}
function setStorageMode(mode) {
  try { localStorage.setItem(STORAGE_MODE_KEY, mode === "folder" ? "folder" : "browser"); } catch {}
}
function canUseFolderStorage() {
  return folderStorageAvailable() && getStorageMode() === "folder";
}

function makeStorageBundle(state=loadState(), configs=loadConfigs(), activeId=loadActiveId()) {
  return {
    version: 1,
    app: "ielts-writing-lab",
    updatedAt: new Date().toISOString(),
    keys: { state: SK, configs: CK, activeId: AK },
    state,
    configs,
    activeId
  };
}

function looksLikeAppState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (typeof value.startDate !== "string") return false;
  const objectKeys = ["completedDays","wordCache","mastery","customVocab","writingDrafts","readingDraft","listeningDraft","speakingDraft","dailyStats"];
  const arrayKeys = ["essays","bandHistory","readingTests","listeningTests","speakingTests"];
  return objectKeys.some(k=>value[k] && typeof value[k] === "object" && !Array.isArray(value[k]))
    || arrayKeys.some(k=>Array.isArray(value[k]));
}

function validateStorageBundle(bundle) {
  if (!bundle || typeof bundle !== "object" || Array.isArray(bundle)) {
    throw new Error("Backup must be a JSON object.");
  }
  if (bundle.app !== "ielts-writing-lab") {
    throw new Error("This is not an IELTS Writing Lab backup file.");
  }
  if (!looksLikeAppState(bundle.state)) {
    throw new Error("Backup is missing a valid app state. Import was cancelled to avoid wiping your data.");
  }
  if ("configs" in bundle && !Array.isArray(bundle.configs)) {
    throw new Error("Backup configs must be an array.");
  }
  if ("activeId" in bundle && bundle.activeId !== null && bundle.activeId !== undefined && typeof bundle.activeId !== "string") {
    throw new Error("Backup activeId must be a string or null.");
  }
  return {
    state: bundle.state,
    configs: Array.isArray(bundle.configs) ? bundle.configs : [],
    activeId: bundle.activeId || null
  };
}

function applyStorageBundle(bundle) {
  const checked = validateStorageBundle(bundle);
  const nextState = checked.state;
  // Data-loss guard: if the incoming bundle has NO providers but the user already has some
  // saved locally (API keys), keep the local configs instead of wiping them to []. This stops
  // loading a folder file / backup that lacks configs from silently erasing the user's keys
  // (which then surfaces as "Invalid API key (401)" / cannot generate).
  let nextConfigs = checked.configs;
  let nextActiveId = checked.activeId;
  if (!nextConfigs.length) {
    const local = loadConfigs();
    if (Array.isArray(local) && local.length) {
      nextConfigs = local;
      if (!nextActiveId) nextActiveId = loadActiveId();
    }
  }
  const saved = [saveState(nextState), saveConfigs(nextConfigs), saveActiveId(nextActiveId)];
  if (saved.some(ok=>!ok)) {
    throw new Error("Imported data could not be saved to browser storage.");
  }
  return { state: loadState(), configs: loadConfigs(), activeId: loadActiveId() };
}

async function loadFolderStorage() {
  if (!canUseFolderStorage()) return null;
  const res = await fetch(SERVER_STORAGE_ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error(`Folder storage load failed (${res.status})`);
  const data = await res.json();
  return data?.exists === false ? null : data;
}

async function saveFolderStorage(bundle) {
  if (!canUseFolderStorage()) return null;
  const res = await fetch(SERVER_STORAGE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bundle)
  });
  if (!res.ok) throw new Error(`Folder storage save failed (${res.status})`);
  return res.json();
}


function getSchedule(startDate, wordsPerDay=3, activeSublists=[1,2,3,4,5,6,7,8,9,10]) {
  const sch=[];
  const activeSet = new Set(activeSublists);
  // Pre-compute eligible word indices (filtered by active sublists, preserving AWL_WORDS order)
  const eligibleIndices = AWL_WORDS.map((w,i)=>activeSet.has(w.s)?i:-1).filter(i=>i>=0);
  // Dynamic cap: learn days = ceil(N/wpd); reviews add ~30%; +60 buffer. Min 300 for safety.
  const wpd = Math.max(1, wordsPerDay);
  const learnDays = Math.ceil(eligibleIndices.length / wpd);
  const maxIter = Math.max(300, Math.ceil(learnDays * 1.4) + 60);
  let wc=0,rg=[],al=[],dn=0;
  while (dn<maxIter) {
    const date = localDateStr(new Date(new Date(startDate).getTime()+dn*DAY_MS));
    dn++;
    const iW=dn%8===0, iR3=dn%4===0&&!iW;
    if (iW&&al.length>0) sch.push({date,type:"review7",wordIndices:[...al]});
    else if (iR3&&rg.length>0) sch.push({date,type:"review3",wordIndices:rg.slice(-3).flat()});
    else if (wc<eligibleIndices.length) {
      const ix=[];
      for (let j=0;j<wpd&&wc<eligibleIndices.length;j++,wc++) ix.push(eligibleIndices[wc]);
      rg.push(ix); if (rg.length>3) rg=rg.slice(-3); al.push(...ix);
      sch.push({date,type:"learn",wordIndices:ix});
    } else break;
  }
  return sch;
}

// ─── Vocab Patch Management ──────────────────────────────────────────────────
function createVocabPatch(state, patchData = {}) {
  const patchId = patchData.id || `patch-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const newPatch = {
    id: patchId,
    name: patchData.name || "Bộ từ vựng mới",
    parentId: patchData.parentId || null,
    category: patchData.category || "custom",
    examTag: patchData.examTag || (state?.targetTrack || "all"),
    wordIds: Array.isArray(patchData.wordIds) ? [...patchData.wordIds] : [],
    subPatches: [],
    description: patchData.description || "",
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  const patches = { ...(state.vocabPatches || {}) };
  patches[patchId] = newPatch;
  if (newPatch.parentId && patches[newPatch.parentId]) {
    const parent = { ...patches[newPatch.parentId] };
    parent.subPatches = [...(parent.subPatches || []), patchId];
    patches[newPatch.parentId] = parent;
  }
  return { ...state, vocabPatches: patches };
}

function updateVocabPatch(state, patchId, updates = {}) {
  if (!state.vocabPatches || !state.vocabPatches[patchId]) return state;
  const patches = { ...state.vocabPatches };
  patches[patchId] = {
    ...patches[patchId],
    ...updates,
    updatedAt: Date.now()
  };
  return { ...state, vocabPatches: patches };
}

function deleteVocabPatch(state, patchId, deleteWords = false) {
  if (!state.vocabPatches || !state.vocabPatches[patchId]) return state;
  const patches = { ...state.vocabPatches };
  const target = patches[patchId];
  const customVocab = { ...(state.customVocab || {}) };
  
  if (deleteWords && Array.isArray(target.wordIds)) {
    target.wordIds.forEach(id => {
      if (customVocab[id]) delete customVocab[id];
    });
  }
  
  if (target.parentId && patches[target.parentId]) {
    const parent = { ...patches[target.parentId] };
    parent.subPatches = (parent.subPatches || []).filter(id => id !== patchId);
    patches[target.parentId] = parent;
  }
  
  (target.subPatches || []).forEach(subId => {
    if (patches[subId]) patches[subId] = { ...patches[subId], parentId: null };
  });
  
  delete patches[patchId];
  return { ...state, vocabPatches: patches, customVocab };
}

function splitVocabPatch(state, patchId, chunkSize = 25) {
  if (!state.vocabPatches || !state.vocabPatches[patchId]) return state;
  const target = state.vocabPatches[patchId];
  const words = target.wordIds || [];
  if (words.length <= chunkSize) return state;
  
  let newState = { ...state };
  const numChunks = Math.ceil(words.length / chunkSize);
  const newSubPatchIds = [];
  
  for (let i = 0; i < numChunks; i++) {
    const chunkWords = words.slice(i * chunkSize, (i + 1) * chunkSize);
    const subPatchId = `${patchId}-part${i + 1}`;
    newState = createVocabPatch(newState, {
      id: subPatchId,
      name: `${target.name} (Phần ${i + 1}/${numChunks})`,
      parentId: patchId,
      category: target.category,
      examTag: target.examTag,
      wordIds: chunkWords,
      description: `Tiểu mục ${i + 1} gồm ${chunkWords.length} từ vựng trích xuất từ ${target.name}.`
    });
    newSubPatchIds.push(subPatchId);
  }
  return newState;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
