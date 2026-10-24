const NAV_ITEMS = [
  {id:"dashboard",icon:"◈",label:"Dashboard"},
  {id:"vocab",icon:"✦",label:"Vocab"},
  {id:"vn_exams",icon:"🇻🇳",label:"VN Exams"},
  {id:"practice",icon:"✍️",label:"Writing"},
  {id:"reading",icon:"📖",label:"Reading"},
  {id:"listening",icon:"🎧",label:"Listening"},
  {id:"speaking",icon:"🗣️",label:"Speaking"},
  {id:"saved",icon:"🔖",label:"Saved"},
  {id:"settings",icon:"⚙",label:"Settings"}
];

// ─── Gemini retry toast ──────────────────────────────────────────────────────
// Listens for the custom event dispatched by callAPI on 429 auto-retry.
// Shows a small, unobtrusive pill at the bottom-right so the user knows
// the app is working rather than frozen.
function GeminiRetryToast() {
  const [msg,setMsg] = useState("");
  const timerRef = useRef(null);
  useEffect(()=>{
    const handler = (e) => {
      const {provider,delaySec,attempt} = e.detail || {};
      setMsg(`${provider||"AI"} rate limit — auto-retrying ${attempt}/2 in ${delaySec}s…`);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(()=>setMsg(""), (delaySec+4)*1000);
    };
    document.addEventListener("ielts-api-retry", handler);
    return ()=>{ document.removeEventListener("ielts-api-retry", handler); clearTimeout(timerRef.current); };
  },[]);
  if (!msg) return null;
  return <div style={{
    position:"fixed",bottom:72,right:16,zIndex:9999,
    background:"var(--surface2)",border:"1px solid var(--honey)",color:"var(--honey)",
    borderRadius:8,padding:"8px 14px",fontSize:12,lineHeight:1.4,maxWidth:300,
    boxShadow:"0 8px 24px color-mix(in srgb, var(--bg) 42%, transparent)",fontFamily:"'Geist Mono',monospace",
    animation:"none",pointerEvents:"none"
  }}>⏳ {msg}</div>;
}
// ─────────────────────────────────────────────────────────────────────────────

// Failover toast: shows when callAPI auto-switches to another provider (or is trying to),
// so the user knows their AI task kept running on a different provider.
function FailoverToast() {
  const [msg,setMsg] = useState("");
  const [tone,setTone] = useState("honey");
  const timerRef = useRef(null);
  useEffect(()=>{
    const show = (text, t, ms) => {
      setMsg(text); setTone(t);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(()=>setMsg(""), ms);
    };
    const onTry = (e) => { const d=e.detail||{}; show(`${d.failed||"Provider"} unavailable — switching to ${d.next||"another provider"}…`, "honey", 8000); };
    const onOk  = (e) => { const d=e.detail||{}; show(`Switched to ${d.now||"another provider"} — task continued.`, "leaf", 6000); };
    document.addEventListener("ielts-api-failover-try", onTry);
    document.addEventListener("ielts-api-failover", onOk);
    return ()=>{ document.removeEventListener("ielts-api-failover-try", onTry); document.removeEventListener("ielts-api-failover", onOk); clearTimeout(timerRef.current); };
  },[]);
  if (!msg) return null;
  const color = tone==="leaf" ? "var(--leaf)" : "var(--honey)";
  return <div style={{
    position:"fixed",bottom:108,right:16,zIndex:9999,
    background:"var(--surface2)",border:`1px solid ${color}`,color,
    borderRadius:8,padding:"8px 14px",fontSize:12,lineHeight:1.4,maxWidth:320,
    boxShadow:"0 8px 24px color-mix(in srgb, var(--bg) 42%, transparent)",fontFamily:"'Geist Mono',monospace",
    animation:"none",pointerEvents:"none"
  }}>{tone==="leaf"?"✓":"⇄"} {msg}</div>;
}
// ─────────────────────────────────────────────────────────────────────────────

// Paste-image OCR status: shows while a pasted image is being transcribed into a textarea.
function PasteStatusToast() {
  const [msg,setMsg] = useState("");
  const [tone,setTone] = useState("sky");
  const timerRef = useRef(null);
  useEffect(()=>{
    const h = (e) => {
      const d = e.detail || {};
      setTone(d.state==="error" ? "rose" : d.state==="done" ? "leaf" : "sky");
      setMsg(d.message || "");
      clearTimeout(timerRef.current);
      if (d.state !== "busy") timerRef.current = setTimeout(()=>setMsg(""), 4000);
    };
    document.addEventListener("ielts-paste-status", h);
    return ()=>{ document.removeEventListener("ielts-paste-status", h); clearTimeout(timerRef.current); };
  },[]);
  if (!msg) return null;
  const c = tone==="rose" ? "var(--rose)" : tone==="leaf" ? "var(--leaf)" : "var(--sky)";
  return <div style={{
    position:"fixed",bottom:144,right:16,zIndex:9999,
    background:"var(--surface2)",border:`1px solid ${c}`,color:c,
    borderRadius:8,padding:"8px 14px",fontSize:12,lineHeight:1.4,maxWidth:320,
    boxShadow:"0 8px 24px color-mix(in srgb, var(--bg) 42%, transparent)",fontFamily:"'Geist Mono',monospace",
    pointerEvents:"none"
  }}>🖼 {msg}</div>;
}

function StorageErrorToast() {
  const [msg,setMsg] = useState("");
  const timerRef = useRef(null);
  useEffect(()=>{
    const handler = (e) => {
      setMsg(e.detail?.message || "Browser storage save failed.");
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(()=>setMsg(""), 12000);
    };
    window.addEventListener(STORAGE_SAVE_ERROR_EVENT, handler);
    return ()=>{ window.removeEventListener(STORAGE_SAVE_ERROR_EVENT, handler); clearTimeout(timerRef.current); };
  },[]);
  if (!msg) return null;
  return <div style={{
    position:"fixed",bottom:72,left:16,zIndex:9999,
    background:"var(--surface2)",border:"1px solid var(--rose)",color:"var(--rose)",
    borderRadius:8,padding:"8px 14px",fontSize:12,lineHeight:1.4,maxWidth:360,
    boxShadow:"0 8px 24px color-mix(in srgb, var(--bg) 42%, transparent)",fontFamily:"'Geist Mono',monospace",
    animation:"none",pointerEvents:"none"
  }}>Storage warning: {msg}</div>;
}

function StudyPlanReminderToast({state,setState,setPage}) {
  const [reminder,setReminder] = useState(null);
  const [leaving,setLeaving] = useState(false);
  const clearTimerRef = useRef(null);
  const skillPages = {writing:"practice",reading:"reading",listening:"listening",speaking:"speaking",vocab:"vocab",review:"dashboard",thptqg:"vn_exams",vact:"vn_exams",vn_exams:"vn_exams"};

  useEffect(()=>{
    const toMinutes = (time) => {
      const m = /^(\d{2}):(\d{2})$/.exec(time||"");
      return m ? Number(m[1])*60 + Number(m[2]) : null;
    };
    const tick = () => {
      const plans = typeof normalizeStudyPlans === "function" ? normalizeStudyPlans(state.studyPlans) : (state.studyPlans || {});
      const today = TODAY();
      const daily = plans.dailyPlan || {};
      if (daily.date !== today) return;
      const now = new Date();
      const nowMins = now.getHours()*60 + now.getMinutes();
      const dueItems = (daily.items||[]).filter(item=>{
        const itemMins = toMinutes(item.time);
        const st = `${today} ${item.time}`;
        return itemMins !== null && itemMins <= nowMins && !item.done && item.notifiedAt !== st;
      });
      if (!dueItems.length) return;
      const due = dueItems[0];
      const stamp = `${today} ${due.time}`;
      // Opening the app after several scheduled times have passed used to drip one toast per past
      // item (one every 30s). Show a single summary and stamp ALL currently-due items at once.
      setReminder(dueItems.length>1 ? {...due, title:`${dueItems.length} study tasks are due — next: ${due.title}`} : due);
      setLeaving(false);
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = setTimeout(()=>{
        setLeaving(true);
        clearTimerRef.current = setTimeout(()=>setReminder(null), 320);
      }, 7000);
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try { new Notification("Study Plan reminder", {body:due.title}); } catch {}
      }
      const dueIds = new Set(dueItems.map(i=>i.id));
      setState(s=>{
        const current = typeof normalizeStudyPlans === "function" ? normalizeStudyPlans(s.studyPlans) : (s.studyPlans || {});
        return {
          ...s,
          studyPlans:{
            ...current,
            dailyPlan:{
              ...(current.dailyPlan||{}),
              items:((current.dailyPlan||{}).items||[]).map(item=>dueIds.has(item.id)?{...item,notifiedAt:`${today} ${item.time}`}:item)
            }
          }
        };
      });
    };
    tick();
    const id = setInterval(tick, 30000);
    return ()=>{ clearInterval(id); clearTimeout(clearTimerRef.current); };
  },[state.studyPlans]);

  if (!reminder) return null;
  return <div className="era-toast-host" style={{bottom:122}}>
    <div className={`era-toast t-sky ${leaving?"leaving":""}`}>
      <div style={{flex:1,minWidth:0}}>
        <div className="era-toast-title">Study reminder</div>
        <div className="era-toast-body">{reminder.title}</div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:8}}>
          <button className="btn bsm bg" onClick={()=>setReminder(null)}>Dismiss</button>
          <button className="btn bsm bp" onClick={()=>{setReminder(null);setPage(skillPages[reminder.skill]||"dashboard");}}>Open</button>
        </div>
      </div>
      <button className="era-toast-x" onClick={()=>setReminder(null)}>x</button>
    </div>
  </div>;
}

function DiagnosticPlacementModal({ state, setState, onClose }) {
  const [step, setStep] = useState(state.userProfile?.targetExam ? "test" : "survey"); // "survey" | "test" | "result"
  const [targetExam, setTargetExam] = useState(state.targetTrack || "thptqg");
  const [targetScore, setTargetScore] = useState("9.0+");
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes = 600 seconds
  const [isTestActive, setIsTestActive] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);

  const testData = typeof VN_DIAGNOSTIC_TEST !== "undefined" ? VN_DIAGNOSTIC_TEST : null;
  const questions = testData?.questions || [];

  // Countdown timer
  useEffect(() => {
    if (step !== "test" || !isTestActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, isTestActive, timeLeft]);

  const startTest = () => {
    setState(s => ({
      ...s,
      targetTrack: targetExam,
      userProfile: { ...(s.userProfile || {}), targetExam, targetScore }
    }));
    setStep("test");
    setIsTestActive(true);
  };

  const handleSelectChoice = (qIdx, choiceIdx) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: choiceIdx }));
  };

  const handleSubmitTest = () => {
    setIsTestActive(false);
    let correctCount = 0;
    const skillScores = {};

    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const isCorrect = selected != null && q.options[selected]?.isCorrect;
      if (isCorrect) correctCount++;
      const skill = q.skill || "General";
      if (!skillScores[skill]) skillScores[skill] = { correct: 0, total: 0 };
      skillScores[skill].total++;
      if (isCorrect) skillScores[skill].correct++;
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    let cefrLevel = "B1 (Intermediate)";
    if (percent >= 85) cefrLevel = "C1+ (Advanced / Mastery)";
    else if (percent >= 65) cefrLevel = "B2+ (Upper-Intermediate)";
    else if (percent >= 50) cefrLevel = "B2 (Competent)";

    const result = {
      score: correctCount,
      total: questions.length,
      percent,
      cefrLevel,
      skillScores,
      date: new Date().toISOString()
    };

    setScoreResult(result);
    setStep("result");
    setState(s => ({
      ...s,
      diagnosticCompleted: true,
      diagnosticResults: result
    }));
  };

  const dismiss = () => {
    setState(s => ({ ...s, diagnosticCompleted: true }));
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ width: "min(760px, 100%)", maxHeight: "94vh", overflowY: "auto", padding: 26, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        {step === "survey" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <span className="chip" style={{ background: "color-mix(in srgb, var(--sky) 15%, var(--surface))", color: "var(--sky)", fontWeight: 700 }}>
                  Chẩn đoán đầu vào · 10 Phút
                </span>
                <h2 style={{ fontSize: 24, fontFamily: "'Fraunces',serif", fontWeight: 700, color: "var(--ink)", marginTop: 6, marginBottom: 4 }}>
                  Khảo Sát & Đánh Giá Năng Lực Ban Đầu
                </h2>
                <p style={{ fontSize: 13, color: "var(--ink2)", margin: 0 }}>
                  Xác định chính xác lỗ hổng ngữ pháp, từ vựng và kỹ năng đọc hiểu để AI cá nhân hoá lộ trình ôn thi.
                </p>
              </div>
              <button className="btn bg bsm" onClick={dismiss}>✕ Để sau</button>
            </div>

            <div style={{ margin: "20px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 650, color: "var(--ink)", marginBottom: 8 }}>
                1. Kì thi trọng tâm bạn đang ôn luyện là gì?
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 18 }}>
                {[
                  { id: "thptqg", name: "THPT Quốc Gia (Tiếng Anh)", desc: "Mục tiêu 9.0+ · Trọng tâm đề Bộ GD & Chuyên" },
                  { id: "vact", name: "V-ACT ĐGNL ĐHQG-HCM", desc: "Mục tiêu 850+ · Ngữ pháp cấu trúc & Collocations" },
                  { id: "ielts", name: "IELTS Academic", desc: "Mục tiêu Band 7.0 - 8.0 · Học thuật & Viết luận" },
                  { id: "all", name: "Toàn Diện (All-in-One)", desc: "Hợp nhất toàn bộ từ vựng và đề thi" }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setTargetExam(item.id)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: `1.5px solid ${targetExam === item.id ? "var(--leaf)" : "var(--border)"}`,
                      background: targetExam === item.id ? "color-mix(in srgb, var(--leaf) 10%, var(--surface))" : "var(--surface2)",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: targetExam === item.id ? "var(--leaf)" : "var(--ink)" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 3 }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 650, color: "var(--ink)", marginBottom: 8 }}>
                2. Mục tiêu điểm số bạn muốn đạt được:
              </div>
              <input
                className="era-input"
                value={targetScore}
                onChange={e => setTargetScore(e.target.value)}
                placeholder="Ví dụ: 9.6 điểm THPTQG hoặc Band 7.5 IELTS"
                style={{ width: "100%", maxWidth: 360, marginBottom: 20 }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <button className="btn bg bsm" onClick={dismiss}>Bỏ qua bài test (vào thẳng ứng dụng)</button>
              <button className="btn bp" onClick={startTest}>Bắt đầu làm bài test 10 phút →</button>
            </div>
          </div>
        )}

        {step === "test" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Câu hỏi {currentQ + 1} / {questions.length}</span>
                <span className="chip" style={{ marginLeft: 8, fontSize: 10.5 }}>{questions[currentQ]?.skill}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: "'Geist Mono',monospace", fontWeight: 700, color: timeLeft < 120 ? "var(--rose)" : "var(--honey)", fontSize: 14 }}>
                  ⏱ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
                <button className="btn bg bsm" onClick={dismiss}>✕ Dừng test</button>
              </div>
            </div>

            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", background: "var(--surface2)", padding: "16px 18px", borderRadius: 8, marginBottom: 16, lineHeight: 1.55 }}>
              {questions[currentQ]?.prompt}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {questions[currentQ]?.options?.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectChoice(currentQ, i)}
                  style={{
                    padding: "13px 16px",
                    borderRadius: 8,
                    textAlign: "left",
                    border: userAnswers[currentQ] === i ? "1.5px solid var(--sky)" : "1px solid var(--border)",
                    background: userAnswers[currentQ] === i ? "color-mix(in srgb, var(--sky) 12%, var(--surface))" : "var(--surface)",
                    color: "var(--ink)",
                    cursor: "pointer",
                    fontSize: 13.5
                  }}
                >
                  <span style={{ fontWeight: 700, marginRight: 8 }}>{opt.key}.</span> {opt.text}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button className="btn bg bsm" disabled={currentQ === 0} onClick={() => setCurrentQ(q => q - 1)}>
                ← Câu trước
              </button>
              {currentQ < questions.length - 1 ? (
                <button className="btn bp bsm" onClick={() => setCurrentQ(q => q + 1)}>
                  Câu tiếp theo →
                </button>
              ) : (
                <button className="btn bl bsm" onClick={handleSubmitTest}>
                  Nộp bài & Chấm điểm ✓
                </button>
              )}
            </div>
          </div>
        )}

        {step === "result" && scoreResult && (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 6 }}>🎯</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", marginBottom: 4 }}>
              Kết Quả Chẩn Đoán Trình Độ
            </h2>
            <div style={{ fontSize: 13, color: "var(--ink2)", marginBottom: 18 }}>
              Kì thi: <strong style={{ textTransform: "uppercase" }}>{targetExam}</strong> · Mục tiêu: <strong>{targetScore}</strong>
            </div>

            <div style={{ display: "inline-block", background: "color-mix(in srgb, var(--leaf) 12%, var(--surface))", border: "1px solid var(--leaf)", borderRadius: 12, padding: "16px 28px", marginBottom: 20 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "var(--leaf)" }}>
                {scoreResult.score} / {scoreResult.total}
              </div>
              <div style={{ fontSize: 14, fontWeight: 650, color: "var(--ink)" }}>
                Trình độ ước tính: {scoreResult.cefrLevel}
              </div>
            </div>

            <div style={{ maxWidth: 540, margin: "0 auto 24px", textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Đánh giá theo từng phần kỹ năng:</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(scoreResult.skillScores || {}).map(([skill, data]) => {
                  const sPercent = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={skill} style={{ background: "var(--surface2)", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 550 }}>{skill}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: sPercent >= 70 ? "var(--leaf)" : "var(--honey)" }}>
                        {data.correct}/{data.total} ({sPercent}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button className="btn bp" onClick={onClose} style={{ minWidth: 200 }}>
              Áp dụng & Vào học ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function OnboardingWizard({state,setState,setPage,hasConfig}) {
  if (state.onboardingComplete) return null;
  const finish = (mode, page, patch={}) => {
    setState(s=>({
      ...s,
      onboardingComplete:true,
      learnerMode:mode,
      targetBand: patch.targetBand ?? s.targetBand ?? 6.5,
      wordsPerDay: patch.wordsPerDay ?? s.wordsPerDay ?? 3,
      activeSublists: patch.activeSublists || s.activeSublists || [1,2,3],
      ...patch
    }));
    setPage(page);
  };
  const dismiss = () => setState(s=>({...s,onboardingComplete:true}));
  const serverMode = canUseFolderStorage();
  return <div style={{position:"fixed",inset:0,zIndex:10000,background:"color-mix(in srgb, var(--bg) 78%, transparent)",display:"flex",alignItems:"center",justifyContent:"center",padding:18}}>
    <div className="card" style={{width:"min(720px,100%)",maxHeight:"92vh",overflow:"auto",boxShadow:"0 18px 60px color-mix(in srgb, var(--bg) 55%, transparent)"}}>
      <div className="kicker">First session</div>
      <h1 className="title-x" style={{marginBottom:8}}>Start with one <em>track</em></h1>
      <div style={{fontSize:12.5,color:"var(--ink2)",lineHeight:1.6,marginBottom:14}}>
        Pick one route now. You can change every setting later.
      </div>
      <div className="cols-3" style={{marginBottom:12}}>
        <button style={{textAlign:"left",cursor:"pointer",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:13,color:"var(--ink)"}} onClick={()=>finish("starter-writing","practice",{targetBand:6.5,activeSublists:[1,2,3],wordsPerDay:3})}>
          <div className="card-h"><div className="cdot"/>Writing starter</div>
          <div style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55}}>Band 6.5 target, Task 1/2 practice, small daily vocab load.</div>
        </button>
        <button style={{textAlign:"left",cursor:"pointer",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:13,color:"var(--ink)"}} onClick={()=>finish("vocab-first","vocab",{targetBand:6.5,activeSublists:[1,2,3],wordsPerDay:5})}>
          <div className="card-h"><div className="cdot" style={{background:"var(--leaf)"}}/>Vocab first</div>
          <div style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55}}>Five focused words today, AWL sublists 1-3, then quiz.</div>
        </button>
        <button style={{textAlign:"left",cursor:"pointer",background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:13,color:"var(--ink)"}} onClick={()=>finish("setup-first","settings",{activeSublists:[1,2,3],wordsPerDay:3})}>
          <div className="card-h"><div className="cdot" style={{background:"var(--sky)"}}/>Set up AI</div>
          <div style={{fontSize:12,color:"var(--ink2)",lineHeight:1.55}}>{hasConfig ? "Review your provider and storage mode." : "Add one provider key before generating or grading."}</div>
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:14}}>
        <div className="alert ai" style={{marginBottom:0}}>Browser mode: localStorage only</div>
        <div className={`alert ${serverMode?"ag":"aw"}`} style={{marginBottom:0}}>{serverMode ? "Folder storage: active" : "Folder storage: run node scripts/serve.mjs"}</div>
        <div className="alert aw" style={{marginBottom:0}}>Speaking scoring needs backend</div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <button className="btn bg bsm" onClick={dismiss}>Skip</button>
        {!hasConfig&&<button className="btn bp bsm" onClick={()=>finish("setup-first","settings",{activeSublists:[1,2,3],wordsPerDay:3})}>Add API key</button>}
      </div>
    </div>
  </div>;
}

function App() {
  const [page,setPage] = useState("dashboard");
  const [state,setStateRaw] = useState(()=>loadState());
  const [configs,setConfigsRaw] = useState(()=>loadConfigs());
  const [activeId,setActiveIdRaw] = useState(()=>loadActiveId());
  const config = useMemo(()=>configs.find(c=>c.id===activeId)||null,[configs,activeId]);
  // Cross-page vocab navigation (from the hover/selection lookup layer): {word, origin, mode}.
  const [vocabNav,setVocabNav] = useState(null);
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const pageRef = useRef(page); pageRef.current = page;

  const [folderStorage,setFolderStorage] = useState(()=>{
    const enabled = canUseFolderStorage();
    return {enabled,ready:!enabled,status:enabled?`Syncing ${STORAGE_FILE_LABEL}...`:"Browser localStorage",path:STORAGE_FILE_LABEL};
  });
  const folderStorageLoadedRef = useRef(!canUseFolderStorage());

  useEffect(()=>{
    if (!canUseFolderStorage()) return;
    let cancelled = false;
    (async()=>{
      try {
        const bundle = await loadFolderStorage();
        if (cancelled) return;
        if (bundle) {
          const applied = applyStorageBundle(bundle);
          if (applied) {
            setStateRaw(applied.state);
            setConfigsRaw(applied.configs);
            setActiveIdRaw(applied.activeId);
          }
          setFolderStorage({enabled:true,ready:true,status:`Loaded ${STORAGE_FILE_LABEL}`,path:STORAGE_FILE_LABEL});
        } else {
          await saveFolderStorage(makeStorageBundle(state,configs,activeId));
          if (!cancelled) setFolderStorage({enabled:true,ready:true,status:`Created ${STORAGE_FILE_LABEL}`,path:STORAGE_FILE_LABEL});
        }
      } catch(e) {
        if (!cancelled) setFolderStorage({enabled:true,ready:false,status:`Folder sync error: ${e.message}`,path:STORAGE_FILE_LABEL});
      } finally {
        folderStorageLoadedRef.current = true;
      }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  useEffect(()=>{ applyDesignEra(state.designEra||"modern"); },[state.designEra]);

  // Keep the API-failover registry in sync: callAPI can then transparently switch to
  // any other saved provider when the active one is rate-limited / keyless / down.
  useEffect(()=>{ registerFailoverConfigs(configs, activeId, {enabled: state.apiFailover !== false}); },[configs, activeId, state.apiFailover]);

  // Global bookmark toggle: SaveButton instances deep in the tree (with no setState) dispatch
  // this event; we write to state.saved here so the whole app shares one Saved store.
  useEffect(()=>{
    const h = (e) => { const item = e.detail && e.detail.item; if (item) setState(s=>({...s, saved: toggleSavedItem(s.saved, item)})); };
    document.addEventListener("ielts-toggle-saved", h);
    return ()=>document.removeEventListener("ielts-toggle-saved", h);
  },[]);

  // Vocab lookup navigation: open a word's page (lookup mode), or seed Import for a new word.
  // origin is captured so the focused word page's Back button returns the user where they were.
  useEffect(()=>{
    const onOpen = (e) => { const w = e.detail && e.detail.word; if (!w) return; setVocabNav({word:w, origin:pageRef.current, mode:"lookup"}); setPage("vocab"); };
    const onImport = (e) => {
      const w = e.detail && e.detail.word; if (!w) return;
      setState(s=>{ const draft = s.vocabImportDraft || {}; const cands = Array.isArray(draft.candidates) ? draft.candidates.filter(c=>c.word!==w) : [];
        return {...s, vocabImportDraft:{...draft, text:(draft.text?draft.text+"\n":"")+w, candidates:[{word:w,status:"new",sublist:null,selected:true},...cands]}}; });
      setVocabNav({word:w, origin:pageRef.current, mode:"import"}); setPage("vocab");
    };
    document.addEventListener("ielts-open-vocab", onOpen);
    document.addEventListener("ielts-import-vocab", onImport);
    return ()=>{ document.removeEventListener("ielts-open-vocab", onOpen); document.removeEventListener("ielts-import-vocab", onImport); };
  },[]);

  const lastSavedPayloadRef = useRef("");
  useEffect(()=>{
    if (!canUseFolderStorage() || !folderStorageLoadedRef.current) return;
    const id = setTimeout(()=>{
      const bundle = makeStorageBundle(state,configs,activeId);
      const str = JSON.stringify({ state, configs, activeId });
      if (str === lastSavedPayloadRef.current) return; // Skip redundant network payloads
      lastSavedPayloadRef.current = str;
      saveFolderStorage(bundle)
        .then(()=>setFolderStorage(s=>({...s,enabled:true,ready:true,status:`Saved ${STORAGE_FILE_LABEL} ${new Date().toLocaleTimeString()}`})))
        .catch(e=>setFolderStorage(s=>({...s,enabled:true,ready:false,status:`Folder sync error: ${e.message}`})));
    }, 2500);
    return ()=>clearTimeout(id);
  },[state,configs,activeId]);


  // Setters that persist to localStorage automatically (single source of truth).
  // Support BOTH object and functional updater forms — functional form is required for
  // race-safe concurrent updates (e.g. quiz batch-loading missing words).
  const setState = (ns) => {
    if (typeof ns === 'function') {
      setStateRaw(prev => { const next = ns(prev); saveState(next); return next; });
    } else { setStateRaw(ns); saveState(ns); }
  };
  const setConfigs = (nc) => {
    if (typeof nc === 'function') {
      setConfigsRaw(prev => { const next = nc(prev); saveConfigs(next); return next; });
    } else { setConfigsRaw(nc); saveConfigs(nc); }
  };
  const setActiveId = (id) => {
    if (typeof id === 'function') {
      setActiveIdRaw(prev => { const next = id(prev); saveActiveId(next); return next; });
    } else { setActiveIdRaw(id); saveActiveId(id); }
  };

  const today = TODAY();
  const schedule = useMemo(()=>getSchedule(state.startDate, state.wordsPerDay, state.activeSublists),[state.startDate, state.wordsPerDay, state.activeSublists]);
  const todayEntry = schedule.find(d=>d.date===today);
  const todayDone = !!state.completedDays[today];
  const hasPriority = state.priorityWords.length > 0;
  // V6: surface revision queue in nav
  const dueRevisitCount = useMemo(()=>getDueRevisits(state.essays||[]).length,[state.essays]);
  const navVocabProgress = useMemo(()=>getAWLProgressData(state),[state.mastery,state.dailyStats,state.wordCache,state.customVocab]);

  const pageTitle = {
    dashboard: "Dashboard",
    vocab: "Vocab",
    vn_exams: "Vietnam Exams (THPTQG + V-ACT)",
    practice: "IELTS Writing",
    reading: "IELTS Reading",
    listening: "IELTS Listening",
    speaking: "IELTS Speaking",
    saved: "Saved",
    settings: "Settings"
  }[page] || "Dashboard";

  return <div className="app">
    <nav className="sidebar">
      <div className="brand">
        <div className="brand-tag">English Mastery Lab</div>
        <div className="brand-name">Mastery <em>Lab</em> ✦</div>
      </div>

      {/* 1. Core */}
      <div className="nav-group">
        <div className="nav-label">Core</div>
        <div className={`ni ${page==="dashboard"?"active":""}`} onClick={()=>setPage("dashboard")}>
          <span style={{fontFamily:"'Fraunces',serif",fontSize:14,fontStyle:"italic"}}>◈</span>Dashboard
          <div className="ni-dot"/>
        </div>
        <div className={`ni ${page==="vocab"?"active":""}`} onClick={()=>setPage("vocab")}>
          <span style={{fontFamily:"'Fraunces',serif",fontSize:14,fontStyle:"italic"}}>✦</span>Vocab
          {((!todayDone&&todayEntry)||hasPriority)&&<span className="ni-badge">{hasPriority?"boost":"today"}</span>}
          <div className="ni-dot"/>
        </div>
      </div>

      {/* 2. Vietnam Exams (THPTQG + V-ACT) */}
      <div className="nav-group">
        <div className="nav-label" style={{color:"var(--gold, #eab308)",fontWeight:600}}>Vietnam Exams</div>
        <div className={`ni ${page==="vn_exams"?"active":""}`} onClick={()=>setPage("vn_exams")} title="Đề thi THPT Quốc Gia & ĐGNL ĐHQG-HCM V-ACT">
          <span style={{fontSize:14}}>🇻🇳</span>THPTQG + V-ACT
          <span className="ni-badge" style={{background:"rgba(234,179,8,0.12)",color:"var(--gold, #eab308)",fontWeight:700}}>2026</span>
          <div className="ni-dot"/>
        </div>
      </div>

      {/* 3. IELTS (4 skills) */}
      <div className="nav-group">
        <div className="nav-label">IELTS (4 skills)</div>
        <div className={`ni ${page==="practice"?"active":""}`} onClick={()=>setPage("practice")}>
          <span style={{fontSize:13}}>✍️</span>Writing
          {dueRevisitCount>0&&<span className="ni-badge" style={{background:"color-mix(in srgb, var(--orchid) 16%, var(--surface2))",color:"var(--orchid)"}}>🔁{dueRevisitCount}</span>}
          <div className="ni-dot"/>
        </div>
        <div className={`ni ${page==="reading"?"active":""}`} onClick={()=>setPage("reading")}>
          <span style={{fontSize:13}}>📖</span>Reading
          <div className="ni-dot"/>
        </div>
        <div className={`ni ${page==="listening"?"active":""}`} onClick={()=>setPage("listening")}>
          <span style={{fontSize:13}}>🎧</span>Listening
          <div className="ni-dot"/>
        </div>
        <div className={`ni ${page==="speaking"?"active":""}`} onClick={()=>setPage("speaking")}>
          <span style={{fontSize:13}}>🗣️</span>Speaking
          <div className="ni-dot"/>
        </div>
      </div>

      {/* 4. Saved & Config */}
      <div className="nav-group">
        <div className="nav-label">Saved & Config</div>
        <div className={`ni ${page==="saved"?"active":""}`} onClick={()=>setPage("saved")}>
          <span style={{fontFamily:"'Fraunces',serif",fontSize:14,fontStyle:"italic",display:"inline-flex",alignItems:"center"}}><_BookmarkGlyph filled={page==="saved"} px={13}/></span>Saved
          <div className="ni-dot"/>
        </div>
        <div className={`ni ${page==="settings"?"active":""}`} onClick={()=>setPage("settings")}>
          <span style={{fontFamily:"'Fraunces',serif",fontSize:14,fontStyle:"italic"}}>⚙</span>Settings
          {!config&&<span className="ni-badge" style={{background:"color-mix(in srgb, var(--rose) 16%, var(--surface2))",color:"var(--rose)"}}>!key</span>}
          <div className="ni-dot"/>
        </div>
      </div>
      <div className="sfooter">
        <span style={{color:"var(--ink2)"}}>Vocab</span> {navVocabProgress.learnedTotal}/{navVocabProgress.total}<br/>
        <span style={{color:"var(--ink2)"}}>Daily</span> {state.wordsPerDay||3} w · Sub {(state.activeSublists||[]).join(",")}<br/>
        {config?<><span style={{color:"var(--ink2)"}}>AI</span> {config.name}</>:<span style={{color:"var(--rose)"}}>⚠ No AI config</span>}<br/>
        <span style={{color:"var(--ink2)"}}>Band</span> target {state.targetBand||7.0}<br/>
        <span style={{color:"var(--ink2)"}}>Storage</span> {folderStorageAvailable()
          ? <button type="button" title="Switch storage source between browser localStorage and the data/app-state.json folder file. Reloads the page." onClick={()=>{ const next=getStorageMode()==="folder"?"browser":"folder"; setStorageMode(next); try{location.reload();}catch{} }} style={{background:"none",border:"none",padding:0,margin:0,font:"inherit",color:"var(--leaf)",cursor:"pointer",textDecoration:"underline dotted"}}>{folderStorage.enabled?(folderStorage.ready?"folder":"syncing"):"browser"} ⇄</button>
          : (folderStorage.enabled?(folderStorage.ready?"folder":"syncing"):"browser")}<br/>
        <span style={{color:"var(--ink2)"}}>Archive</span> {(state.essays||[]).length} essay{(state.essays||[]).length===1?"":"s"}<br/>
        <span style={{color:"var(--ink2)"}}>Reading</span> {(state.readingTests||[]).length} attempt{(state.readingTests||[]).length===1?"":"s"}<br/>
        <span style={{color:"var(--ink2)"}}>Speaking</span> {(state.speakingTests||[]).length} attempt{(state.speakingTests||[]).length===1?"":"s"}
      </div>
    </nav>

    <main className="main">
      <div className="topbar">
        <div className="crumb">English Lab · <strong>{pageTitle}</strong></div>

        {/* Unified Exam Track Switcher */}
        <div className="exam-track-switcher" style={{display:"inline-flex",gap:4,background:"var(--surface2)",padding:"3px 4px",borderRadius:20,marginLeft:10}}>
          {[
            {id:"all",label:"All-in-One"},
            {id:"thptqg",label:"THPTQG"},
            {id:"vact",label:"V-ACT"},
            {id:"ielts",label:"IELTS"}
          ].map(t => (
            <button
              key={t.id}
              onClick={()=>setState(s=>({...s,targetTrack:t.id}))}
              style={{
                padding:"3px 10px",
                borderRadius:16,
                border:"none",
                fontSize:11,
                fontWeight:(state.targetTrack||"all")===t.id?700:500,
                background:(state.targetTrack||"all")===t.id?"var(--leaf)":"transparent",
                color:(state.targetTrack||"all")===t.id?"var(--bg)":"var(--ink3)",
                cursor:"pointer",
                transition:"all 0.15s ease"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button 
          className="btn bg bsm" 
          onClick={()=>setShowDiagnosticModal(true)}
          style={{fontSize:11,padding:"3px 9px",marginLeft:8}}
          title="Làm bài kiểm tra đánh giá năng lực 10 phút (Skippable & Retakeable)"
        >
          🩺 Chẩn đoán trình độ
        </button>

        {(()=>{ const svg = _eraHeroSVG(state.designEra||"modern"); return svg ? <span title={(DESIGN_ERAS.find(e=>e.id===state.designEra)||{}).label} style={{width:28,height:28,display:"block",flexShrink:0,borderRadius:5,overflow:"hidden",marginLeft:"auto",marginRight:6,opacity:.85}} dangerouslySetInnerHTML={{__html:svg}}/> : null; })()}
        <div className="target-badge" onClick={()=>setPage("settings")}>TARGET {state.targetBand||7.0}</div>
      </div>
      {page==="dashboard"&&<DashboardPage state={state} setState={setState} goTo={setPage} hasConfig={!!config} config={config}/>}
      {page==="vocab"&&<VocabPage state={state} setState={setState} config={config} vocabNav={vocabNav} setVocabNav={setVocabNav} goToPage={setPage}/>}
      {page==="vn_exams"&&<VietnamExamsPage state={state} setState={setState} config={config} goToPage={setPage}/>}
      {page==="practice"&&<PracticePage state={state} setState={setState} config={config}/>}
      {page==="reading"&&<ReadingPage state={state} setState={setState} config={config}/>}
      {page==="listening"&&<ListeningPage state={state} setState={setState} config={config}/>}
      {page==="speaking"&&<SpeakingPage state={state} setState={setState} config={config}/>}
      {page==="saved"&&<SavedPage state={state} setState={setState}/>}
      {page==="settings"&&<SettingsPage state={state} setState={setState} configs={configs} setConfigs={setConfigs} activeId={activeId} setActiveId={setActiveId}/>}
    </main>

    <nav className="bn">
      {NAV_ITEMS.map(n=><div key={n.id} className={`bni ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
        <div className="bni-icon">{n.id==="saved"?<_BookmarkGlyph filled={page==="saved"} px={17}/>:n.icon}</div>{n.label}
      </div>)}
    </nav>
    <VocabLookupLayer state={state} config={config}/>
    <TranslateWidget state={state} setState={setState} config={config} page={page}/>
    <GeminiRetryToast/>
    <FailoverToast/>
    <PasteStatusToast/>
    <StorageErrorToast/>
    <StudyPlanReminderToast state={state} setState={setState} setPage={setPage}/>
    <OnboardingWizard state={state} setState={setState} setPage={setPage} hasConfig={!!config}/>
    {showDiagnosticModal && <DiagnosticPlacementModal state={state} setState={setState} onClose={()=>setShowDiagnosticModal(false)}/>}
  </div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
