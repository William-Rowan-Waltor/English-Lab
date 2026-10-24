// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SPEAKING LAB — IELTS Speaking practice (record → local ASR → AI examiner)
// Companion server: speaking-backend/ (FastAPI + faster-whisper + Claude)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DEFAULT_SPEAKING_BACKEND = "http://localhost:8000";

const SPEAKING_PARTS = [
  {
    id: "part1",
    label: "Part 1",
    title: "Personal introduction & interview",
    blurb: "4-5 short questions about familiar topics. ~30 seconds per answer.",
    durationHint: 60
  },
  {
    id: "part2",
    label: "Part 2",
    title: "Individual long turn (cue card)",
    blurb: "1 minute to prepare, 1-2 minutes to speak from a cue card.",
    durationHint: 120
  },
  {
    id: "part3",
    label: "Part 3",
    title: "Two-way discussion",
    blurb: "Abstract follow-up questions linked to Part 2. ~60-90 seconds per turn.",
    durationHint: 90
  }
];

const CRITERIA_META = [
  { id: "fluency_score",      label: "Fluency & Coherence",       short: "F&C" },
  { id: "lexical_score",      label: "Lexical Resource",          short: "LR"  },
  { id: "grammar_score",      label: "Grammatical Range & Acc.",  short: "GR"  },
  { id: "pronunciation_score",label: "Pronunciation",             short: "PR", approx: true }
];

// No-backend warm-up: local question bank + self-assessment so the gentlest users
// (beginners, "Silent Speaker") can practise speaking WITHOUT the Python backend.
const WARMUP_BANK = {
  part1: [
    "Do you work or are you a student?",
    "What do you usually do in your free time?",
    "Do you prefer mornings or evenings? Why?",
    "How often do you use public transport?",
    "What kind of music do you enjoy, and why?",
    "Do you like cooking? Why or why not?",
    "Tell me about your hometown."
  ],
  part2: [
    {cue:"Describe a place where you like to relax.", bullets:["where it is","how often you go there","what you do there","and explain why it helps you relax"]},
    {cue:"Describe a skill you would like to learn.", bullets:["what the skill is","why you want to learn it","how you would learn it","and explain how it would help you"]},
    {cue:"Describe a memorable journey you took.", bullets:["where you went","who you went with","what happened","and explain why it was memorable"]},
    {cue:"Describe a person who has influenced you.", bullets:["who the person is","how you know them","what they did","and explain how they influenced you"]}
  ],
  part3: [
    "Why do some people find it hard to relax these days?",
    "How has technology changed the way people learn new skills?",
    "Do you think travelling is as important as people say? Why?",
    "Should schools teach life skills as well as academic subjects?"
  ]
};
const WARMUP_TIPS = [
  "Add a reason — \"…because…\"",
  "Give a concrete example — \"For instance, last week…\"",
  "Compare with the past — \"In the past… but now…\"",
  "Add a feeling/opinion — \"What I really like is…\"",
  "Extend with a result — \"…which means that…\""
];
function fmtClock(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }

// Self-contained warm-up card — own state, no backend, no AI, no scoring.
function SpeakingWarmup({defaultOpen, setState}) {
  const [open,setOpen] = useState(!!defaultOpen);
  const [wpart,setWpart] = useState("part1");
  const [q,setQ] = useState(null);
  const [prep,setPrep] = useState(0);
  const [speak,setSpeak] = useState(0);
  const [running,setRunning] = useState(false);
  const [ratings,setRatings] = useState({});
  const [transcript,setTranscript] = useState("");
  const [saved,setSaved] = useState(false);
  const prepR = useRef(null), spkR = useRef(null);
  useEffect(()=>()=>{ clearInterval(prepR.current); clearInterval(spkR.current); },[]);
  const target = wpart==="part2"?120:wpart==="part3"?75:35;
  const switchPart = (p)=>{ setWpart(p); setQ(null); setSpeak(0); setRunning(false); setRatings({}); setTranscript(""); setSaved(false); setPrep(0); clearInterval(spkR.current); clearInterval(prepR.current); };
  const newQ = ()=>{
    const b = WARMUP_BANK[wpart]||[];
    setQ(b[Math.floor(Math.random()*b.length)]);
    setSpeak(0); setRunning(false); setRatings({}); setTranscript(""); setSaved(false); clearInterval(spkR.current);
    if (wpart==="part2"){ setPrep(60); clearInterval(prepR.current); prepR.current=setInterval(()=>setPrep(t=>{ if(t<=1){clearInterval(prepR.current);return 0;} return t-1; }),1000); }
    else setPrep(0);
  };
  const toggleSpeak = ()=>{ if(running){ clearInterval(spkR.current); setRunning(false); } else { setRunning(true); spkR.current=setInterval(()=>setSpeak(t=>t+1),1000); } };
  const saveAttempt = ()=>{
    if (!q || typeof setState!=="function") return;
    const qt = wpart==="part2" ? (q.cue||"") : String(q||"");
    const attempt = {
      id:`offline-${Date.now()}`,
      date:new Date().toISOString(),
      offline:true,
      part:wpart,
      topic:"self-practice",
      question_text:qt,
      overall_band:null,
      transcript:transcript.trim(),
      durationSec:speak,
      feedback:{selfRatings:ratings}
    };
    setState(s=>({...s, speakingTests:[attempt, ...((s.speakingTests)||[])].slice(0,200)}));
    setSaved(true);
  };
  const crit = [["fc","Fluency"],["lr","Vocabulary"],["gr","Grammar"],["pr","Pronunciation"]];
  const levels = [["low","Shaky","var(--rose)"],["ok","OK","var(--honey)"],["good","Good","var(--leaf)"]];
  return <div className="card" style={{marginBottom:14,borderLeft:"2px solid var(--sky)"}}>
    <div className="card-h" style={{cursor:"pointer",margin:0}} onClick={()=>setOpen(o=>!o)}>
      <div className="cdot" style={{background:"var(--sky)"}}/>Warm-up — no backend needed {open?"▾":"▸"}
    </div>
    {open&&<div style={{marginTop:10}}>
      <div className="why" style={{marginBottom:10}}>Practise speaking out loud with a prompt + timer + self-check. No recording or AI — great before a full scored attempt, or when the backend isn't running.</div>
      <div className="mode-toggle" style={{marginBottom:10}}>
        {SPEAKING_PARTS.map(p=><button key={p.id} className={`mode-btn ${wpart===p.id?"active":""}`} onClick={()=>switchPart(p.id)}>{p.label}</button>)}
      </div>
      <button className="btn bp bsm" onClick={newQ}>{q?"↻ New question":"Show a question"}</button>
      {q&&<div style={{marginTop:12}}>
        {wpart==="part2"
          ? <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:15,color:"var(--ink)",marginBottom:7}}>{q.cue}</div>
              <div style={{fontSize:11,color:"var(--ink3)",marginBottom:4}}>You should say:</div>
              <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink2)",lineHeight:1.6}}>{q.bullets.map((b,i)=><li key={i}>{b}</li>)}</ul>
            </div>
          : <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px",fontFamily:"'Fraunces',serif",fontSize:15,color:"var(--ink)"}}>{q}</div>}
        {wpart==="part2"&&prep>0&&<div style={{marginTop:10,fontSize:12.5,color:"var(--honey)"}}>Preparation: <strong style={{fontFamily:"'Geist Mono',monospace"}}>{fmtClock(prep)}</strong> — jot ideas, then start speaking.</div>}
        <div style={{display:"flex",gap:10,alignItems:"center",marginTop:12,flexWrap:"wrap"}}>
          <button className={`btn bsm ${running?"bg":"bp"}`} onClick={toggleSpeak}>{running?"■ Stop":"● Start speaking"}</button>
          <span style={{fontFamily:"'Geist Mono',monospace",fontSize:15,color:speak>target?"var(--rose)":"var(--ink)"}}>{fmtClock(speak)}</span>
          <span style={{fontSize:11,color:"var(--ink3)"}}>target ≈ {fmtClock(target)}{speak>target?" · good length!":""}</span>
        </div>
        <div style={{marginTop:12}}>
          <div style={{fontSize:11,color:"var(--ink3)",marginBottom:6}}>Keep going — try one of these to say more:</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{WARMUP_TIPS.map((t,i)=><span key={i} style={{fontSize:11,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:6,padding:"3px 8px",color:"var(--ink2)"}}>{t}</span>)}</div>
        </div>
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,color:"var(--ink3)",marginBottom:6}}>Quick self-check (how did that feel?):</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8}}>
            {crit.map(([k,label])=><div key={k} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 10px"}}>
              <div style={{fontSize:11.5,color:"var(--ink2)",marginBottom:5}}>{label}</div>
              <div style={{display:"flex",gap:4}}>{levels.map(([v,lbl,c])=><button key={v} onClick={()=>setRatings(r=>({...r,[k]:v}))} style={{flex:1,fontSize:10.5,padding:"3px 0",borderRadius:5,cursor:"pointer",border:`1px solid ${ratings[k]===v?c:"var(--border)"}`,background:ratings[k]===v?`color-mix(in srgb, ${c} 18%, transparent)`:"transparent",color:ratings[k]===v?c:"var(--ink3)"}}>{lbl}</button>)}</div>
            </div>)}
          </div>
        </div>
        <div style={{marginTop:14}}>
          <div style={{fontSize:11,color:"var(--ink3)",marginBottom:6}}>Self-transcript (optional) — type what you said to spot gaps:</div>
          <textarea className="era-input" value={transcript} onChange={e=>{setTranscript(e.target.value);setSaved(false);}} rows="2" placeholder="Write or paste roughly what you said…" style={{resize:"vertical"}}/>
        </div>
        {typeof setState==="function" && <div style={{display:"flex",gap:10,alignItems:"center",marginTop:10,flexWrap:"wrap"}}>
          <button className="btn bg bsm" onClick={saveAttempt} disabled={saved}>{saved?"✓ Saved to recent attempts":"Save this practice"}</button>
          <span style={{fontSize:11,color:"var(--ink3)"}}>Saved locally — no scoring, just your own record.</span>
        </div>}
      </div>}
    </div>}
  </div>;
}

// R12 — minimal-pair listening/pronunciation drill. Offline (browser TTS), no backend.
// Plays one of a confusable pair; the user picks which sound they heard.
const MINIMAL_PAIRS = [
  {a:"ship",b:"sheep",hint:"short /ɪ/ vs long /iː/"},
  {a:"bit",b:"beat",hint:"/ɪ/ vs /iː/"},
  {a:"full",b:"fool",hint:"/ʊ/ vs /uː/"},
  {a:"live",b:"leave",hint:"/ɪ/ vs /iː/"},
  {a:"cat",b:"cut",hint:"/æ/ vs /ʌ/"},
  {a:"three",b:"tree",hint:"/θ/ vs /t/"},
  {a:"vest",b:"west",hint:"/v/ vs /w/"},
  {a:"rice",b:"lice",hint:"/r/ vs /l/"},
  {a:"pull",b:"pool",hint:"/ʊ/ vs /uː/"},
  {a:"man",b:"men",hint:"/æ/ vs /e/"},
  {a:"thin",b:"tin",hint:"/θ/ vs /t/"},
  {a:"berry",b:"very",hint:"/b/ vs /v/"}
];
function SpeakingMinimalPairDrill({defaultOpen}) {
  const N = 8;
  const [open,setOpen] = useState(!!defaultOpen);
  const [pair,setPair] = useState(null);
  const [said,setSaid] = useState(null);   // "a" | "b"
  const [picked,setPicked] = useState(null);
  const [score,setScore] = useState(0);
  const [round,setRound] = useState(0);
  const [done,setDone] = useState(false);
  const supported = typeof window!=="undefined" && !!window.speechSynthesis;
  useEffect(()=>()=>stopSpeaking(),[]);
  const play = (p,s)=>{ if(p&&s) speakText(p[s],{rate:0.9}); };
  const nextPair = ()=>{ const p=MINIMAL_PAIRS[Math.floor(Math.random()*MINIMAL_PAIRS.length)]; const s=Math.random()<0.5?"a":"b"; setPair(p); setSaid(s); setPicked(null); setTimeout(()=>play(p,s),160); };
  const start = ()=>{ setScore(0); setRound(1); setDone(false); nextPair(); };
  const pick = (which)=>{ if(picked||!pair) return; setPicked(which); if(which===said) setScore(s=>s+1); };
  const next = ()=>{ if(round>=N){ setDone(true); setPair(null); stopSpeaking(); return; } setRound(r=>r+1); nextPair(); };
  return <div className="card" style={{marginBottom:14,borderLeft:"2px solid var(--honey)"}}>
    <div className="card-h" style={{cursor:"pointer",margin:0}} onClick={()=>setOpen(o=>!o)}>
      <div className="cdot" style={{background:"var(--honey)"}}/>Minimal-pair ear training {open?"▾":"▸"}
    </div>
    {open&&<div style={{marginTop:10}}>
      {!supported&&<div className="why" style={{color:"var(--honey)",marginBottom:8}}>Your browser has no speech synthesis, so playback won't work here.</div>}
      <div className="why" style={{marginBottom:10}}>Listen and choose which word you heard. Trains the confusable sounds (e.g. ship/sheep, rice/lice) that hurt both listening and pronunciation. No AI needed.</div>
      {!pair
        ? <div>
            {done&&<div style={{margin:"4px 0 10px",fontSize:14,color:"var(--ink)"}}>Score: <strong style={{color:score>=7?"var(--leaf)":score>=5?"var(--honey)":"var(--rose)"}}>{score} / {N}</strong></div>}
            <button className="btn bp bsm" onClick={start} disabled={!supported}>{done?"↻ New set":"Start ear training"}</button>
          </div>
        : <div>
            <div style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:"var(--ink3)",marginBottom:8}}>Item {round}/{N} · {pair.hint} · {score} ✓</div>
            <button className="btn bg bsm" onClick={()=>play(pair,said)} disabled={!supported} style={{marginBottom:10}}>▶ Play again</button>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {["a","b"].map(which=>{
                const isHeard = which===said;
                const chosen = picked===which;
                let bd="var(--border)", bg="var(--surface)";
                if(picked){ if(isHeard){bd="var(--leaf)";bg="color-mix(in srgb,var(--leaf) 12%,var(--surface))";} else if(chosen){bd="var(--rose)";bg="color-mix(in srgb,var(--rose) 12%,var(--surface))";} }
                return <button key={which} onClick={()=>pick(which)} disabled={!!picked}
                  style={{flex:"1 1 120px",fontFamily:"'Fraunces',serif",fontSize:18,color:"var(--ink)",background:bg,border:`1px solid ${bd}`,borderRadius:8,padding:"12px",cursor:picked?"default":"pointer"}}>{pair[which]}</button>;
              })}
            </div>
            {picked&&<div style={{display:"flex",gap:10,alignItems:"center",marginTop:10,flexWrap:"wrap"}}>
              <span style={{fontSize:13,color:picked===said?"var(--leaf)":"var(--rose)"}}>{picked===said?"✓ Correct":`✗ It was "${pair[said]}"`}</span>
              <button className="btn bp bsm" onClick={next}>{round>=N?"Finish":"Next →"}</button>
            </div>}
          </div>}
    </div>}
  </div>;
}

function mockRoundBand(n) {
  if (!Number.isFinite(Number(n))) return null;
  return Math.round(Number(n) * 2) / 2;
}

function mockMean(items, key) {
  const vals = (items || []).map(x => Number(x?.[key])).filter(Number.isFinite);
  if (!vals.length) return null;
  return mockRoundBand(vals.reduce((a,b)=>a+b,0) / vals.length);
}

function mockExaminerSpeak(text) {
  if (!text) return;
  try {
    if (typeof speakText === "function") {
      speakText(text, {rate:0.92, lang:"en-GB"});
      return;
    }
  } catch {}
  try {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-GB";
      u.rate = 0.92;
      window.speechSynthesis.speak(u);
    }
  } catch {}
}

function mockStopVoice() {
  try {
    if (typeof stopSpeaking === "function") stopSpeaking();
    else if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  } catch {}
}

// The reassurance a real examiner gives just before the Part-2 long turn.
const MOCK_GO_LINE = "All right. Remember, you have one to two minutes for this, so don't worry if I stop you — I'll tell you when the time is up. Please start speaking now.";

function buildMockTurns(part1Questions, part2Questions, part3Questions) {
  const p1 = (part1Questions || []).slice(0,5).map((q,i) => ({
    id: `p1-${q.id || i}`,
    part: "part1",
    label: "Part 1",
    question: q,
    question_text: q.question_text,
    expectedSec: 30,
    maxSec: 45,
    examinerLine: i === 0
      ? `Hello, and welcome to the IELTS Speaking test. I'm your examiner today. In the first part, I'd like to ask you some questions about yourself and some familiar topics. Let's begin. ${q.question_text}`
      : q.question_text
  }));

  const p2 = (part2Questions || [])[0];
  const p2Topic = p2?.topic || "this topic";
  const p2Main = p2 ? [{
    id: `p2-main-${p2.id || "cue"}`,
    part: "part2",
    label: "Part 2",
    question: p2,
    question_text: p2.question_text,
    cue_card: p2.cue_card,
    expectedSec: 120,
    maxSec: 125,
    needsPrep: true,
    examinerLine: `Now I'm going to give you a topic, and I'd like you to talk about it for one to two minutes. Before you talk, you'll have one minute to think about what you're going to say, and you can make some notes if you wish. Here is your topic: ${p2.question_text}`
  }, {
    id: `p2-round-${p2.id || "cue"}`,
    part: "part2",
    label: "Part 2 follow-up",
    question: {...p2, question_text:"Has your opinion about this changed over time?"},
    question_text: "Has your opinion about this changed over time?",
    expectedSec: 20,
    maxSec: 30,
    examinerLine: "Thank you. Has your opinion about this changed over time?"
  }] : [];

  const linked = (part3Questions || []).filter(q => q.topic === p2Topic);
  const p3Source = linked[0] || (part3Questions || [])[0];
  const p3Texts = p3Source
    ? [p3Source.question_text, ...((p3Source.follow_up || []).slice(0,3))]
    : [];
  const p3 = p3Texts.slice(0,4).map((text,i) => ({
    id: `p3-${p3Source?.id || "discussion"}-${i}`,
    part: "part3",
    label: "Part 3",
    question: {...p3Source, question_text:text},
    question_text: text,
    expectedSec: 60,
    maxSec: 80,
    examinerLine: i === 0
      ? `Thank you. We've been talking about ${p2Topic}, and I'd now like to discuss one or two more general questions related to this. ${text}`
      : text
  }));

  return [...p1, ...p2Main, ...p3];
}

function buildPartPracticeTurns(part, questions) {
  const qs = questions || [];
  if (part === "part1") {
    return qs.slice(0,5).map((q,i) => ({
      id: `practice-p1-${q.id || i}`,
      part: "part1",
      label: "Part 1",
      question: q,
      question_text: q.question_text,
      expectedSec: 30,
      maxSec: 45,
      examinerLine: i === 0
        ? `In this part, I would like to ask you some questions about yourself and familiar topics. ${q.question_text}`
        : q.question_text
    }));
  }

  if (part === "part2") {
    const q = qs[0];
    if (!q) return [];
    return [{
      id: `practice-p2-main-${q.id || "cue"}`,
      part: "part2",
      label: "Part 2",
      question: q,
      question_text: q.question_text,
      cue_card: q.cue_card,
      expectedSec: 120,
      maxSec: 125,
      needsPrep: true,
      examinerLine: `Now I am going to give you a topic, and I would like you to talk about it for one to two minutes. You have one minute to prepare. Here is your topic: ${q.question_text}`
    }, {
      id: `practice-p2-round-${q.id || "cue"}`,
      part: "part2",
      label: "Part 2 follow-up",
      question: {...q, question_text:"Would you like to do this again in the future?"},
      question_text: "Would you like to do this again in the future?",
      expectedSec: 20,
      maxSec: 30,
      examinerLine: "Thank you. Would you like to do this again in the future?"
    }];
  }

  const src = qs[0];
  if (!src) return [];
  const texts = [
    src.question_text,
    ...((src.follow_up || []).slice(0,4)),
    ...qs.slice(1).map(q => q.question_text)
  ].filter(Boolean);
  return texts.slice(0,5).map((text,i) => ({
    id: `practice-p3-${src.id || "discussion"}-${i}`,
    part: "part3",
    label: "Part 3",
    question: {...src, question_text:text},
    question_text: text,
    expectedSec: 60,
    maxSec: 80,
    examinerLine: i === 0
      ? `Now I would like to discuss some more general questions. ${text}`
      : text
  }));
}

function buildMockSummary(sessionId, turns, results) {
  const fluency = mockMean(results, "fluency_score");
  const lexical = mockMean(results, "lexical_score");
  const grammar = mockMean(results, "grammar_score");
  const pronunciation = mockMean(results, "pronunciation_score");
  const criteria = [fluency, lexical, grammar, pronunciation].filter(Number.isFinite);
  const overall = criteria.length ? mockRoundBand(criteria.reduce((a,b)=>a+b,0) / criteria.length) : mockMean(results, "overall_band");
  const transcript = (results || []).map((r,i) => {
    const t = turns[i] || r.turn || {};
    return `[${t.label || t.part || "Turn"}] Q: ${t.question_text || ""}\nA: ${r.user_transcript || ""}`;
  }).join("\n\n");
  return {
    id: sessionId || `mock-${Date.now()}`,
    date: new Date().toISOString(),
    mock:true,
    part:"mock",
    topic:"Full mock exam",
    question_text:"Full IELTS Speaking mock exam",
    overall_band: overall,
    fluency_score: fluency,
    lexical_score: lexical,
    grammar_score: grammar,
    pronunciation_score: pronunciation,
    transcript,
    durationSec: results.reduce((sum,r)=>sum + (Number(r.duration_sec) || Number(r.durationSec) || 0), 0),
    feedback:{mockTurns:results}
  };
}

function SpeakingFullMockExam({state, setState, health, backend}) {
  const [open,setOpen] = useState(false);
  const [sessionId,setSessionId] = useState("");
  const [turns,setTurns] = useState([]);
  const [idx,setIdx] = useState(0);
  const [mode,setMode] = useState("idle"); // idle | loading | prep | ready | recording | scoring | review | error
  const [prepLeft,setPrepLeft] = useState(0);
  const [elapsed,setElapsed] = useState(0);
  const [prepNotes,setPrepNotes] = useState("");
  const [results,setResults] = useState([]);
  const [summary,setSummary] = useState(null);
  const [fbLang,setFbLang] = useState("vi");
  const [adaptive,setAdaptive] = useState(true); // adaptive examiner follow-ups (Part 1/3)
  const [carefulGrade,setCarefulGrade] = useState(false);
  const [err,setErr] = useState("");
  const recRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const prepRef = useRef(null);
  const autoStopRef = useRef(false);
  const followUpsRef = useRef(0); // remaining adaptive follow-up budget for this mock

  const active = !["idle","loading","error","review"].includes(mode);
  const current = turns[idx] || null;
  const canRecord = !!health?.ok && current && mode === "ready";

  useEffect(() => () => {
    try { recRef.current?.stop?.(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepRef.current) clearInterval(prepRef.current);
    mockStopVoice();
  }, []);

  async function fetchMockQuestions(part, limit) {
    const r = await fetch(`${backend}/api/library?part=${part}&limit=${limit}`, {cache:"no-store"});
    if (!r.ok) throw new Error(`Question library ${part} failed (${r.status})`);
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  }

  function clearTimers() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (prepRef.current) { clearInterval(prepRef.current); prepRef.current = null; }
  }

  function beginPrep(turn) {
    clearTimers();
    setMode("prep");
    setPrepLeft(60);
    prepRef.current = setInterval(() => {
      setPrepLeft(t => {
        if (t <= 1) {
          clearInterval(prepRef.current);
          prepRef.current = null;
          setMode("ready");
          mockExaminerSpeak(MOCK_GO_LINE);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    if (turn?.examinerLine) mockExaminerSpeak(turn.examinerLine);
  }

  function goToTurn(nextIdx, nextTurns = turns) {
    clearTimers();
    mockStopVoice();
    const turn = nextTurns[nextIdx];
    setIdx(nextIdx);
    setElapsed(0);
    setErr("");
    setPrepNotes("");
    autoStopRef.current = false;
    if (!turn) return;
    if (turn.needsPrep) {
      setTimeout(() => beginPrep(turn), 250);
    } else {
      setMode("ready");
      setTimeout(() => mockExaminerSpeak(turn.examinerLine || turn.question_text), 250);
    }
  }

  async function startMock() {
    if (!health?.ok) {
      setErr("Full scored mock needs the Speaking backend and examiner key.");
      setOpen(true);
      return;
    }
    setOpen(true);
    setMode("loading");
    setErr("");
    setSummary(null);
    setResults([]);
    try {
      const [p1,p2,p3] = await Promise.all([
        fetchMockQuestions("part1", 10),
        fetchMockQuestions("part2", 6),
        fetchMockQuestions("part3", 10)
      ]);
      const nextTurns = buildMockTurns(p1,p2,p3);
      if (nextTurns.length < 8) throw new Error("Not enough Speaking questions. Run the Speaking backend seed script first.");
      const sid = `mock-${Date.now()}`;
      setSessionId(sid);
      followUpsRef.current = adaptive ? 4 : 0; // cap adaptive follow-ups per mock
      setTurns(nextTurns);
      goToTurn(0, nextTurns);
    } catch (e) {
      setErr(e.message || String(e));
      setMode("error");
    }
  }

  function resetMock() {
    clearTimers();
    mockStopVoice();
    try { recRef.current?.stop?.(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    setSessionId("");
    setTurns([]);
    setIdx(0);
    setMode("idle");
    setPrepLeft(0);
    setElapsed(0);
    setPrepNotes("");
    setResults([]);
    setSummary(null);
    setErr("");
    followUpsRef.current = 0;
  }

  async function startRecording() {
    if (!current) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setErr("Your browser does not support audio recording. Try Chrome or Edge.");
      return;
    }
    setErr("");
    mockStopVoice();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      streamRef.current = stream;
      const mime = pickRecorderMime();
      const mr = mime ? new MediaRecorder(stream, {mimeType:mime}) : new MediaRecorder(stream);
      chunksRef.current = [];
      autoStopRef.current = false;
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {type:mr.mimeType || "audio/webm"});
        chunksRef.current = [];
        submitTurn(blob);
      };
      mr.start(250);
      recRef.current = mr;
      setMode("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          const next = e + 1;
          if (!autoStopRef.current && current.maxSec && next >= current.maxSec) {
            autoStopRef.current = true;
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (e) {
      setErr(e.message || "Microphone permission denied.");
      setMode("ready");
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { recRef.current?.stop?.(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    setMode("scoring");
  }

  async function submitTurn(blob) {
    if (!current) { setMode("ready"); return; }
    try {
      const fd = new FormData();
      const filename = `mock-answer.${(blob.type || "").includes("ogg") ? "ogg" : (blob.type || "").includes("mp4") ? "m4a" : "webm"}`;
      fd.append("audio", blob, filename);
      fd.append("question_text", current.question_text);
      fd.append("part", current.part);
      if (current.question?.id) fd.append("question_id", current.question.id);
      let r = await fetch(`${backend}/api/transcribe-turn`, {method:"POST", body:fd});
      if (!r.ok && r.status === 404) {
        r = await fetch(`${backend}/api/score`, {method:"POST", body:fd});
      }
      if (!r.ok) {
        const txt = await r.text().catch(()=> "");
        throw new Error(`Turn processing failed (${r.status}): ${txt || "no body"}`);
      }
      const data = await r.json();
      if (data.no_speech) {
        const tip = (data.examiner_feedback?.next_steps_en || data.examiner_feedback?.next_steps_vi || []).join(" ")
          || "No speech detected. Check your microphone and try this answer again.";
        setErr(tip);
        setMode("ready");
        return;
      }
      const nextResults = [...results, {...data, turn:current}];
      setResults(nextResults);

      // Adaptive examiner follow-up: react to the answer with one natural probe
      // (Part 1 occasional / Part 3 discussion). Budget-capped; dynamic follow-up
      // turns never spawn further follow-ups; any failure quietly continues the script.
      if (adaptive && !current.dynamic && (current.part === "part1" || current.part === "part3")
          && followUpsRef.current > 0 && (data.user_transcript || "").trim()) {
        try {
          const ctx = nextResults.slice(-4).map(r => ({
            question: r.turn?.question_text || "",
            answer: r.user_transcript || ""
          }));
          const fr = await fetch(`${backend}/api/next-turn`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ part: current.part, question: current.question_text, answer: data.user_transcript || "", context: ctx })
          });
          if (fr.ok) {
            const fu = await fr.json();
            if (fu && !fu.move_on && fu.follow_up) {
              followUpsRef.current -= 1;
              const dyn = {
                id: `fu-${current.id || idx}-${nextResults.length}`,
                part: current.part,
                label: current.part === "part3" ? "Part 3 follow-up" : "Part 1 follow-up",
                question: { question_text: fu.follow_up },
                question_text: fu.follow_up,
                examinerLine: fu.follow_up,
                expectedSec: current.part === "part3" ? 50 : 25,
                maxSec: current.part === "part3" ? 75 : 45,
                dynamic: true
              };
              const newTurns = [...turns.slice(0, idx + 1), dyn, ...turns.slice(idx + 1)];
              setTurns(newTurns);
              goToTurn(idx + 1, newTurns);
              return;
            }
          }
        } catch (e) { /* fall through to the fixed script */ }
      }

      if (idx + 1 >= turns.length) {
        mockExaminerSpeak("Thank you. That is the end of the speaking test.");
        setMode("scoring");
        const nextSummary = await finalizeSession(nextResults);
        setSummary(nextSummary);
        setMode("review");
        if (typeof setState === "function") {
          setState(s => ({...s, speakingTests:[nextSummary, ...((s.speakingTests)||[])].slice(0,200)}));
        }
      } else {
        goToTurn(idx + 1);
      }
    } catch (e) {
      setErr(e.message || String(e));
      setMode("ready");
    }
  }

  // One holistic examiner pass over the WHOLE interview (Part 1+2+3). Since per-turn
  // is transcribe-only now, this is the SOLE scoring path — retry once, then fall back
  // to per-turn averages if those exist (legacy /api/score), else mark the mock
  // unscored with an honest message + a Retry button (the transcript is kept).
  async function finalizeSession(allResults) {
    const payloadTurns = allResults.map((r) => {
      const t = r.turn || {};
      return {
        part: t.part || "part1",
        question: t.question_text || "",
        transcript: r.user_transcript || "",
        acoustic_features: (r.examiner_feedback && r.examiner_feedback.acoustic_features) || null
      };
    });
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const resp = await fetch(`${backend}/api/score-session`, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ turns: payloadTurns, question_id: sessionId, scope: "full", careful_grade: carefulGrade })
        });
        if (!resp.ok) throw new Error(`session score ${resp.status}`);
        const data = await resp.json();
        if (data && data.no_speech) break; // genuine silence — don't retry or invent a band
        if (data && data.overall_band != null) {
          return {
            id: sessionId || `mock-${Date.now()}`,
            date: new Date().toISOString(),
            mock:true, holistic:true,
            part:"mock", topic:"Full mock exam",
            question_text:"Full IELTS Speaking mock exam",
            overall_band: data.overall_band,
            fluency_score: data.fluency_score,
            lexical_score: data.lexical_score,
            grammar_score: data.grammar_score,
            pronunciation_score: data.pronunciation_score,
            transcript: buildMockSummary(sessionId, turns, allResults).transcript,
            durationSec: allResults.reduce((sum,x)=>sum + (Number(x.duration_sec) || 0), 0),
            feedback: {
              holistic: data.examiner_feedback, model: data.examiner_model, mockTurns: allResults,
              grading: { mode: data.grading_mode || "standard", passes: Number(data.grading_passes) || 1, requested: !!data.careful_grade_requested }
            }
          };
        }
      } catch (e) { /* retry once */ }
    }
    const avg = buildMockSummary(sessionId, turns, allResults);
    if (avg.overall_band != null) return avg;           // legacy per-turn bands exist
    return { ...avg, holistic:false, unscored:true };    // honest: couldn't score, transcript kept
  }

  // Re-run holistic scoring on the saved turns (used by the review "Retry scoring" button).
  async function retryScore() {
    if (!results.length) return;
    setMode("scoring");
    const s = await finalizeSession(results);
    setSummary(s);
    setMode("review");
    if (typeof setState === "function") {
      setState(st => ({...st, speakingTests:[s, ...((st.speakingTests)||[]).filter(x=>x.id!==s.id)].slice(0,200)}));
    }
  }

  const progress = turns.length ? Math.round((results.length / turns.length) * 100) : 0;
  const criteriaRows = summary ? [
    ["Fluency & Coherence", summary.fluency_score],
    ["Lexical Resource", summary.lexical_score],
    ["Grammar Range & Accuracy", summary.grammar_score],
    ["Pronunciation", summary.pronunciation_score]
  ] : [];

  return <div className="card" style={{marginBottom:14,borderLeft:"2px solid var(--orchid)"}}>
    <div className="card-h" style={{cursor:"pointer",margin:0}} onClick={()=>setOpen(o=>!o)}>
      <div className="cdot" style={{background:"var(--orchid)"}}/>Full Mock Exam {open?"hide":"show"}
    </div>
    {open&&<div style={{marginTop:10}}>
      <div className="why" style={{marginBottom:10}}>
        Examiner-led Speaking simulation: fixed Part 1, Part 2, and Part 3 sequence, no coaching during the test, feedback hidden until the final review.
      </div>
      {!active&&mode!=="review"&&<div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <button className="btn bp bsm" onClick={startMock} disabled={!health?.ok || mode==="loading"}>
          {mode==="loading" ? "Preparing mock..." : "Start full mock"}
        </button>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11.5,color:"var(--ink2)",cursor:"pointer"}} title="The examiner reacts to your answers with natural follow-up questions (Part 1 & 3), like a real test.">
          <input type="checkbox" checked={adaptive} onChange={e=>setAdaptive(e.target.checked)}/>
          Adaptive examiner follow-ups
        </label>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11.5,color:"var(--ink2)",cursor:"pointer"}} title="Runs three independent holistic grades and uses the median. It takes longer and uses about three times the examiner quota.">
          <input type="checkbox" checked={carefulGrade} onChange={e=>setCarefulGrade(e.target.checked)}/>
          Careful grade (3x)
        </label>
        {!health?.ok&&<span style={{fontSize:11,color:"var(--ink3)"}}>Needs Speaking backend + examiner key for scored recording.</span>}
      </div>}
      {mode==="error"&&err&&<div className="why" style={{color:"var(--rose)",marginTop:8}}>{err}</div>}

      {active&&mode!=="review"&&current&&<div style={{marginTop:12}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
          <span style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:"var(--ink3)"}}>TURN {idx+1}/{turns.length}</span>
          <span className="chip" style={{fontSize:10}}>{current.label}</span>
          <span style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:"var(--ink3)"}}>{progress}% complete</span>
          <button className="btn bg bsm" onClick={()=>mockExaminerSpeak(current.examinerLine || current.question_text)}>Play examiner line</button>
          <button className="btn bg bsm" onClick={resetMock}>Exit mock</button>
        </div>
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Examiner</div>
          <div style={{fontSize:16,color:"var(--ink)",lineHeight:1.45}}>{current.question_text}</div>
          {current.cue_card?.bullets&&<div style={{marginTop:10}}>
            <div style={{fontSize:11,color:"var(--ink3)",marginBottom:4}}>You should say:</div>
            <ul style={{margin:0,paddingLeft:18,fontSize:13,color:"var(--ink2)",lineHeight:1.55}}>
              {current.cue_card.bullets.map((b,i)=><li key={i}>{b}</li>)}
            </ul>
          </div>}
        </div>
        {current.needsPrep&&mode==="prep"&&<div style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
            <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Preparation</span>
            <span style={{fontFamily:"'Geist Mono',monospace",fontSize:18,color:prepLeft<=10?"var(--rose)":"var(--ink)"}}>{formatTimer(prepLeft)}</span>
            <button className="btn bp bsm" onClick={()=>{ clearTimers(); setPrepLeft(0); setMode("ready"); mockExaminerSpeak(MOCK_GO_LINE); }}>Start speaking now</button>
          </div>
          <textarea className="era-input" value={prepNotes} onChange={e=>setPrepNotes(e.target.value)} rows="2" placeholder="Private notes for your 1-minute prep..." style={{resize:"vertical"}}/>
        </div>}
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginTop:12}}>
          {canRecord&&<button className="btn bp" onClick={startRecording}>Record answer</button>}
          {mode==="recording"&&<button className="btn bsm" style={{background:"var(--rose)",color:"var(--bg)",border:"none"}} onClick={stopRecording}>Stop and submit</button>}
          {(mode==="recording"||mode==="scoring")&&<span style={{fontFamily:"'Geist Mono',monospace",fontSize:14,color:"var(--ink2)"}}>
            {mode==="recording" ? `REC ${formatTimer(elapsed)}` : "Processing turn... feedback hidden"}
          </span>}
          {mode==="ready"&&<span style={{fontSize:11,color:"var(--ink3)"}}>Target about {formatTimer(current.expectedSec)}. The mock auto-stops near {formatTimer(current.maxSec)}.</span>}
        </div>
        {err&&<div className="why" style={{color:"var(--rose)",marginTop:8}}>{err}</div>}
      </div>}

      {mode==="review"&&summary&&<div style={{marginTop:12}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:10,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".12em",textTransform:"uppercase"}}>Mock Overall</div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:44,lineHeight:1,color:"var(--ink)"}}>{formatBand(summary.overall_band)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,flex:1,minWidth:280}}>
            {criteriaRows.map(([label,val])=><div key={label} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 10px"}}>
              <div style={{fontSize:10,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>{label}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:21,color:"var(--ink)"}}>{formatBand(val)}</div>
            </div>)}
          </div>
        </div>
        <div className="why" style={{marginTop:10}}>
          {summary.unscored
            ? "Couldn't score this mock — the examiner service didn't respond. Your full transcript is saved below; press Retry scoring to try again."
            : summary.holistic
              ? summary.feedback?.grading?.mode === "careful"
                ? `Median of ${summary.feedback.grading.passes} independent holistic examiner grades. ≈ Pronunciation is inferred from transcript + pace only.`
                : "One holistic examiner score across your whole interview (Part 1 + 2 + 3), using the official band descriptors. ≈ Pronunciation is inferred from transcript + pace only."
              : "Per-turn scores were averaged (holistic session scoring was unavailable). ≈ Pronunciation is inferred from transcript + pace only."}
        </div>
        {summary.unscored && <div style={{marginTop:8}}>
          <button className="btn bp bsm" onClick={retryScore} disabled={mode==="scoring"}>{mode==="scoring" ? "Scoring…" : "↻ Retry scoring"}</button>
        </div>}

        {summary.feedback?.holistic && (() => {
          const fb = summary.feedback.holistic;
          const en = fbLang === "en";
          const fbObj = (en && fb.feedback_en && Object.values(fb.feedback_en).some(a=>a&&a.length)) ? fb.feedback_en : fb.feedback_vi;
          const steps = (en && fb.next_steps_en?.length) ? fb.next_steps_en : fb.next_steps_vi;
          const g = fb.band_gap || {};
          const why = (en && g.why_not_higher_en) ? g.why_not_higher_en : g.why_not_higher_vi;
          const toImprove = (en && g.to_improve_en?.length) ? g.to_improve_en : g.to_improve_vi;
          return <div style={{marginTop:12}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Examiner feedback</span>
              <div style={{marginLeft:"auto",display:"inline-flex",border:"1px solid var(--border)",borderRadius:7,overflow:"hidden"}}>
                <button className="btn bsm" style={{borderRadius:0,border:"none",background:fbLang==="vi"?"var(--leaf)":"transparent",color:fbLang==="vi"?"var(--bg)":"var(--ink2)"}} onClick={()=>setFbLang("vi")}>VI</button>
                <button className="btn bsm" style={{borderRadius:0,border:"none",background:fbLang==="en"?"var(--leaf)":"transparent",color:fbLang==="en"?"var(--bg)":"var(--ink2)"}} onClick={()=>setFbLang("en")}>EN</button>
              </div>
            </div>
            {g.weakest_criterion && <div style={{marginBottom:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--orchid)",borderRadius:8}}>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",textTransform:"uppercase",letterSpacing:".08em"}}>{en?"Closest next band":"Gần band kế tiếp"}</span>
                <span style={{fontSize:13,color:"var(--ink)",fontWeight:600}}>{g.weakest_criterion}</span>
                <span style={{fontFamily:"'Fraunces',serif",fontSize:16,color:"var(--ink)"}}>{formatBand(g.current_band)} → {formatBand(g.next_band)}</span>
              </div>
              {why && <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.5,marginBottom:6}}>{why}</div>}
              {toImprove?.length>0 && <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.5}}>{toImprove.map((x,i)=><li key={i}>{x}</li>)}</ul>}
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
              {Object.entries(fbObj||{}).map(([k,bullets])=><div key={k} style={{padding:"10px 12px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
                <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{FEEDBACK_KEY_MAP[k]||k}</div>
                <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.5}}>{(bullets||[]).map((b,i)=><li key={i}>{b}</li>)}</ul>
                {fb.evidence?.[k]?.length>0 && <div style={{marginTop:6,fontSize:11,color:"var(--ink3)"}}><em>Evidence:</em> {fb.evidence[k].map((e,i)=><span key={i} style={{display:"inline-block",margin:"2px 4px 2px 0",padding:"1px 6px",background:"var(--bg2,#f5f5f7)",borderRadius:4,fontStyle:"italic"}}>"{e}"</span>)}</div>}
              </div>)}
            </div>
            {steps?.length>0 && <div style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--leaf)",borderRadius:8}}>
              <div style={{fontSize:11,color:"var(--leaf)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{en?"Next steps":"Bước tiếp theo"}</div>
              <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.5}}>{steps.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>}
          </div>;
        })()}

        {(() => {
          const turnReviews = (summary.feedback?.mockTurns || results || []).filter(Boolean);
          if (!turnReviews.length) return null;
          return <div style={{marginTop:12,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
            <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Turn-by-turn coaching</span>
              <span style={{fontSize:11,color:"var(--ink3)"}}>Delivery checks and model answers stay on demand, so review does not add automatic LLM cost.</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {turnReviews.map((r,i) => {
                const t = r.turn || turns[i] || {};
                const q = {
                  ...((t && t.question) || {}),
                  part: t.part || r.part || "part1",
                  question_text: t.question_text || r.question_text || ""
                };
                const feats = r.examiner_feedback?.acoustic_features;
                const clarity = (r.word_clarity && r.word_clarity.length)
                  ? r.word_clarity
                  : ((r.transcript && r.transcript.word_timestamps) || []);
                return <details key={t.id || r.question_id || i} open={i===0} style={{padding:"9px 10px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8}}>
                  <summary style={{cursor:"pointer",fontSize:12.5,color:"var(--ink)",fontWeight:600}}>
                    {(t.label || q.part || `Turn ${i+1}`)} <span style={{color:"var(--ink3)",fontWeight:400}}>· {q.question_text || "Untitled question"}</span>
                  </summary>
                  <div style={{marginTop:8,display:"grid",gap:8}}>
                    {q.question_text && <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.5}}>
                      <strong style={{color:"var(--ink)"}}>Question:</strong> {q.question_text}
                    </div>}
                    <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.55}}>
                      <strong style={{color:"var(--ink)"}}>Your answer:</strong> {r.user_transcript || "No transcript captured."}
                    </div>
                    {feats && <DeliveryLexisCoach feats={feats} transcript={r.user_transcript} lang={fbLang}/>}
                    {clarity.length > 0 && <ClarityHeatmap words={clarity} lang={fbLang}/>}
                    {q.question_text && <ModelAnswerPanel question={q} transcript={r.user_transcript} backend={backend} state={state} setState={setState}/>}
                  </div>
                </details>;
              })}
            </div>
          </div>;
        })()}

        <details style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
          <summary style={{cursor:"pointer",fontSize:12,color:"var(--ink2)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Turn transcript summary</summary>
          <pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",fontSize:12.5,color:"var(--ink)",lineHeight:1.55,margin:"8px 0 0"}}>{summary.transcript}</pre>
        </details>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          <button className="btn bp bsm" onClick={startMock}>Start another mock</button>
          <button className="btn bg bsm" onClick={resetMock}>Close mock</button>
        </div>
      </div>}
    </div>}
  </div>;
}

const FEEDBACK_KEY_MAP = {
  fluency_coherence: "Fluency & Coherence",
  lexical_resource: "Lexical Resource",
  grammatical_range_accuracy: "Grammatical Range & Accuracy",
  pronunciation: "Pronunciation"
};

function getSpeakingBackend(state) {
  const url = (state && state.speakingBackendUrl) || DEFAULT_SPEAKING_BACKEND;
  return String(url).replace(/\/+$/, "");
}

function formatBand(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  return (Math.round(v * 2) / 2).toFixed(1);
}

function formatTimer(secs) {
  const s = Math.max(0, Math.floor(secs || 0));
  const mm = String(Math.floor(s/60)).padStart(2,"0");
  const ss = String(s%60).padStart(2,"0");
  return `${mm}:${ss}`;
}

function pickRecorderMime() {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
  for (const m of candidates) {
    try { if (MediaRecorder.isTypeSupported(m)) return m; } catch {}
  }
  return "";
}

// ── Delivery & lexis coach ────────────────────────────────────────────
// Turns the per-answer acoustic/lexical metrics + transcript into descriptor-aligned
// coaching: pace, fillers, linker range, lexical variety, hesitation, and overused
// basic words ("very", "good"…) → stronger choices. Pure client-side, no LLM.
const _BASIC_UPGRADES = {
  very: ["incredibly", "extremely", "remarkably"],
  really: ["genuinely", "truly", "particularly"],
  good: ["beneficial", "worthwhile", "rewarding", "excellent"],
  bad: ["harmful", "detrimental", "poor"],
  big: ["major", "significant", "substantial"],
  nice: ["pleasant", "enjoyable", "lovely"],
  important: ["crucial", "vital", "essential"],
  thing: ["aspect", "factor", "element"],
  get: ["obtain", "gain", "acquire"],
  happy: ["delighted", "content", "thrilled"],
  hard: ["challenging", "demanding", "tough"],
  interesting: ["fascinating", "intriguing", "compelling"]
};
const _COACH_STOP = new Set(("the a an and or but to of in on at for with is are was were be been i you he she it we they my your "
  + "this that these those so as if then there here have has had do does did not no yes just will would can could about from "
  + "me him her us our out up down all some any one two more most much many because however really very like").split(" "));

function _deliveryChecks(feats, transcript) {
  const a = feats || {};
  const words = String(transcript || "").toLowerCase().match(/[a-z']+/g) || [];
  const wc = Number(a.word_count) || words.length || 0;
  const count = (w) => words.filter(x => x === w).length;
  const checks = [];
  const push = (key, status, en, vi) => checks.push({ key, status, en, vi });

  const wpm = Number(a.wpm) || 0;
  if (wpm) {
    if (wpm >= 110 && wpm <= 170) push("Pace", "good", `Natural pace (${wpm} wpm).`, `Tốc độ tự nhiên (${wpm} từ/phút).`);
    else if (wpm < 110) push("Pace", "warn", `A bit slow (${wpm} wpm) — keep ideas flowing.`, `Hơi chậm (${wpm} từ/phút) — giữ mạch nói liền hơn.`);
    else push("Pace", "warn", `A bit fast (${wpm} wpm) — slow down for clarity.`, `Hơi nhanh (${wpm} từ/phút) — chậm lại cho rõ.`);
  }

  const fp = Number(a.filler_per_100w) || 0;
  if (fp <= 3) push("Fillers", "good", `Few fillers (${fp}/100w).`, `Ít từ đệm (${fp}/100 từ).`);
  else if (fp <= 6) push("Fillers", "warn", `Some fillers (${fp}/100w) — watch "um / like / you know".`, `Khá nhiều từ đệm (${fp}/100 từ) — để ý "um / like / you know".`);
  else push("Fillers", "bad", `Too many fillers (${fp}/100w) — pause silently instead.`, `Quá nhiều từ đệm (${fp}/100 từ) — thay bằng dừng im lặng.`);

  const conn = Number(a.connective_count) || 0;
  if (conn >= 2) push("Linking", "good", `Good range of linkers (${conn}).`, `Dùng linker đa dạng (${conn}).`);
  else push("Linking", "warn", `Few discourse markers — connect ideas (because, however, for instance), but don't overdo it.`, `Ít từ nối — kết nối ý (because, however, for instance), nhưng đừng lạm dụng.`);

  const ttr = Number(a.type_token_ratio) || 0;
  if (wc >= 40) {
    if (ttr >= 0.5) push("Variety", "good", `Varied vocabulary (TTR ${ttr}).`, `Từ vựng đa dạng (TTR ${ttr}).`);
    else if (ttr >= 0.4) push("Variety", "warn", `Some repetition (TTR ${ttr}) — vary your words.`, `Hơi lặp từ (TTR ${ttr}) — đa dạng hơn.`);
    else push("Variety", "bad", `Repetitive vocabulary (TTR ${ttr}) — use synonyms / collocations.`, `Lặp từ nhiều (TTR ${ttr}) — dùng từ đồng nghĩa / collocation.`);
  }

  const lp = Number(a.long_pause_count) || 0;
  if (lp <= 1) push("Flow", "good", `Smooth — few long pauses.`, `Trôi chảy — ít khoảng lặng dài.`);
  else if (lp <= 3) push("Flow", "warn", `${lp} long pauses — keep going to stay fluent.`, `${lp} khoảng lặng dài — nói tiếp để giữ trôi chảy.`);
  else push("Flow", "bad", `${lp} long pauses — hesitation is hurting fluency.`, `${lp} khoảng lặng dài — ngập ngừng làm giảm trôi chảy.`);

  // Naturalness, NOT "use advanced words": only flag a basic word you LEAN ON a lot
  // (>=3x), and frame it as varying for natural-sounding speech — the alternatives are
  // common, natural choices, not bigger/fancier vocabulary.
  const upgrades = [];
  for (const w of Object.keys(_BASIC_UPGRADES)) {
    const c = count(w);
    if (c >= 3) upgrades.push({ word: w, n: c, alts: _BASIC_UPGRADES[w] });
  }
  if (upgrades.length) push("Word variety", "warn", `You leaned on a few basic words a lot — vary them so it sounds more natural (no need for "big" words).`, `Bạn lặp vài từ cơ bản khá nhiều — đổi cách diễn đạt cho tự nhiên hơn (không cần từ "to tát").`);

  const freq = {};
  for (const w of words) { if (w.length > 3 && !_COACH_STOP.has(w) && !_BASIC_UPGRADES[w]) freq[w] = (freq[w] || 0) + 1; }
  let topW = null, topN = 0;
  for (const w in freq) { if (freq[w] > topN) { topN = freq[w]; topW = w; } }
  if (wc >= 30 && topN >= 4 && topW) push("Repetition", "warn", `You said "${topW}" ${topN} times — paraphrase it.`, `Bạn nói "${topW}" ${topN} lần — hãy diễn đạt khác đi.`);

  return { checks, upgrades };
}

function DeliveryLexisCoach({ feats, transcript, lang }) {
  if (!feats) return null;
  const { checks, upgrades } = _deliveryChecks(feats, transcript);
  if (!checks.length) return null;
  const en = lang === "en";
  const dot = (s) => s === "good" ? "var(--leaf)" : s === "warn" ? "var(--honey)" : "var(--rose)";
  return <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
    <div style={{ fontSize: 11, color: "var(--ink3)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>{en ? "Delivery & lexis coach" : "Cách nói & từ vựng"}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {checks.map((c, i) => <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot(c.status), marginTop: 5, flex: "0 0 auto" }} />
        <span style={{ fontSize: 12.5, color: "var(--ink)", lineHeight: 1.5 }}><strong style={{ color: "var(--ink2)" }}>{c.key}:</strong> {en ? c.en : c.vi}</span>
      </div>)}
    </div>
    {upgrades.length > 0 && <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 11, color: "var(--ink3)", marginBottom: 5 }}>{en ? "Natural alternatives (for variety, not to sound fancier):" : "Cách nói khác cho tự nhiên (để đa dạng, không phải để màu mè):"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {upgrades.map((u, i) => <span key={i} style={{ fontSize: 11.5, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, padding: "3px 9px", color: "var(--ink2)" }}>
          <span style={{ color: "var(--rose)", textDecoration: "line-through" }}>{u.word}</span> ×{u.n} → <span style={{ color: "var(--leaf)" }}>{u.alts.slice(0, 3).join(", ")}</span>
        </span>)}
      </div>
    </div>}
  </div>;
}

// Clarity heatmap — colour each transcript word by ASR confidence. Low confidence
// flags a word that came through unclearly (possible mispronunciation). Honest,
// approximate signal from the recogniser, NOT an official pronunciation score.
function ClarityHeatmap({ words, lang }) {
  if (!words || !words.length) return null;
  const en = lang === "en";
  const low = words.filter(w => Number(w.p) < 0.6);
  const col = (p) => p >= 0.75 ? "var(--ink)" : p >= 0.6 ? "var(--honey)" : "var(--rose)";
  const bg = (p) => p >= 0.75 ? "transparent" : p >= 0.6 ? "color-mix(in srgb, var(--honey) 16%, transparent)" : "color-mix(in srgb, var(--rose) 18%, transparent)";
  return <details style={{ marginTop: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
    <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--ink2)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase" }}>
      {en ? "Clarity heatmap" : "Bản đồ độ rõ"}{low.length ? ` · ${low.length} ${en ? "less clear" : "chưa rõ"}` : ""}
    </summary>
    <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.9 }}>
      {words.map((w, i) => <span key={i} title={`confidence ${Math.round(Number(w.p) * 100)}%`}
        style={{ color: col(w.p), background: bg(w.p), borderRadius: 4, padding: "1px 3px", marginRight: 2 }}>{w.w}</span>)}
    </div>
    <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "var(--ink3)" }}>
      <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "var(--honey)", marginRight: 4 }} />{en ? "slightly unclear" : "hơi chưa rõ"}</span>
      <span><span style={{ display: "inline-block", width: 9, height: 9, borderRadius: 2, background: "var(--rose)", marginRight: 4 }} />{en ? "unclear / check pronunciation" : "chưa rõ / kiểm tra phát âm"}</span>
    </div>
    <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink3)", lineHeight: 1.5 }}>
      {en
        ? "Approximate signal from the speech recogniser (how confidently each word was recognised), not an official pronunciation score. Highlighted words may be unclear, mispronounced, or just uncommon — practise them aloud."
        : "Tín hiệu ước lượng từ bộ nhận dạng giọng nói (mức độ nhận ra mỗi từ), không phải điểm phát âm chính thức. Từ được tô có thể chưa rõ, sai phát âm, hoặc chỉ là từ ít gặp — hãy luyện đọc to."}
    </div>
  </details>;
}

// Hesitation & pauses — annotate the transcript inline: filler words + self-corrections
// now; silent-pause markers auto-appear once per-word start/end timing is in word_clarity.
const _FILLER_WORDS = new Set(["uh", "um", "er", "erm", "hmm", "uhm", "like"]);
function _buildHesitationTokens(score) {
  const wc = (score && Array.isArray(score.word_clarity) && score.word_clarity.length) ? score.word_clarity : null;
  const raw = wc
    ? wc.map(x => ({ w: String(x.w || ""), start: x.start, end: x.end }))
    : String((score && score.user_transcript) || "").split(/\s+/).filter(Boolean).map(w => ({ w }));
  const norm = (w) => String(w || "").toLowerCase().replace(/[^a-z']/g, "");
  const tokens = [];
  let prevEnd = null, prevNorm = "", prevW = "";
  for (let i = 0; i < raw.length; i++) {
    const n = norm(raw[i].w);
    let filler = _FILLER_WORDS.has(n);
    if (n === "you" && norm(raw[i + 1] && raw[i + 1].w) === "know") filler = true;
    if (n === "know" && prevNorm === "you") filler = true;
    const selfcorr = !!n && n === prevNorm && !filler;
    let pauseBefore = "none", pauseType = null;
    if (typeof raw[i].start === "number" && typeof prevEnd === "number") {
      const gap = raw[i].start - prevEnd;
      if (gap > 1.0) pauseBefore = "long"; else if (gap > 0.4) pauseBefore = "short";
      if (pauseBefore !== "none") {
        // Natural = the previous word ended at a clause/sentence boundary (planning/breath);
        // otherwise it's a mid-clause "language-searching" pause = real hesitation.
        pauseType = /[.,!?;:]$/.test(prevW.trim()) ? "natural" : "searching";
      }
    }
    tokens.push({ w: raw[i].w, filler, selfcorr, pauseBefore, pauseType });
    prevEnd = (typeof raw[i].end === "number") ? raw[i].end : prevEnd;
    prevNorm = n;
    prevW = raw[i].w;
  }
  return tokens;
}

function HesitationMap({ score, lang }) {
  const a = (score && score.examiner_feedback && score.examiner_feedback.acoustic_features) || {};
  const tokens = _buildHesitationTokens(score);
  if (!tokens.length) return null;
  const en = lang === "en";
  const hasTiming = tokens.some(t => t.pauseBefore !== "none");
  const fillerN = Number(a.filler_count) || tokens.filter(t => t.filler).length;
  const scN = Number(a.self_correction_count) || tokens.filter(t => t.selfcorr).length;
  const pauseN = Number(a.pause_count) || 0, longN = Number(a.long_pause_count) || 0;
  const searchN = tokens.filter(t => t.pauseType === "searching").length;
  const naturalN = tokens.filter(t => t.pauseType === "natural").length;
  return <details style={{ marginTop: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
    <summary style={{ cursor: "pointer", fontSize: 12, color: "var(--ink2)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase" }}>
      {en ? "Hesitation & pauses" : "Ngập ngừng & khoảng lặng"} · {pauseN} {en ? "pauses" : "lặng"} ({longN} {en ? "long" : "dài"}) · {fillerN} {en ? "fillers" : "từ đệm"}{scN ? ` · ${scN} ${en ? "repeats" : "lặp"}` : ""}{hasTiming && searchN ? ` · ${searchN} ${en ? "searching" : "tìm-từ"}` : ""}
    </summary>
    <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.95 }}>
      {tokens.map((t, i) => <span key={i}>
        {t.pauseBefore !== "none" && <span title={(t.pauseType === "searching" ? (en ? "language-searching pause" : "ngập ngừng tìm-từ") : (en ? "natural pause" : "khoảng lặng tự nhiên")) + (t.pauseBefore === "long" ? " (long)" : "")} style={{ color: t.pauseType === "searching" ? "var(--rose)" : "var(--ink3)", margin: "0 2px", fontWeight: 700 }}>{t.pauseBefore === "long" ? "…" : "·"}</span>}
        <span style={{
          background: t.filler ? "color-mix(in srgb, var(--honey) 22%, transparent)" : t.selfcorr ? "color-mix(in srgb, var(--rose) 18%, transparent)" : "transparent",
          borderBottom: t.filler ? "1.5px solid var(--honey)" : t.selfcorr ? "1.5px solid var(--rose)" : "none",
          borderRadius: 3, padding: "0 1px", marginRight: 3, color: "var(--ink)"
        }}>{t.w}</span>
      </span>)}
    </div>
    <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "var(--ink3)" }}>
      <span><span style={{ borderBottom: "1.5px solid var(--honey)" }}>filler</span> (um/uh/like…)</span>
      <span><span style={{ borderBottom: "1.5px solid var(--rose)" }}>repeat</span> {en ? "self-correction" : "tự sửa/lặp"}</span>
      {hasTiming
        ? <span><span style={{ color: "var(--rose)", fontWeight: 700 }}>…·</span> {en ? "language-searching pause (mid-sentence)" : "ngập ngừng tìm-từ (giữa câu)"}</span>
        : <span>{en ? "(silent-pause markers appear once per-word timing is available)" : "(điểm khoảng lặng hiện khi có thời gian per-từ)"}</span>}
      {hasTiming && <span><span style={{ color: "var(--ink3)", fontWeight: 700 }}>…·</span> {en ? "natural pause (at a boundary)" : "khoảng lặng tự nhiên (ở ranh giới câu)"}</span>}
    </div>
    {hasTiming && searchN > 0 && <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--ink2)", lineHeight: 1.5 }}>
      {en
        ? `${searchN} of your ${searchN + naturalN} pauses were mid-sentence (language-searching). Natural pauses to plan your idea are fine; try to pause at clause boundaries instead of in the middle of one.`
        : `${searchN}/${searchN + naturalN} khoảng lặng là giữa câu (tìm-từ). Lặng để nghĩ ý là bình thường; hãy dừng ở ranh giới mệnh đề thay vì giữa câu.`}
    </div>}
  </details>;
}

// Render text with **bold** markers as accent-highlighted spans (model-answer style).
function _renderBoldHighlights(text) {
  return String(text || "").split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    (p.startsWith("**") && p.endsWith("**"))
      ? <strong key={i} style={{color:"var(--leaf)",fontWeight:600}}>{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  );
}

// On-demand Band-7 model answer (key collocations highlighted) + Vietnamese
// translation + one-tap-save collocations. Mirrors the user's bilingual reference bank.
function ModelAnswerPanel({question, transcript, backend, state, setState}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [lang, setLang] = useState("en"); // en | vi
  if (!question) return null;

  async function load() {
    setLoading(true); setErr("");
    try {
      const r = await fetch(`${backend}/api/model-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.question_text, part: question.part, transcript: transcript || "" })
      });
      if (!r.ok) throw new Error(`Model answer failed (${r.status})`);
      setData(await r.json());
    } catch (e) { setErr(e.message || String(e)); }
    finally { setLoading(false); }
  }

  if (!data) {
    return <div style={{ marginTop: 12 }}>
      <button className="btn bp bsm" onClick={load} disabled={loading}>
        {loading ? "Writing a model answer…" : "✨ Show a band-7 model answer"}
      </button>
      <span style={{ fontSize: 11, color: "var(--ink3)", marginLeft: 8 }}>See how a Band 7-8 candidate would answer this, and save the collocations.</span>
      {err && <div className="why" style={{ color: "var(--rose)", marginTop: 6 }}>{err}</div>}
    </div>;
  }

  const body = lang === "vi" ? data.answer_vi : data.answer_en;
  return <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--leaf)", borderRadius: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "var(--leaf)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase" }}>✨ Band-7 model answer</span>
      <div style={{ marginLeft: "auto", display: "inline-flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
        <button className="btn bsm" style={{ borderRadius: 0, border: "none", background: lang === "en" ? "var(--leaf)" : "transparent", color: lang === "en" ? "var(--bg)" : "var(--ink2)" }} onClick={() => setLang("en")}>EN</button>
        <button className="btn bsm" style={{ borderRadius: 0, border: "none", background: lang === "vi" ? "var(--leaf)" : "transparent", color: lang === "vi" ? "var(--bg)" : "var(--ink2)" }} onClick={() => setLang("vi")}>VI</button>
      </div>
    </div>
    <p style={{ margin: 0, fontSize: 14, color: "var(--ink)", lineHeight: 1.6 }}>{_renderBoldHighlights(body)}</p>
    {data.collocations?.length > 0 && <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11, color: "var(--ink3)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>Key collocations · save to study</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.collocations.map((c, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, padding: "6px 9px" }}>
          <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{c.phrase}</span>
          {c.meaning_vi && <span style={{ fontSize: 12, color: "var(--ink2)" }}>— {c.meaning_vi}</span>}
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <SpeakButton text={c.phrase} />
            <SaveButton state={state} setState={setState} withLabel item={{ type: "vocab", title: c.phrase, body: c.meaning_vi || "", source: "Speaking · Model answer", key: "lexis:" + c.phrase.toLowerCase() }} />
          </div>
        </div>)}
      </div>
    </div>}
    <div style={{ marginTop: 10 }}>
      <button className="btn bg bsm" onClick={() => { setData(null); setErr(""); }}>↻ Regenerate</button>
    </div>
  </div>;
}

function SpeakingPartPracticeSession({state, setState, health, backend, part}) {
  const partMeta = SPEAKING_PARTS.find(p => p.id === part) || SPEAKING_PARTS[0];
  const [open,setOpen] = useState(false);
  const [sessionPart,setSessionPart] = useState(part);
  const [sessionId,setSessionId] = useState("");
  const [turns,setTurns] = useState([]);
  const [idx,setIdx] = useState(0);
  const [mode,setMode] = useState("idle"); // idle | loading | prep | ready | recording | scoring | review | error
  const [prepLeft,setPrepLeft] = useState(0);
  const [elapsed,setElapsed] = useState(0);
  const [prepNotes,setPrepNotes] = useState("");
  const [results,setResults] = useState([]);
  const [summary,setSummary] = useState(null);
  const [fbLang,setFbLang] = useState("vi");
  const [adaptive,setAdaptive] = useState(true);
  const [carefulGrade,setCarefulGrade] = useState(false);
  const [err,setErr] = useState("");
  const recRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const prepRef = useRef(null);
  const autoStopRef = useRef(false);
  const followUpsRef = useRef(0);

  const active = !["idle","loading","error","review"].includes(mode);
  const current = turns[idx] || null;
  const canRecord = !!health?.ok && current && mode === "ready";
  const activeMeta = SPEAKING_PARTS.find(p => p.id === sessionPart) || partMeta;

  useEffect(() => () => {
    try { recRef.current?.stop?.(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepRef.current) clearInterval(prepRef.current);
    mockStopVoice();
  }, []);

  useEffect(() => {
    if (mode !== "idle") resetPractice(false);
  }, [part]);

  async function fetchPartQuestions(targetPart, limit) {
    const r = await fetch(`${backend}/api/library?part=${targetPart}&limit=${limit}`, {cache:"no-store"});
    if (!r.ok) throw new Error(`Question library ${targetPart} failed (${r.status})`);
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  }

  function clearTimers() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (prepRef.current) { clearInterval(prepRef.current); prepRef.current = null; }
  }

  function beginPrep(turn) {
    clearTimers();
    setMode("prep");
    setPrepLeft(60);
    prepRef.current = setInterval(() => {
      setPrepLeft(t => {
        if (t <= 1) {
          clearInterval(prepRef.current);
          prepRef.current = null;
          setMode("ready");
          mockExaminerSpeak(MOCK_GO_LINE);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    if (turn?.examinerLine) mockExaminerSpeak(turn.examinerLine);
  }

  function goToTurn(nextIdx, nextTurns = turns) {
    clearTimers();
    mockStopVoice();
    const turn = nextTurns[nextIdx];
    setIdx(nextIdx);
    setElapsed(0);
    setErr("");
    setPrepNotes("");
    autoStopRef.current = false;
    if (!turn) return;
    if (turn.needsPrep) {
      setTimeout(() => beginPrep(turn), 250);
    } else {
      setMode("ready");
      setTimeout(() => mockExaminerSpeak(turn.examinerLine || turn.question_text), 250);
    }
  }

  async function startPractice() {
    if (!health?.ok) {
      setErr("Part Practice needs the Speaking backend and examiner key.");
      setOpen(true);
      return;
    }
    const targetPart = part;
    setOpen(true);
    setSessionPart(targetPart);
    setMode("loading");
    setErr("");
    setSummary(null);
    setResults([]);
    try {
      const limit = targetPart === "part2" ? 6 : 10;
      const qs = await fetchPartQuestions(targetPart, limit);
      const nextTurns = buildPartPracticeTurns(targetPart, qs);
      const minTurns = targetPart === "part2" ? 1 : 3;
      if (nextTurns.length < minTurns) throw new Error("Not enough Speaking questions for this part. Run the Speaking backend seed script first.");
      const sid = `${targetPart}-practice-${Date.now()}`;
      setSessionId(sid);
      followUpsRef.current = adaptive ? (targetPart === "part3" ? 3 : targetPart === "part1" ? 2 : 0) : 0;
      setTurns(nextTurns);
      goToTurn(0, nextTurns);
    } catch (e) {
      setErr(e.message || String(e));
      setMode("error");
    }
  }

  function resetPractice(close = false) {
    clearTimers();
    mockStopVoice();
    try { recRef.current?.stop?.(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    setSessionId("");
    setTurns([]);
    setIdx(0);
    setMode("idle");
    setPrepLeft(0);
    setElapsed(0);
    setPrepNotes("");
    setResults([]);
    setSummary(null);
    setErr("");
    followUpsRef.current = 0;
    if (close) setOpen(false);
  }

  async function startRecording() {
    if (!current) return;
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setErr("Your browser does not support audio recording. Try Chrome or Edge.");
      return;
    }
    setErr("");
    mockStopVoice();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      streamRef.current = stream;
      const mime = pickRecorderMime();
      const mr = mime ? new MediaRecorder(stream, {mimeType:mime}) : new MediaRecorder(stream);
      chunksRef.current = [];
      autoStopRef.current = false;
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, {type:mr.mimeType || "audio/webm"});
        chunksRef.current = [];
        submitTurn(blob);
      };
      mr.start(250);
      recRef.current = mr;
      setMode("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(e => {
          const next = e + 1;
          if (!autoStopRef.current && current.maxSec && next >= current.maxSec) {
            autoStopRef.current = true;
            stopRecording();
          }
          return next;
        });
      }, 1000);
    } catch (e) {
      setErr(e.message || "Microphone permission denied.");
      setMode("ready");
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { recRef.current?.stop?.(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    setMode("scoring");
  }

  async function submitTurn(blob) {
    if (!current) { setMode("ready"); return; }
    try {
      const fd = new FormData();
      const filename = `part-practice.${(blob.type || "").includes("ogg") ? "ogg" : (blob.type || "").includes("mp4") ? "m4a" : "webm"}`;
      fd.append("audio", blob, filename);
      fd.append("question_text", current.question_text);
      fd.append("part", current.part);
      if (current.question?.id) fd.append("question_id", current.question.id);
      const r = await fetch(`${backend}/api/transcribe-turn`, {method:"POST", body:fd});
      if (!r.ok) {
        const txt = await r.text().catch(()=> "");
        throw new Error(`Turn processing failed (${r.status}): ${txt || "no body"}`);
      }
      const data = await r.json();
      if (data.no_speech) {
        const tip = (data.examiner_feedback?.next_steps_en || data.examiner_feedback?.next_steps_vi || []).join(" ")
          || "No speech detected. Check your microphone and try this answer again.";
        setErr(tip);
        setMode("ready");
        return;
      }
      const nextResults = [...results, {...data, turn:current}];
      setResults(nextResults);

      if (adaptive && !current.dynamic && (current.part === "part1" || current.part === "part3")
          && followUpsRef.current > 0 && (data.user_transcript || "").trim()) {
        try {
          const ctx = nextResults.slice(-4).map(r => ({
            question: r.turn?.question_text || "",
            answer: r.user_transcript || ""
          }));
          const fr = await fetch(`${backend}/api/next-turn`, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ part: current.part, question: current.question_text, answer: data.user_transcript || "", context: ctx })
          });
          if (fr.ok) {
            const fu = await fr.json();
            if (fu && !fu.move_on && fu.follow_up) {
              followUpsRef.current -= 1;
              const dyn = {
                id: `part-fu-${current.id || idx}-${nextResults.length}`,
                part: current.part,
                label: current.part === "part3" ? "Part 3 follow-up" : "Part 1 follow-up",
                question: { question_text: fu.follow_up },
                question_text: fu.follow_up,
                examinerLine: fu.follow_up,
                expectedSec: current.part === "part3" ? 50 : 25,
                maxSec: current.part === "part3" ? 75 : 45,
                dynamic: true
              };
              const newTurns = [...turns.slice(0, idx + 1), dyn, ...turns.slice(idx + 1)];
              setTurns(newTurns);
              goToTurn(idx + 1, newTurns);
              return;
            }
          }
        } catch (e) { /* continue with fixed script */ }
      }

      if (idx + 1 >= turns.length) {
        mockExaminerSpeak("Thank you. That is the end of this practice part.");
        setMode("scoring");
        const nextSummary = await finalizePractice(nextResults, turns);
        setSummary(nextSummary);
        setMode("review");
        if (typeof setState === "function") {
          setState(s => ({...s, speakingTests:[nextSummary, ...((s.speakingTests)||[])].slice(0,200)}));
        }
      } else {
        goToTurn(idx + 1);
      }
    } catch (e) {
      setErr(e.message || String(e));
      setMode("ready");
    }
  }

  function transcriptFor(allTurns, allResults) {
    return (allResults || []).map((r,i) => {
      const t = allTurns[i] || r.turn || {};
      return `[${t.label || t.part || "Turn"}] Q: ${t.question_text || ""}\nA: ${r.user_transcript || ""}`;
    }).join("\n\n");
  }

  async function finalizePractice(allResults, allTurns = turns) {
    const scope = sessionPart || part;
    const meta = SPEAKING_PARTS.find(p => p.id === scope) || partMeta;
    const payloadTurns = allResults.map((r) => {
      const t = r.turn || {};
      return {
        part: t.part || scope,
        question: t.question_text || "",
        transcript: r.user_transcript || "",
        acoustic_features: (r.examiner_feedback && r.examiner_feedback.acoustic_features) || null
      };
    });
    const transcript = transcriptFor(allTurns, allResults);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const resp = await fetch(`${backend}/api/score-session`, {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ turns: payloadTurns, question_id: sessionId, scope, careful_grade: carefulGrade })
        });
        if (!resp.ok) throw new Error(`session score ${resp.status}`);
        const data = await resp.json();
        if (data && data.no_speech) break;
        if (data && data.overall_band != null) {
          return {
            id: sessionId || `${scope}-practice-${Date.now()}`,
            date: new Date().toISOString(),
            partPractice:true, holistic:true,
            scope,
            part: scope,
            topic: `${meta.label} practice`,
            question_text: `IELTS Speaking ${meta.label} practice session`,
            overall_band: data.overall_band,
            fluency_score: data.fluency_score,
            lexical_score: data.lexical_score,
            grammar_score: data.grammar_score,
            pronunciation_score: data.pronunciation_score,
            transcript,
            durationSec: allResults.reduce((sum,x)=>sum + (Number(x.duration_sec) || 0), 0),
            feedback: {
              holistic: data.examiner_feedback, model: data.examiner_model, mockTurns: allResults,
              grading: { mode: data.grading_mode || "standard", passes: Number(data.grading_passes) || 1, requested: !!data.careful_grade_requested }
            }
          };
        }
      } catch (e) { /* retry once */ }
    }
    return {
      id: sessionId || `${scope}-practice-${Date.now()}`,
      date: new Date().toISOString(),
      partPractice:true, holistic:false, unscored:true,
      scope,
      part: scope,
      topic: `${meta.label} practice`,
      question_text: `IELTS Speaking ${meta.label} practice session`,
      overall_band: null,
      transcript,
      durationSec: allResults.reduce((sum,x)=>sum + (Number(x.duration_sec) || 0), 0),
      feedback:{mockTurns:allResults}
    };
  }

  async function retryScore() {
    if (!results.length) return;
    setMode("scoring");
    const s = await finalizePractice(results, turns);
    setSummary(s);
    setMode("review");
    if (typeof setState === "function") {
      setState(st => ({...st, speakingTests:[s, ...((st.speakingTests)||[]).filter(x=>x.id!==s.id)].slice(0,200)}));
    }
  }

  const progress = turns.length ? Math.round((results.length / turns.length) * 100) : 0;
  const criteriaRows = summary ? [
    ["Fluency & Coherence", summary.fluency_score],
    ["Lexical Resource", summary.lexical_score],
    ["Grammar Range & Accuracy", summary.grammar_score],
    ["Pronunciation", summary.pronunciation_score]
  ] : [];

  return <div className="card" style={{marginBottom:14,borderLeft:"2px solid var(--leaf)"}}>
    <div className="card-h" style={{cursor:"pointer",margin:0}} onClick={()=>setOpen(o=>!o)}>
      <div className="cdot" style={{background:"var(--leaf)"}}/>Part Practice Test - {partMeta.label} {open?"hide":"show"}
    </div>
    {open&&<div style={{marginTop:10}}>
      <div className="why" style={{marginBottom:10}}>
        Examiner-style practice for the selected part only. Feedback stays hidden until the final part-level score.
      </div>
      {!active&&mode!=="review"&&<div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <button className="btn bp bsm" onClick={startPractice} disabled={!health?.ok || mode==="loading"}>
          {mode==="loading" ? "Preparing practice..." : `Start ${partMeta.label} practice`}
        </button>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11.5,color:"var(--ink2)",cursor:"pointer"}} title="The examiner can add natural follow-up questions in Part 1 and Part 3.">
          <input type="checkbox" checked={adaptive} onChange={e=>setAdaptive(e.target.checked)} disabled={part==="part2"}/>
          Adaptive examiner follow-ups
        </label>
        <label style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11.5,color:"var(--ink2)",cursor:"pointer"}} title="Runs three independent part-level grades and uses the median. It takes longer and uses about three times the examiner quota.">
          <input type="checkbox" checked={carefulGrade} onChange={e=>setCarefulGrade(e.target.checked)}/>
          Careful grade (3x)
        </label>
        {!health?.ok&&<span style={{fontSize:11,color:"var(--ink3)"}}>Needs Speaking backend + examiner key for scored recording.</span>}
      </div>}
      {mode==="error"&&err&&<div className="why" style={{color:"var(--rose)",marginTop:8}}>{err}</div>}

      {active&&mode!=="review"&&current&&<div style={{marginTop:12}}>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:10}}>
          <span style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:"var(--ink3)"}}>TURN {idx+1}/{turns.length}</span>
          <span className="chip" style={{fontSize:10}}>{current.label}</span>
          <span style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:"var(--ink3)"}}>{progress}% complete</span>
          <button className="btn bg bsm" onClick={()=>mockExaminerSpeak(current.examinerLine || current.question_text)}>Play examiner line</button>
          <button className="btn bg bsm" onClick={()=>resetPractice(false)}>Exit practice</button>
        </div>
        <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Examiner</div>
          <div style={{fontSize:16,color:"var(--ink)",lineHeight:1.45}}>{current.question_text}</div>
          {current.cue_card?.bullets&&<div style={{marginTop:10}}>
            <div style={{fontSize:11,color:"var(--ink3)",marginBottom:4}}>You should say:</div>
            <ul style={{margin:0,paddingLeft:18,fontSize:13,color:"var(--ink2)",lineHeight:1.55}}>
              {current.cue_card.bullets.map((b,i)=><li key={i}>{b}</li>)}
            </ul>
          </div>}
        </div>
        {current.needsPrep&&mode==="prep"&&<div style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
            <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Preparation</span>
            <span style={{fontFamily:"'Geist Mono',monospace",fontSize:18,color:prepLeft<=10?"var(--rose)":"var(--ink)"}}>{formatTimer(prepLeft)}</span>
            <button className="btn bp bsm" onClick={()=>{ clearTimers(); setPrepLeft(0); setMode("ready"); mockExaminerSpeak(MOCK_GO_LINE); }}>Start speaking now</button>
          </div>
          <textarea className="era-input" value={prepNotes} onChange={e=>setPrepNotes(e.target.value)} rows="2" placeholder="Private notes for your 1-minute prep..." style={{resize:"vertical"}}/>
        </div>}
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginTop:12}}>
          {canRecord&&<button className="btn bp" onClick={startRecording}>Record answer</button>}
          {mode==="recording"&&<button className="btn bsm" style={{background:"var(--rose)",color:"var(--bg)",border:"none"}} onClick={stopRecording}>Stop and submit</button>}
          {(mode==="recording"||mode==="scoring")&&<span style={{fontFamily:"'Geist Mono',monospace",fontSize:14,color:"var(--ink2)"}}>
            {mode==="recording" ? `REC ${formatTimer(elapsed)}` : "Processing turn... feedback hidden"}
          </span>}
          {mode==="ready"&&<span style={{fontSize:11,color:"var(--ink3)"}}>Target about {formatTimer(current.expectedSec)}. Auto-stops near {formatTimer(current.maxSec)}.</span>}
        </div>
        {err&&<div className="why" style={{color:"var(--rose)",marginTop:8}}>{err}</div>}
      </div>}

      {mode==="review"&&summary&&<div style={{marginTop:12}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:10,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".12em",textTransform:"uppercase"}}>{activeMeta.label} score</div>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:44,lineHeight:1,color:"var(--ink)"}}>{formatBand(summary.overall_band)}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:8,flex:1,minWidth:280}}>
            {criteriaRows.map(([label,val])=><div key={label} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 10px"}}>
              <div style={{fontSize:10,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>{label}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:21,color:"var(--ink)"}}>{formatBand(val)}</div>
            </div>)}
          </div>
        </div>
        <div className="why" style={{marginTop:10}}>
          {summary.unscored
            ? "Could not score this part practice. Your transcript is saved below; press Retry scoring to try again."
            : summary.feedback?.grading?.mode === "careful"
              ? `Median of ${summary.feedback.grading.passes} independent part-level grades; this is still not a complete test score.`
              : "This is a part-level band estimate for the selected IELTS Speaking part only, not a complete test score."}
        </div>
        {summary.unscored && <div style={{marginTop:8}}>
          <button className="btn bp bsm" onClick={retryScore} disabled={mode==="scoring"}>{mode==="scoring" ? "Scoring..." : "Retry scoring"}</button>
        </div>}

        {summary.feedback?.holistic && (() => {
          const fb = summary.feedback.holistic;
          const en = fbLang === "en";
          const fbObj = (en && fb.feedback_en && Object.values(fb.feedback_en).some(a=>a&&a.length)) ? fb.feedback_en : fb.feedback_vi;
          const steps = (en && fb.next_steps_en?.length) ? fb.next_steps_en : fb.next_steps_vi;
          const g = fb.band_gap || {};
          const why = (en && g.why_not_higher_en) ? g.why_not_higher_en : g.why_not_higher_vi;
          const toImprove = (en && g.to_improve_en?.length) ? g.to_improve_en : g.to_improve_vi;
          return <div style={{marginTop:12}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Examiner feedback</span>
              <div style={{marginLeft:"auto",display:"inline-flex",border:"1px solid var(--border)",borderRadius:7,overflow:"hidden"}}>
                <button className="btn bsm" style={{borderRadius:0,border:"none",background:fbLang==="vi"?"var(--leaf)":"transparent",color:fbLang==="vi"?"var(--bg)":"var(--ink2)"}} onClick={()=>setFbLang("vi")}>VI</button>
                <button className="btn bsm" style={{borderRadius:0,border:"none",background:fbLang==="en"?"var(--leaf)":"transparent",color:fbLang==="en"?"var(--bg)":"var(--ink2)"}} onClick={()=>setFbLang("en")}>EN</button>
              </div>
            </div>
            {g.weakest_criterion && <div style={{marginBottom:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--orchid)",borderRadius:8}}>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:6}}>
                <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",textTransform:"uppercase",letterSpacing:".08em"}}>{en?"Closest next band":"Gan band ke tiep"}</span>
                <span style={{fontSize:13,color:"var(--ink)",fontWeight:600}}>{g.weakest_criterion}</span>
                <span style={{fontFamily:"'Fraunces',serif",fontSize:16,color:"var(--ink)"}}>{formatBand(g.current_band)} -> {formatBand(g.next_band)}</span>
              </div>
              {why && <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.5,marginBottom:6}}>{why}</div>}
              {toImprove?.length>0 && <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.5}}>{toImprove.map((x,i)=><li key={i}>{x}</li>)}</ul>}
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:10}}>
              {Object.entries(fbObj||{}).map(([k,bullets])=><div key={k} style={{padding:"10px 12px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
                <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{FEEDBACK_KEY_MAP[k]||k}</div>
                <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.5}}>{(bullets||[]).map((b,i)=><li key={i}>{b}</li>)}</ul>
                {fb.evidence?.[k]?.length>0 && <div style={{marginTop:6,fontSize:11,color:"var(--ink3)"}}><em>Evidence:</em> {fb.evidence[k].map((e,i)=><span key={i} style={{display:"inline-block",margin:"2px 4px 2px 0",padding:"1px 6px",background:"var(--bg2,#f5f5f7)",borderRadius:4,fontStyle:"italic"}}>"{e}"</span>)}</div>}
              </div>)}
            </div>
            {steps?.length>0 && <div style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--leaf)",borderRadius:8}}>
              <div style={{fontSize:11,color:"var(--leaf)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{en?"Next steps":"Buoc tiep theo"}</div>
              <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.5}}>{steps.map((s,i)=><li key={i}>{s}</li>)}</ul>
            </div>}
          </div>;
        })()}

        {(() => {
          const turnReviews = (summary.feedback?.mockTurns || results || []).filter(Boolean);
          if (!turnReviews.length) return null;
          return <div style={{marginTop:12,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
            <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Turn-by-turn coaching</span>
              <span style={{fontSize:11,color:"var(--ink3)"}}>Delivery checks, clarity heatmap, and model answers stay on demand.</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {turnReviews.map((r,i) => {
                const t = r.turn || turns[i] || {};
                const q = {
                  ...((t && t.question) || {}),
                  part: t.part || r.part || sessionPart || "part1",
                  question_text: t.question_text || r.question_text || ""
                };
                const feats = r.examiner_feedback?.acoustic_features;
                const clarity = (r.word_clarity && r.word_clarity.length)
                  ? r.word_clarity
                  : ((r.transcript && r.transcript.word_timestamps) || []);
                return <details key={t.id || r.question_id || i} open={i===0} style={{padding:"9px 10px",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8}}>
                  <summary style={{cursor:"pointer",fontSize:12.5,color:"var(--ink)",fontWeight:600}}>
                    {(t.label || q.part || `Turn ${i+1}`)} <span style={{color:"var(--ink3)",fontWeight:400}}>- {q.question_text || "Untitled question"}</span>
                  </summary>
                  <div style={{marginTop:8,display:"grid",gap:8}}>
                    {q.question_text && <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.5}}>
                      <strong style={{color:"var(--ink)"}}>Question:</strong> {q.question_text}
                    </div>}
                    <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.55}}>
                      <strong style={{color:"var(--ink)"}}>Your answer:</strong> {r.user_transcript || "No transcript captured."}
                    </div>
                    {feats && <DeliveryLexisCoach feats={feats} transcript={r.user_transcript} lang={fbLang}/>}
                    {clarity.length > 0 && <ClarityHeatmap words={clarity} lang={fbLang}/>}
                    {q.question_text && <ModelAnswerPanel question={q} transcript={r.user_transcript} backend={backend} state={state} setState={setState}/>}
                  </div>
                </details>;
              })}
            </div>
          </div>;
        })()}

        <details style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
          <summary style={{cursor:"pointer",fontSize:12,color:"var(--ink2)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Turn transcript summary</summary>
          <pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",fontSize:12.5,color:"var(--ink)",lineHeight:1.55,margin:"8px 0 0"}}>{summary.transcript}</pre>
        </details>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          <button className="btn bp bsm" onClick={startPractice}>Start another {activeMeta.label} practice</button>
          <button className="btn bg bsm" onClick={()=>resetPractice(false)}>Close practice</button>
        </div>
      </div>}
    </div>}
  </div>;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MODEL ANSWER LIBRARY — import band-7 model-answer material (PDF/images) via the
// existing MarkItDown/OCR uploader, parse it with the browser AI provider into
// {part, topic, question, answer_en, answer_vi, collocations[]}, store locally, then
// browse / shadow (TTS) / save collocations. Study companion, separate from scoring.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const _MAL_FILTERS = [["all", "All"], ["part1", "Part 1"], ["part2", "Part 2"], ["part3", "Part 3"]];

function ModelAnswerLibrary({ state, setState, config }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState("all");
  const [vocabAdded, setVocabAdded] = useState(0);
  const [lang, setLang] = useState("en");
  const lib = state.modelAnswerLibrary || [];

  async function parseImported(markdown) {
    setErr(""); setPreview(null);
    const text = String(markdown || "").trim();
    if (!text) { setErr("No text was extracted from that file."); return; }
    const cfg = (typeof getActiveConfig === "function" && getActiveConfig()) || config;
    if (!cfg || !cfg.key) { setErr("Add an AI provider in Settings to parse the material into the library."); return; }
    setBusy(true);
    try {
      const truncated = text.length > 14000;
      const prompt = `You are parsing IELTS Speaking study material into structured data.
From the TEXT below, extract every IELTS Speaking question and its model answer.
Return ONLY a JSON array (no prose, no markdown fences). For each item:
{"part":"part1"|"part2"|"part3","topic":"<short topic label>","question":"<the question>","answer_en":"<the English model answer; wrap 3-6 of its strongest collocations in **double asterisks**>","answer_vi":"<the Vietnamese translation if present, else an empty string>","collocations":[{"phrase":"<English collocation>","meaning_vi":"<short Vietnamese gloss>"}]}
Infer the part: a "Describe ..." cue card = part2; an abstract/opinion discussion question = part3; a short personal question = part1.
TEXT:
${text.slice(0, 14000)}

Return ONLY the JSON array.`;
      const raw = await callAPI(cfg, [{ role: "user", content: prompt }], 4000, 0.1);
      let s = String(raw || "").trim();
      if (s.startsWith("```")) s = s.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
      const a = s.indexOf("["), b = s.lastIndexOf("]");
      if (a >= 0 && b > a) s = s.slice(a, b + 1);
      const arr = JSON.parse(s);
      const entries = (Array.isArray(arr) ? arr : []).map((e, i) => ({
        id: `mal-${Date.now()}-${i}`,
        part: ["part1", "part2", "part3"].includes(e.part) ? e.part : "part1",
        topic: String(e.topic || "").trim(),
        question: String(e.question || "").trim(),
        answer_en: String(e.answer_en || "").trim(),
        answer_vi: String(e.answer_vi || "").trim(),
        collocations: Array.isArray(e.collocations)
          ? e.collocations.filter(c => c && c.phrase).map(c => ({ phrase: String(c.phrase).replace(/\*\*/g, "").trim(), meaning_vi: String(c.meaning_vi || "").trim() }))
          : [],
        savedAt: new Date().toISOString()
      })).filter(e => e.question && e.answer_en);
      if (!entries.length) setErr("Couldn't find any model answers in that file.");
      else setPreview({ entries, truncated });
    } catch (e) { setErr("Parse failed: " + (e.message || String(e))); }
    finally { setBusy(false); }
  }

  function addPreview() {
    if (!preview || typeof setState !== "function") return;
    setState(s => {
      const existing = s.modelAnswerLibrary || [];
      const keys = new Set(existing.map(x => (x.question || "").toLowerCase()));
      const fresh = preview.entries.filter(e => !keys.has((e.question || "").toLowerCase()));
      return { ...s, modelAnswerLibrary: [...fresh, ...existing].slice(0, 500) };
    });
    setPreview(null);
  }

  function removeEntry(id) {
    if (typeof setState !== "function") return;
    setState(s => ({ ...s, modelAnswerLibrary: (s.modelAnswerLibrary || []).filter(x => x.id !== id) }));
  }

  const counts = lib.reduce((m, e) => { m[e.part] = (m[e.part] || 0) + 1; return m; }, {});
  const shown = lib.filter(e => filter === "all" || e.part === filter);
  const allColloc = lib.flatMap(e => (e.collocations || []).map(c => ({ phrase: String(c.phrase || "").trim(), meaning: String(c.meaning_vi || "").trim(), example: "" }))).filter(c => c.phrase);

  // Feed library collocations into the Vocab lexis library so they show in the
  // Dictionary + collocation quiz (spaced-repetition review). Reuses the global
  // mergeVocabLexisLibrary (07-vocab) — no Vocab-subsystem file edits.
  function addCollocsToVocab() {
    if (typeof setState !== "function" || !allColloc.length) return;
    const scan = { collocations: allColloc, idioms: [] };
    setState(s => {
      if (typeof mergeVocabLexisLibrary === "function") return { ...s, vocabLexisLibrary: mergeVocabLexisLibrary(s.vocabLexisLibrary, scan) };
      const prev = (s.vocabLexisLibrary && s.vocabLexisLibrary.collocations) || [];
      const seen = new Set(prev.map(x => (x.phrase || "").toLowerCase()));
      const add = scan.collocations.filter(c => !seen.has(c.phrase.toLowerCase()));
      return { ...s, vocabLexisLibrary: { ...(s.vocabLexisLibrary || {}), collocations: [...prev, ...add].slice(0, 200), idioms: (s.vocabLexisLibrary && s.vocabLexisLibrary.idioms) || [], updatedAt: new Date().toISOString() } };
    });
    setVocabAdded(allColloc.length);
  }

  return <div className="card" style={{ marginBottom: 14, borderLeft: "2px solid var(--honey)" }}>
    <div className="card-h" style={{ cursor: "pointer", margin: 0 }} onClick={() => setOpen(o => !o)}>
      <div className="cdot" style={{ background: "var(--honey)" }} />Model Answer Library{lib.length ? ` (${lib.length})` : ""} {open ? "▾" : "▸"}
    </div>
    {open && <div style={{ marginTop: 10 }}>
      <div className="why" style={{ marginBottom: 10 }}>Import a band-7 model-answer file (PDF or images) — the AI parses each question + answer + collocations into a study bank you can browse, shadow (read aloud), and save collocations from.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <MarkItDownUploader compact label={busy ? "Parsing…" : "📎 Import model answers"} disabled={busy} onResult={r => parseImported(r.markdown)} />
        {busy && <span style={{ fontSize: 11, color: "var(--ink3)" }}><Spinner /> Parsing the file…</span>}
      </div>
      {err && <div className="why" style={{ color: "var(--rose)", marginTop: 8 }}>{err}</div>}

      {preview && <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--leaf)", borderRadius: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--ink)" }}>Found <strong>{preview.entries.length}</strong> model answer{preview.entries.length === 1 ? "" : "s"}.</span>
          <button className="btn bp bsm" onClick={addPreview}>Add to library</button>
          <button className="btn bg bsm" onClick={() => setPreview(null)}>Discard</button>
        </div>
        {preview.truncated && <div style={{ fontSize: 11, color: "var(--honey)", marginTop: 6 }}>Note: the file was long — only the first part was parsed. Re-import the rest separately if needed.</div>}
        <ul style={{ margin: "8px 0 0 0", paddingLeft: 18, fontSize: 12, color: "var(--ink2)", lineHeight: 1.55 }}>
          {preview.entries.slice(0, 8).map((e, i) => <li key={i}><span style={{ color: "var(--ink3)" }}>[{e.part}]</span> {e.question}</li>)}
          {preview.entries.length > 8 && <li>…and {preview.entries.length - 8} more</li>}
        </ul>
      </div>}

      {lib.length > 0 && <div style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {_MAL_FILTERS.map(([k, lbl]) => {
            const n = k === "all" ? lib.length : (counts[k] || 0);
            return <button key={k} className={`mode-btn ${filter === k ? "active" : ""}`} onClick={() => setFilter(k)} style={{ fontSize: 11 }}>{lbl}{n ? ` (${n})` : ""}</button>;
          })}
          <div style={{ marginLeft: "auto", display: "inline-flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
            <button className="btn bsm" style={{ borderRadius: 0, border: "none", background: lang === "en" ? "var(--leaf)" : "transparent", color: lang === "en" ? "var(--bg)" : "var(--ink2)" }} onClick={() => setLang("en")}>EN</button>
            <button className="btn bsm" style={{ borderRadius: 0, border: "none", background: lang === "vi" ? "var(--leaf)" : "transparent", color: lang === "vi" ? "var(--bg)" : "var(--ink2)" }} onClick={() => setLang("vi")}>VI</button>
          </div>
        </div>
        {allColloc.length > 0 && <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="btn bg bsm" onClick={addCollocsToVocab} title="Add these collocations to your Vocab lexis library so they appear in the Dictionary + collocation quiz">📚 {lang === "vi" ? `Thêm ${allColloc.length} collocation vào Vocab` : `Add ${allColloc.length} collocations to Vocab`}</button>
          {vocabAdded > 0 && <span style={{ fontSize: 11, color: "var(--leaf)" }}>{lang === "vi" ? `✓ Đã thêm ${vocabAdded} vào Vocab (Dictionary + quiz)` : `✓ Added ${vocabAdded} to Vocab (Dictionary + quiz)`}</span>}
        </div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.map(e => {
            const body = lang === "vi" && e.answer_vi ? e.answer_vi : e.answer_en;
            return <div key={e.id} style={{ padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: ".08em" }}>{e.part}{e.topic ? " · " + e.topic : ""}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  <button className="btn bg bsm" title="Shadow this answer (read aloud)" onClick={() => mockExaminerSpeak(String(e.answer_en || "").replace(/\*\*/g, ""))}>🎙️ Shadow</button>
                  <button className="btn bg bsm" onClick={() => removeEntry(e.id)}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 4, fontFamily: "'Fraunces',serif" }}>{e.question}</div>
              <p style={{ margin: "8px 0 0 0", fontSize: 13.5, color: "var(--ink)", lineHeight: 1.6 }}>{_renderBoldHighlights(body)}</p>
              {e.collocations?.length > 0 && <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {e.collocations.map((c, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11.5, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, padding: "3px 8px" }}>
                  <span style={{ color: "var(--ink)" }}>{c.phrase}</span>{c.meaning_vi ? <span style={{ color: "var(--ink3)" }}>· {c.meaning_vi}</span> : null}
                  <SpeakButton text={c.phrase} />
                  <SaveButton state={state} setState={setState} item={{ type: "vocab", title: c.phrase, body: c.meaning_vi || "", source: "Speaking · Model Answer Library", key: "lexis:" + c.phrase.toLowerCase() }} />
                </span>)}
              </div>}
            </div>;
          })}
        </div>
      </div>}
    </div>}
  </div>;
}

// Find model-answer library entries relevant to the question being practised —
// same part, ranked by topic/keyword overlap (exact-topic match weighted highest).
function _findRelatedModelAnswers(lib, question) {
  if (!lib || !lib.length || !question) return [];
  const toks = (s) => (String(s || "").toLowerCase().match(/[a-z']+/g) || []).filter(w => w.length > 3 && !_COACH_STOP.has(w));
  const qset = new Set(toks((question.topic || "") + " " + (question.question_text || "")));
  if (!qset.size) return [];
  const qTopic = (question.topic || "").trim().toLowerCase();
  return lib
    .filter(e => e.part === question.part)
    .map(e => {
      const seen = new Set();
      let shared = 0;
      for (const w of toks((e.topic || "") + " " + (e.question || ""))) {
        if (qset.has(w) && !seen.has(w)) { shared++; seen.add(w); }
      }
      const topicEq = !!qTopic && (e.topic || "").trim().toLowerCase() === qTopic;
      return { e, score: shared + (topicEq ? 3 : 0) };
    })
    .filter(x => x.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(x => x.e);
}

function RelatedModelAnswers({ question, state }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const matches = _findRelatedModelAnswers(state.modelAnswerLibrary, question);
  if (!matches.length) return null;
  return <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--surface)", border: "1px solid var(--honey)", borderRadius: 8 }}>
    <div onClick={() => setOpen(o => !o)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: "var(--honey)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase" }}>💡 Model answer{matches.length > 1 ? "s" : ""} from your library ({matches.length})</span>
      <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink3)" }}>{open ? "hide ▾" : "study before you speak ▸"}</span>
    </div>
    {open && <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
          <button className="btn bsm" style={{ borderRadius: 0, border: "none", background: lang === "en" ? "var(--leaf)" : "transparent", color: lang === "en" ? "var(--bg)" : "var(--ink2)" }} onClick={() => setLang("en")}>EN</button>
          <button className="btn bsm" style={{ borderRadius: 0, border: "none", background: lang === "vi" ? "var(--leaf)" : "transparent", color: lang === "vi" ? "var(--bg)" : "var(--ink2)" }} onClick={() => setLang("vi")}>VI</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {matches.map(e => {
          const body = lang === "vi" && e.answer_vi ? e.answer_vi : e.answer_en;
          return <div key={e.id} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 11px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--ink2)", fontStyle: "italic" }}>{e.question}</span>
              <button className="btn bg bsm" style={{ marginLeft: "auto" }} title="Read aloud to shadow" onClick={() => mockExaminerSpeak(String(e.answer_en || "").replace(/\*\*/g, ""))}>🎙️</button>
            </div>
            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "var(--ink)", lineHeight: 1.55 }}>{_renderBoldHighlights(body)}</p>
          </div>;
        })}
      </div>
    </div>}
  </div>;
}

// "Develop your answer" coach — operationalises the masterclass Extra-Info system
// (extend answers with a reason / example / contrast / detail). Shows only when the
// answer is UNDER-DEVELOPED for the part. Fluency comes from saying more naturally,
// NOT from advanced words.
const _DEVELOP_TIPS = [
  { tech_en: "Give a reason", tech_vi: "Nêu lý do", conn: "because", model_en: "“…because it helps me relax and switch off.”", model_vi: "“…vì nó giúp tôi thư giãn và nhẹ đầu.”" },
  { tech_en: "Add an example", tech_vi: "Thêm ví dụ", conn: "for instance / like", model_en: "“…, for instance, last weekend I…”", model_vi: "“…, ví dụ cuối tuần trước tôi…”" },
  { tech_en: "Add a contrast", tech_vi: "Thêm tương phản", conn: "but / although", model_en: "“I usually do X, but at the weekend I…”", model_vi: "“Tôi thường làm X, nhưng cuối tuần thì…”" },
  { tech_en: "Add a detail", tech_vi: "Thêm chi tiết", conn: "and / also", model_en: "“…and I also enjoy … because …”", model_vi: "“…và tôi cũng thích … vì …”" }
];
function _developThreshold(part) { return part === "part2" ? 110 : part === "part3" ? 40 : 25; }
function DevelopAnswerTips({ score, part, lang }) {
  const a = score && score.examiner_feedback && score.examiner_feedback.acoustic_features;
  if (!a) return null;
  const wc = Number(a.word_count) || 0;
  if (!wc || wc >= _developThreshold(part)) return null; // only when under-developed
  const en = lang === "en";
  return <div style={{ marginTop: 12, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--honey)", borderRadius: 8 }}>
    <div style={{ fontSize: 11, color: "var(--honey)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>
      {en ? `Develop your answer — it was short (${wc} words)` : `Phát triển câu trả lời — còn ngắn (${wc} từ)`}
    </div>
    <div style={{ fontSize: 12, color: "var(--ink2)", marginBottom: 8, lineHeight: 1.5 }}>
      {en ? "Fluency comes from saying more, naturally — extend each answer with one of these (no fancy words needed):" : "Trôi chảy đến từ việc nói nhiều hơn một cách tự nhiên — mở rộng mỗi câu bằng một trong các cách sau (không cần từ màu mè):"}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {_DEVELOP_TIPS.map((t, i) => <div key={i} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7, padding: "7px 10px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600 }}>{en ? t.tech_en : t.tech_vi}</span>
          <span style={{ fontSize: 11, fontFamily: "'Geist Mono',monospace", color: "var(--leaf)" }}>{t.conn}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink2)", marginTop: 3, fontStyle: "italic" }}>{en ? t.model_en : t.model_vi}</div>
      </div>)}
    </div>
  </div>;
}

// Real phoneme-based pronunciation (from /api/score `pronunciation_real`, produced by
// the backend pronunciation.py GOP model). Renders only when the optional pron stack is
// installed (available:true) — otherwise nothing shows and the "≈" text estimate stands.
function RealPronPanel({ score, lang }) {
  const p = score && score.pronunciation_real;
  if (!p || !p.available) return null;
  const en = lang === "en";
  const problems = p.problem_phonemes || [];
  const perWord = (p.per_word || []).filter(w => Number(w.score) < 0.6).slice(0, 12);
  return <div style={{ marginTop: 10, padding: "12px 14px", background: "var(--surface)", border: "1px solid var(--leaf)", borderRadius: 8 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: "var(--leaf)", fontFamily: "'Geist Mono',monospace", letterSpacing: ".08em", textTransform: "uppercase" }}>🎤 {en ? "Real pronunciation (from audio)" : "Phát âm thật (từ audio)"}</span>
      {p.pron_band_estimate != null && <span style={{ fontFamily: "'Fraunces',serif", fontSize: 20, color: "var(--ink)" }}>{formatBand(p.pron_band_estimate)}</span>}
      {p.confidence != null && <span style={{ fontSize: 11, color: "var(--ink3)" }}>{en ? "clarity" : "độ rõ"} {Math.round(Number(p.confidence) * 100)}%</span>}
    </div>
    {problems.length > 0 && <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, color: "var(--ink3)", marginBottom: 5 }}>{en ? "Weakest sounds — practise these:" : "Âm yếu nhất — luyện các âm này:"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {problems.map((ph, i) => <span key={i} style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", background: "color-mix(in srgb, var(--rose) 14%, var(--surface2))", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 8px", color: "var(--ink)" }}>/{ph}/</span>)}
      </div>
    </div>}
    {perWord.length > 0 && <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 11, color: "var(--ink3)", marginBottom: 5 }}>{en ? "Words to re-say:" : "Từ nên đọc lại:"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {perWord.map((w, i) => <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 8px", color: "var(--ink)" }}>{w.word}<SpeakButton text={w.word} size="sm" /></span>)}
      </div>
    </div>}
    {p.notes && <div style={{ fontSize: 10.5, color: "var(--ink3)", marginTop: 8, lineHeight: 1.5 }}>{p.notes}</div>}
  </div>;
}

function SpeakingPage({state, setState, config}) {
  const backend = getSpeakingBackend(state);
  const [part, setPart] = useState(() => state.speakingDraft?.part || "part1");
  const [question, setQuestion] = useState(() => state.speakingDraft?.question || null);
  const [library, setLibrary] = useState([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libErr, setLibErr] = useState("");
  const [health, setHealth] = useState({ checking: true, ok: false, msg: "Checking backend…" });
  const [phase, setPhase] = useState("idle"); // idle | recording | uploading | scoring | done | error
  const [elapsed, setElapsed] = useState(0);
  const [errMsg, setErrMsg] = useState("");
  const [score, setScore] = useState(null);
  const [fbLang, setFbLang] = useState("vi");    // feedback language: "vi" | "en"
  const [carefulGrade, setCarefulGrade] = useState(false);
  const [prepLeft, setPrepLeft] = useState(0);   // Part 2: 60s preparation countdown
  const [prepNotes, setPrepNotes] = useState("");
  const recRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const prepRef = useRef(null);

  const tests = state.speakingTests || [];
  const partMeta = SPEAKING_PARTS.find(p => p.id === part) || SPEAKING_PARTS[0];

  // Persist lightweight draft (which part + which question is selected)
  useEffect(() => {
    setState(s => ({ ...s, speakingDraft: { part, question, updatedAt: new Date().toISOString() }}));
  }, [part, question]);

  // Backend health check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHealth({ checking: true, ok: false, msg: "Checking backend…" });
      try {
        const r = await fetch(`${backend}/api/health`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        if (cancelled) return;
        const keyOk = d.examiner_key_set;
        setHealth({
          checking: false,
          ok: !!keyOk,
          msg: keyOk
            ? `Backend ready · ASR ${d.whisper_model} · Examiner ${d.examiner_model}`
            : `Backend up but EXAMINER_API_KEY missing in speaking-backend/.env`
        });
      } catch (e) {
        if (cancelled) return;
        setHealth({
          checking: false,
          ok: false,
          msg: `Cannot reach backend at ${backend}. Double-click start-speaking-backend.bat in the project folder, or start speaking-backend manually.`
        });
      }
    })();
    return () => { cancelled = true; };
  }, [backend]);

  // Cleanup recorder on unmount
  useEffect(() => () => {
    try { recRef.current?.stop?.(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    if (timerRef.current) clearInterval(timerRef.current);
    if (prepRef.current) clearInterval(prepRef.current);
  }, []);

  function startPrep() {
    setErrMsg("");
    setPrepLeft(60);
    if (prepRef.current) clearInterval(prepRef.current);
    prepRef.current = setInterval(() => {
      setPrepLeft(t => {
        if (t <= 1) { clearInterval(prepRef.current); prepRef.current = null; return 0; }
        return t - 1;
      });
    }, 1000);
  }
  function endPrep() {
    if (prepRef.current) { clearInterval(prepRef.current); prepRef.current = null; }
    setPrepLeft(0);
  }

  async function loadLibrary(targetPart = part) {
    setLibLoading(true); setLibErr("");
    try {
      const r = await fetch(`${backend}/api/library?part=${targetPart}&limit=10`, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setLibrary(Array.isArray(data) ? data : []);
    } catch (e) {
      setLibErr(e.message || String(e));
      setLibrary([]);
    } finally {
      setLibLoading(false);
    }
  }

  async function pickRandom(targetPart = part) {
    await loadLibrary(targetPart);
    setQuestion(null);
    setScore(null);
    setPhase("idle");
    setElapsed(0);
    setErrMsg("");
    endPrep(); setPrepNotes("");
  }

  function pickFromLibrary(q) {
    setQuestion(q);
    setScore(null);
    setPhase("idle");
    setElapsed(0);
    setErrMsg("");
    endPrep(); setPrepNotes("");
  }

  async function startRecording() {
    if (!question) { setErrMsg("Choose a question first."); return; }
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setErrMsg("Your browser does not support audio recording. Try Chrome/Edge/Firefox.");
      return;
    }
    setErrMsg(""); setScore(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickRecorderMime();
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        chunksRef.current = [];
        submitAudio(blob);
      };
      mr.start(250);
      recRef.current = mr;
      setPhase("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } catch (e) {
      setErrMsg(e.message || "Microphone permission denied.");
    }
  }

  function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    try { recRef.current?.stop(); } catch {}
    try { streamRef.current?.getTracks?.().forEach(t => t.stop()); } catch {}
    setPhase("uploading");
  }

  async function submitAudio(blob) {
    if (!question) { setPhase("idle"); return; }
    try {
      setPhase("scoring");
      const fd = new FormData();
      const filename = `answer.${(blob.type || "").includes("ogg") ? "ogg" : (blob.type || "").includes("mp4") ? "m4a" : "webm"}`;
      fd.append("audio", blob, filename);
      fd.append("question_text", question.question_text);
      fd.append("part", question.part);
      if (question.id) fd.append("question_id", question.id);
      fd.append("careful_grade", carefulGrade ? "true" : "false");
      const r = await fetch(`${backend}/api/score`, { method: "POST", body: fd });
      if (!r.ok) {
        const txt = await r.text().catch(()=> "");
        throw new Error(`Score failed (${r.status}): ${txt || "no body"}`);
      }
      const data = await r.json();
      if (data.no_speech) {
        const tip = (data.examiner_feedback?.next_steps_vi || []).join(" ")
          || "Mình không nghe thấy giọng nói. Kiểm tra micro và thu lại nhé.";
        setErrMsg(tip);
        setPhase("idle");
        return;
      }
      setScore(data);
      setPhase("done");
      // Save to history
      const summary = {
        id: data.id || `${Date.now()}`,
        date: new Date().toISOString(),
        part: question.part,
        topic: question.topic || "",
        question_text: question.question_text,
        overall_band: data.overall_band,
        fluency_score: data.fluency_score,
        lexical_score: data.lexical_score,
        grammar_score: data.grammar_score,
        pronunciation_score: data.pronunciation_score,
        transcript: data.user_transcript,
        feedback: {
          ...data.examiner_feedback,
          grading: { mode: data.grading_mode || "standard", passes: Number(data.grading_passes) || 1, requested: !!data.careful_grade_requested }
        },
        durationSec: data.duration_sec
      };
      setState(s => ({ ...s, speakingTests: [summary, ...(s.speakingTests || [])].slice(0, 200) }));
    } catch (e) {
      setErrMsg(e.message || String(e));
      setPhase("error");
    }
  }

  function clearScore() { setScore(null); setPhase("idle"); setElapsed(0); endPrep(); setPrepNotes(""); }

  // ─── Render ──────────────────────────────────────────────────────────
  const recording = phase === "recording";
  const busy = phase === "uploading" || phase === "scoring";

  return <div className="canvas fu">
    <div className="kicker">Speaking · IELTS</div>
    <h1 className="title-x">Speaking <em>Lab</em></h1>

    {/* Backend status banner */}
    <div className="card" style={{marginBottom:16, borderColor: health.ok ? "var(--leaf)" : "var(--rose)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
        <span style={{
          display:"inline-block",width:9,height:9,borderRadius:"50%",
          background: health.checking ? "var(--ink3)" : (health.ok ? "var(--leaf)" : "var(--rose)")
        }}/>
        <span style={{fontFamily:"'Geist Mono',monospace",fontSize:11,color:"var(--ink2)"}}>BACKEND</span>
        <span style={{fontSize:12.5,color:"var(--ink)"}}>{health.msg}</span>
        <span style={{marginLeft:"auto",fontSize:11,color:"var(--ink3)"}}>{backend}</span>
      </div>
    </div>

    <SpeakingWarmup defaultOpen={!health.checking && !health.ok} setState={setState}/>
    <SpeakingMinimalPairDrill/>
    <ModelAnswerLibrary state={state} setState={setState} config={config}/>
    <SpeakingFullMockExam state={state} setState={setState} health={health} backend={backend}/>

    {/* Part selector */}
    <div className="mode-toggle" style={{marginBottom:14}}>
      {SPEAKING_PARTS.map(p =>
        <button key={p.id}
          className={`mode-btn ${part===p.id?"active":""}`}
          onClick={() => { setPart(p.id); setQuestion(null); setScore(null); setPhase("idle"); setElapsed(0); setLibrary([]); endPrep(); setPrepNotes(""); }}>
          {p.label}
        </button>
      )}
    </div>

    <SpeakingPartPracticeSession state={state} setState={setState} health={health} backend={backend} part={part}/>

    <div className="card" style={{marginBottom:14}}>
      <div className="card-h"><div className="cdot"/>{partMeta.title}</div>
      <div className="why" style={{marginTop:6}}>{partMeta.blurb}</div>
      <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
        <button className="btn bp bsm" onClick={() => pickRandom(part)} disabled={!health.ok || libLoading || recording}>
          {libLoading ? "Loading…" : "Show questions"}
        </button>
        {question && <button className="btn bg bsm" onClick={() => { setQuestion(null); setScore(null); }} disabled={recording}>
          Clear question
        </button>}
      </div>
      {libErr && <div className="why" style={{color:"var(--rose)",marginTop:8}}>Library error: {libErr}</div>}
    </div>

    {/* Library list */}
    {!question && library.length > 0 && <div className="card" style={{marginBottom:14}}>
      <div className="card-h"><div className="cdot"/>Question library · {part}</div>
      <ul style={{listStyle:"none",padding:0,margin:"10px 0 0 0",display:"flex",flexDirection:"column",gap:6}}>
        {library.map(q =>
          <li key={q.id} style={{
            border:"1px solid var(--border)",borderRadius:8,padding:"10px 12px",
            cursor:"pointer",background:"var(--surface)"
          }} onClick={() => pickFromLibrary(q)}>
            <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",textTransform:"uppercase",letterSpacing:".08em"}}>
              {q.topic} {q.difficulty ? "· " + q.difficulty : ""}
            </div>
            <div style={{fontSize:13.5,color:"var(--ink)",marginTop:3}}>{q.question_text}</div>
          </li>
        )}
      </ul>
    </div>}

    {/* Active question */}
    {question && <div className="card" style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"baseline",gap:10,flexWrap:"wrap"}}>
        <span style={{fontFamily:"'Geist Mono',monospace",fontSize:10,letterSpacing:".12em",textTransform:"uppercase",color:"var(--ink3)"}}>
          {question.part} · {question.topic}
        </span>
        {question.difficulty && <span className="chip" style={{fontSize:10}}>{question.difficulty}</span>}
      </div>
      <div style={{fontSize:17,color:"var(--ink)",marginTop:8,lineHeight:1.45}}>{question.question_text}</div>

      {/* Part 2 cue card */}
      {question.cue_card?.bullets && <div style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",borderRadius:8,border:"1px solid var(--border)"}}>
        <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>You should say</div>
        <ul style={{margin:0,paddingLeft:18,fontSize:13.5,color:"var(--ink2)",lineHeight:1.6}}>
          {question.cue_card.bullets.map((b,i) => <li key={i}>{b}</li>)}
        </ul>
      </div>}

      {/* Part 3 follow-ups */}
      {question.follow_up && question.follow_up.length > 0 && <div style={{marginTop:10,padding:"10px 14px",background:"var(--surface)",borderRadius:8,border:"1px solid var(--border)"}}>
        <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>Follow-up</div>
        <ul style={{margin:0,paddingLeft:18,fontSize:13,color:"var(--ink2)",lineHeight:1.55}}>
          {question.follow_up.map((b,i) => <li key={i}>{b}</li>)}
        </ul>
      </div>}

      {/* Related model answer(s) from the user's imported library (topic match) */}
      <RelatedModelAnswers question={question} state={state}/>

      {/* Part 2 preparation (1 minute, like the real exam) */}
      {part === "part2" && !busy && !score && <div style={{marginTop:12,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
        {!recording && <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
          <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>Chuẩn bị</span>
          {prepLeft > 0
            ? <>
                <span style={{fontFamily:"'Geist Mono',monospace",fontSize:16,color: prepLeft<=10 ? "var(--rose)" : "var(--ink)"}}>{formatTimer(prepLeft)}</span>
                <button className="btn bp bsm" onClick={() => { endPrep(); startRecording(); }}>Start speaking →</button>
                <button className="btn bg bsm" onClick={endPrep}>Cancel</button>
              </>
            : <button className="btn bg bsm" onClick={startPrep} disabled={!health.ok}>● Prepare (1:00)</button>}
          <span style={{fontSize:11,color:"var(--ink3)"}}>1 phút lập dàn ý như thi thật</span>
        </div>}
        <textarea value={prepNotes} onChange={e => setPrepNotes(e.target.value)}
          placeholder="Ghi nhanh ý chính: what / when / where / why / how you felt…"
          style={{width:"100%",minHeight:60,resize:"vertical",fontSize:13,padding:"8px 10px",borderRadius:6,border:"1px solid var(--border)",background:"var(--surface)",color:"var(--ink)",fontFamily:"inherit",boxSizing:"border-box"}}/>
      </div>}

      {/* Recording controls */}
      <div style={{marginTop:14,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        {!recording && !busy && prepLeft === 0 && <button className="btn bp" onClick={startRecording} disabled={!health.ok}>
          ● Record answer
        </button>}
        <label style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11.5,color:"var(--ink2)",cursor:recording||busy?"default":"pointer"}} title="Runs three independent grades and uses the median. It takes longer and uses about three times the examiner quota.">
          <input type="checkbox" checked={carefulGrade} onChange={e=>setCarefulGrade(e.target.checked)} disabled={recording||busy}/>
          Careful grade (3x)
        </label>
        {recording && <button className="btn bsm" style={{background:"var(--rose)",color:"var(--bg)",border:"none"}} onClick={stopRecording}>
          ■ Stop & score
        </button>}
        {(recording || busy) && <span style={{fontFamily:"'Geist Mono',monospace",fontSize:14,color:"var(--ink2)"}}>
          {recording ? `REC ${formatTimer(elapsed)}` : phase === "uploading" ? "Uploading audio…" : "Examiner scoring…"}
        </span>}
        {recording && <span style={{fontSize:11,color:"var(--ink3)"}}>target ≈ {formatTimer(partMeta.durationHint)}</span>}
      </div>
      {errMsg && <div className="why" style={{color:"var(--rose)",marginTop:8}}>{errMsg}</div>}
    </div>}

    {/* Score display */}
    {score && <div className="card" style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:14,flexWrap:"wrap"}}>
        <div>
          <div style={{fontFamily:"'Geist Mono',monospace",fontSize:10,color:"var(--ink3)",letterSpacing:".12em",textTransform:"uppercase"}}>Overall Band</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:48,lineHeight:1,color:"var(--ink)"}}>{formatBand(score.overall_band)}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(96px, 1fr))",gap:8,flex:1,minWidth:300}}>
          {CRITERIA_META.map(c =>
            <div key={c.id} style={{padding:"10px 12px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}
              title={c.approx ? "Ước lượng từ văn bản + nhịp nói — chưa phân tích âm vị, chỉ tham khảo tương đối." : undefined}>
              <div style={{fontSize:10,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>{c.short}{c.approx ? " ≈" : ""}</div>
              <div style={{fontSize:22,color:"var(--ink)",fontFamily:"'Fraunces',serif"}}>{c.approx ? "≈" : ""}{formatBand(score[c.id])}</div>
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {(() => { const fb=score.examiner_feedback; const hasEN = fb && ((fb.next_steps_en&&fb.next_steps_en.length) || Object.values(fb.feedback_en||{}).some(a=>a&&a.length));
            return hasEN ? <div style={{display:"inline-flex",border:"1px solid var(--border)",borderRadius:7,overflow:"hidden"}}>
              <button className="btn bsm" style={{borderRadius:0,border:"none",background:fbLang==="vi"?"var(--leaf)":"transparent",color:fbLang==="vi"?"var(--bg)":"var(--ink2)"}} onClick={()=>setFbLang("vi")}>VI</button>
              <button className="btn bsm" style={{borderRadius:0,border:"none",background:fbLang==="en"?"var(--leaf)":"transparent",color:fbLang==="en"?"var(--bg)":"var(--ink2)"}} onClick={()=>setFbLang("en")}>EN</button>
            </div> : null; })()}
          <button className="btn bg bsm" onClick={clearScore}>Try again</button>
        </div>
      </div>
      <div style={{fontSize:11,color:"var(--ink3)",marginTop:8,lineHeight:1.5}}>
        ≈ Pronunciation chỉ ước lượng từ văn bản + nhịp nói (chưa phân tích âm vị thật) — hãy xem như tham khảo tương đối, không phải điểm phát âm chính thức.
      </div>
      {score.grading_mode === "careful" && <div style={{fontSize:11,color:"var(--ink3)",marginTop:5}}>
        Careful grade · median of {score.grading_passes} independent examiner passes.
      </div>}

      {/* Real phoneme-based pronunciation (only when the optional pron stack is installed) */}
      <RealPronPanel score={score} lang={fbLang}/>

      {/* Acoustic features (compact) */}
      {score.examiner_feedback?.acoustic_features && <div style={{marginTop:14,display:"flex",gap:10,flexWrap:"wrap",fontSize:11,color:"var(--ink2)",fontFamily:"'Geist Mono',monospace"}}>
        {(() => {
          const a = score.examiner_feedback.acoustic_features;
          return [
            ["WPM", a.wpm],
            ["Words", a.word_count],
            ["Pauses", `${a.pause_count} (${a.long_pause_count} long)`],
            ["Fillers", `${a.filler_count} / 100w = ${a.filler_per_100w}`],
            ["TTR", a.type_token_ratio],
            ["Connectives", a.connective_count]
          ].map(([k,v],i) =>
            <span key={i} style={{padding:"4px 10px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:999}}>
              <span style={{color:"var(--ink3)"}}>{k}</span> {v}
            </span>);
        })()}
      </div>}

      {/* Delivery & lexis coaching derived from the metrics + transcript */}
      {score.examiner_feedback?.acoustic_features && <DeliveryLexisCoach feats={score.examiner_feedback.acoustic_features} transcript={score.user_transcript} lang={fbLang}/>}

      {/* Develop-your-answer coach — only when the answer is under-developed for the part */}
      {score.examiner_feedback?.acoustic_features && <DevelopAnswerTips score={score} part={part} lang={fbLang}/>}

      {/* Transcript */}
      {score.user_transcript && <details style={{marginTop:12,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
        <summary style={{cursor:"pointer",fontSize:12,color:"var(--ink2)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>
          Your transcript
        </summary>
        <p style={{margin:"8px 0 0 0",fontSize:13.5,color:"var(--ink)",lineHeight:1.55}}>{score.user_transcript}</p>
      </details>}

      {/* Clarity heatmap — per-word ASR confidence (approximate pronunciation/clarity signal) */}
      {score.word_clarity?.length > 0 && <ClarityHeatmap words={score.word_clarity} lang={fbLang}/>}

      {/* Hesitation & pauses — inline-annotated transcript (fillers/self-corrections; pause gaps when timing present) */}
      {score.examiner_feedback?.acoustic_features && <HesitationMap score={score} lang={fbLang}/>}

      {/* Band-7 model answer + collocations (learn-by-contrast → Lexical Resource) */}
      {question && <ModelAnswerPanel question={question} transcript={score.user_transcript} backend={backend} state={state} setState={setState}/>}

      {/* Band gap — fastest route to the next half-band */}
      {score.examiner_feedback?.band_gap?.weakest_criterion && (() => {
        const g = score.examiner_feedback.band_gap;
        const en = fbLang==="en";
        const why = en && g.why_not_higher_en ? g.why_not_higher_en : g.why_not_higher_vi;
        const toImprove = en && g.to_improve_en?.length ? g.to_improve_en : g.to_improve_vi;
        return <div style={{marginTop:14,padding:"12px 14px",background:"var(--surface)",border:"1px solid var(--orchid, #c084fc)",borderRadius:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:8}}>
            <span style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase"}}>{en?"Closest next band":"Gần band kế tiếp nhất"}</span>
            <span style={{fontSize:13,color:"var(--ink)",fontWeight:600}}>{g.weakest_criterion}</span>
            <span style={{fontFamily:"'Fraunces',serif",fontSize:16,color:"var(--ink)"}}>{formatBand(g.current_band)} → {formatBand(g.next_band)}</span>
          </div>
          {why && <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.55,marginBottom:6}}>{why}</div>}
          {toImprove?.length > 0 && <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.55}}>
            {toImprove.map((x,i) => <li key={i}>{x}</li>)}
          </ul>}
        </div>;
      })()}

      {/* Feedback per criterion (language-aware) */}
      <div style={{marginTop:14,display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:12}}>
        {Object.entries((() => { const fb=score.examiner_feedback||{}; const en=fbLang==="en"&&fb.feedback_en&&Object.values(fb.feedback_en).some(a=>a&&a.length); return (en?fb.feedback_en:fb.feedback_vi)||{}; })()).map(([key, bullets]) =>
          <div key={key} style={{padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8}}>
            <div style={{fontSize:11,color:"var(--ink3)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>
              {FEEDBACK_KEY_MAP[key] || key}
            </div>
            <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.55}}>
              {(bullets || []).map((b,i) => <li key={i}>{b}</li>)}
            </ul>
            {score.examiner_feedback?.evidence?.[key]?.length > 0 && <div style={{marginTop:8,fontSize:11,color:"var(--ink3)"}}>
              <em>Evidence:</em> {score.examiner_feedback.evidence[key].map((e,i) =>
                <span key={i} style={{display:"inline-block",margin:"2px 4px 2px 0",padding:"1px 6px",background:"var(--bg2,#f5f5f7)",borderRadius:4,fontStyle:"italic"}}>"{e}"</span>
              )}
            </div>}
          </div>
        )}
      </div>

      {/* Next steps (language-aware) */}
      {(() => { const fb=score.examiner_feedback||{}; const steps = (fbLang==="en"&&fb.next_steps_en?.length)?fb.next_steps_en:fb.next_steps_vi;
        return steps?.length > 0 && <div style={{marginTop:12,padding:"10px 14px",background:"var(--surface)",border:"1px solid var(--leaf)",borderRadius:8}}>
        <div style={{fontSize:11,color:"var(--leaf)",fontFamily:"'Geist Mono',monospace",letterSpacing:".08em",textTransform:"uppercase",marginBottom:6}}>{fbLang==="en"?"Next steps":"Bước tiếp theo"}</div>
        <ul style={{margin:0,paddingLeft:18,fontSize:12.5,color:"var(--ink)",lineHeight:1.55}}>
          {steps.map((s,i) => <li key={i}>{s}</li>)}
        </ul>
      </div>; })()}
    </div>}

    {/* History */}
    {tests.length > 0 && <div className="card" style={{marginBottom:14}}>
      <div className="card-h"><div className="cdot"/>Recent attempts ({tests.length})</div>
      <ul style={{listStyle:"none",padding:0,margin:"10px 0 0 0",display:"flex",flexDirection:"column",gap:6}}>
        {tests.slice(0, 8).map(t =>
          <li key={t.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",border:"1px solid var(--border)",borderRadius:8,background:"var(--surface)"}}>
            <span style={{fontFamily:"'Geist Mono',monospace",fontSize:10,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".08em",minWidth:60}}>{t.part}</span>
            <span style={{fontSize:12,color:"var(--ink2)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.offline ? "Self practice - " : ""}{t.question_text}</span>
            <span style={{fontFamily:t.offline?"'Geist Mono',monospace":"'Fraunces',serif",fontSize:t.offline?10:18,color:"var(--ink)",minWidth:36,textAlign:"right"}}>{t.offline ? "SELF" : formatBand(t.overall_band)}</span>
            <span style={{fontSize:11,color:"var(--ink3)",minWidth:80,textAlign:"right"}}>{new Date(t.date).toLocaleDateString()}</span>
          </li>
        )}
      </ul>
    </div>}

    {/* Help footer */}
    {!health.ok && !health.checking && <div className="card" style={{marginBottom:14,background:"var(--surface)"}}>
      <div className="card-h"><div className="cdot" style={{background:"var(--rose)"}}/>Backend not running</div>
      <ol style={{margin:"8px 0 0 0",paddingLeft:20,fontSize:12.5,color:"var(--ink2)",lineHeight:1.7}}>
        <li>Double-click <code>start-speaking-backend.bat</code> in the project folder</li>
        <li>Or open a terminal in the <code>speaking-backend/</code> folder</li>
        <li>Activate venv and install deps (see <code>speaking-backend/README.md</code>)</li>
        <li>Edit <code>.env</code> and paste your <code>EXAMINER_API_KEY</code> (Groq / OpenAI / etc.)</li>
        <li>Run <code>python -m src.seed_questions</code> once</li>
        <li>Start the server: <code>.\.venv\Scripts\python.exe -m uvicorn src.main:app --host 127.0.0.1 --port 8000</code></li>
        <li>Change the backend URL in <em>Settings</em> if not on the default port</li>
      </ol>
    </div>}
  </div>;
}
