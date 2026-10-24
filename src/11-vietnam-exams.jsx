// 11-vietnam-exams.jsx — VIETNAM EXAMS SUITE (THPTQG + V-ACT)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dedicated portal for Vietnamese National High School Graduation (THPTQG)
// and VNU-HCM Academic Competency Test (V-ACT) preparation.

function VietnamExamsPage({state, setState, config, goToPage}) {
  const [activeTab, setActiveTab] = useState("tests"); // "tests" | "matrix" | "structures" | "roadmaps" | "vocab"
  const [filterTrack, setFilterTrack] = useState("all"); // "all" | "thptqg" | "vact"
  
  // Real exam simulation state
  const [simTest, setSimTest] = useState(null); // active exam being taken
  const [userAnswers, setUserAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  // AI explanation state
  const [explainingQId, setExplainingQId] = useState(null);
  const [aiExplanations, setAiExplanations] = useState({});
  const [aiError, setAiError] = useState("");

  // Structures search & filter
  const [structQuery, setStructQuery] = useState("");
  const [structCategory, setStructCategory] = useState("all");
  const [expandedStructId, setExpandedStructId] = useState(null);

  // Roadmaps progress state
  const roadmaps = typeof VN_EXAM_ROADMAPS !== "undefined" ? VN_EXAM_ROADMAPS : {};
  const completedMilestones = state.roadmapProgress || {};

  // All official tests
  const officialTests = typeof VN_EXAM_TESTS !== "undefined" ? VN_EXAM_TESTS : [];
  const filteredTests = officialTests.filter(t => filterTrack === "all" || t.examType === filterTrack);

  // All structures
  const allStructures = typeof VN_EXAM_STRUCTURES !== "undefined" ? VN_EXAM_STRUCTURES : [];
  const structCategories = useMemo(() => {
    const cats = new Set(["all"]);
    allStructures.forEach(s => { if (s.category) cats.add(s.category); });
    return Array.from(cats);
  }, [allStructures]);

  const filteredStructures = useMemo(() => {
    return allStructures.filter(s => {
      const matchCat = structCategory === "all" || s.category === structCategory;
      if (!matchCat) return false;
      if (!structQuery.trim()) return true;
      const q = structQuery.toLowerCase();
      return (
        (s.structure && s.structure.toLowerCase().includes(q)) ||
        (s.meaning && s.meaning.toLowerCase().includes(q)) ||
        (s.example && s.example.toLowerCase().includes(q)) ||
        (s.trapNote && s.trapNote.toLowerCase().includes(q))
      );
    });
  }, [allStructures, structCategory, structQuery]);

  // Timer effect for active test
  useEffect(() => {
    if (!timerRunning || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, isSubmitted]);

  const startExamSimulation = (test) => {
    setSimTest(test);
    setUserAnswers({});
    setFlaggedQuestions({});
    setTimeRemaining(test.durationSeconds || 3000);
    setTimerRunning(true);
    setIsSubmitted(false);
    setTestResult(null);
    setAiExplanations({});
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const quitExamSimulation = () => {
    if (!isSubmitted && Object.keys(userAnswers).length > 0) {
      if (!window.confirm("Bạn có chắc muốn thoát bài thi? Tiến độ làm bài hiện tại sẽ không được lưu.")) return;
    }
    setSimTest(null);
    setTimerRunning(false);
    setIsSubmitted(false);
    setTestResult(null);
  };

  const handleSelectAnswer = (qId, optionKey) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({...prev, [qId]: optionKey}));
  };

  const toggleFlagQuestion = (qId) => {
    setFlaggedQuestions(prev => ({...prev, [qId]: !prev[qId]}));
  };

  const submitExam = () => {
    if (!simTest) return;
    setTimerRunning(false);
    setIsSubmitted(true);

    let correctCount = 0;
    const totalCount = simTest.questions.length;
    const questionResults = {};

    simTest.questions.forEach(q => {
      const userAns = userAnswers[q.id];
      const isCorrect = userAns && userAns.toUpperCase() === q.correctAnswer.toUpperCase();
      if (isCorrect) correctCount++;
      questionResults[q.id] = {
        userAns: userAns || null,
        correct: isCorrect,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        distractorDiagnosis: q.distractorDiagnosis || {},
        relatedStructureId: q.relatedStructureId || null
      };
    });

    const scaledScore = simTest.examType === "thptqg"
      ? (correctCount / totalCount * 10).toFixed(2)
      : Math.round(correctCount / totalCount * 300);

    const result = {
      testId: simTest.id,
      title: simTest.title,
      examType: simTest.examType,
      correctCount,
      totalCount,
      scaledScore,
      percentage: Math.round((correctCount / totalCount) * 100),
      timeSpentSeconds: (simTest.durationSeconds || 3000) - timeRemaining,
      questionResults,
      submittedAt: new Date().toISOString()
    };

    setTestResult(result);

    // Save to user history
    setState(prev => {
      const history = prev.examHistory || [];
      return {
        ...prev,
        examHistory: [result, ...history.slice(0, 49)]
      };
    });
  };

  const requestAIExplanation = async (q) => {
    if (!config) {
      alert("Vui lòng cấu hình AI trong mục Settings (hoặc dùng Antigravity/OpenCode) để xem AI phân tích câu hỏi!");
      return;
    }
    setExplainingQId(q.id);
    setAiError("");
    try {
      const prompt = `Bạn là chuyên gia luyện thi Tiếng Anh THPT Quốc Gia và ĐGNL V-ACT.
Hãy phân tích chi tiết câu hỏi sau:
Đề thi: ${simTest?.title || 'Đề thi tiếng Anh'}
Câu hỏi: ${q.question}
${q.passage ? `Đoạn văn liên quan:\n"${q.passage}"\n` : ''}
Các phương án:
${q.options.map(o => `${o.key}. ${o.text}`).join('\n')}

Đáp án đúng: ${q.correctAnswer}
Học sinh chọn: ${userAnswers[q.id] || '(Chưa chọn)'}

Hãy giải thích:
1. Bản chất ngữ pháp / từ vựng và TẠI SAO phương án ${q.correctAnswer} là chính xác.
2. Cảnh báo BẪY PHÂN HÓA: Tại sao học sinh hay bị lừa ở các phương án gây nhiễu khác.
3. Mẹo làm bài nhanh & Cấu trúc tương đương cần nhớ cho kỳ thi 2026-2027.
Ngắn gọn, trọng tâm, súc tích trong 3-4 đoạn.`;

      const response = await callAPI(config, [{role: "user", content: prompt}], 1000, 0.7);
      setAiExplanations(prev => ({...prev, [q.id]: response}));
    } catch (e) {
      setAiError(`Lỗi khi gọi AI: ${e.message}`);
    } finally {
      setExplainingQId(null);
    }
  };

  const toggleMilestone = (mId) => {
    setState(prev => {
      const cur = prev.roadmapProgress || {};
      return {
        ...prev,
        roadmapProgress: {...cur, [mId]: !cur[mId]}
      };
    });
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER: ACTIVE EXAM SIMULATION VIEW
  // ─────────────────────────────────────────────────────────────
  if (simTest) {
    return (
      <div className="canvas fu" style={{maxWidth: 1100}}>
        {/* Exam Top Sticky Header */}
        <div style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--bg2)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)"
        }}>
          <div>
            <span className="chip" style={{fontSize: 10, textTransform: "uppercase", background: "var(--leaf)", color: "#000", fontWeight: 700, marginRight: 8}}>
              {simTest.examType}
            </span>
            <strong style={{fontSize: 14, color: "var(--ink)"}}>{simTest.title}</strong>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: 12}}>
            {!isSubmitted ? (
              <div style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 16,
                fontWeight: 700,
                color: timeRemaining < 300 ? "var(--rose)" : "var(--leaf)",
                background: "var(--surface)",
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid var(--border)"
              }}>
                ⏱ {formatTimer(timeRemaining)}
              </div>
            ) : (
              <div style={{fontWeight: 700, color: "var(--leaf)", fontSize: 15}}>
                Điểm: {testResult?.scaledScore} / {simTest.examType === "thptqg" ? "10.0" : "300"} ({testResult?.correctCount}/{testResult?.totalCount} câu)
              </div>
            )}
            {!isSubmitted ? (
              <button className="btn bp bsm" onClick={submitExam} style={{fontWeight: 600}}>
                ✓ Nộp bài thi
              </button>
            ) : (
              <button className="btn bp bsm" onClick={() => startExamSimulation(simTest)}>
                ↺ Làm lại đề này
              </button>
            )}
            <button className="btn bg bsm" onClick={quitExamSimulation}>
              ✕ Thoát
            </button>
          </div>
        </div>

        {/* Score Banner if Submitted */}
        {isSubmitted && testResult && (
          <div className="card mb16 ag" style={{padding: 16, border: "1px solid var(--leaf)"}}>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12}}>
              <div>
                <h2 style={{margin: 0, fontSize: 20, color: "var(--ink)"}}>
                  🎉 Kết quả bài thi: <span style={{color: "var(--leaf)"}}>{testResult.scaledScore} {simTest.examType === "thptqg" ? "/ 10.0 điểm" : "/ 300 điểm"}</span>
                </h2>
                <div style={{fontSize: 13, color: "var(--ink2)", marginTop: 4}}>
                  Số câu đúng: <strong>{testResult.correctCount}/{testResult.totalCount}</strong> ({testResult.percentage}%) · Thời gian làm: <strong>{Math.round(testResult.timeSpentSeconds / 60)} phút</strong>
                </div>
              </div>
              <div style={{textAlign: "right"}}>
                <span className="chip" style={{fontSize: 12, padding: "4px 12px", background: testResult.percentage >= 80 ? "var(--leaf)" : "var(--honey)", color: "#000", fontWeight: 700}}>
                  {testResult.percentage >= 90 ? "Phân hóa 9+ Xuất Sắc" : testResult.percentage >= 80 ? "Mục tiêu 8+ Đạt" : "Cần rà soát bẫy"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Navigator Pill Bar */}
        <div className="card mb16" style={{padding: 12}}>
          <div style={{fontSize: 11, color: "var(--ink3)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em"}}>
            Bảng câu hỏi nhanh ({Object.keys(userAnswers).length}/{simTest.questions.length} đã làm):
          </div>
          <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
            {simTest.questions.map((q, idx) => {
              const answered = !!userAnswers[q.id];
              const flagged = !!flaggedQuestions[q.id];
              const isCorrect = isSubmitted && userAnswers[q.id]?.toUpperCase() === q.correctAnswer?.toUpperCase();
              const isWrong = isSubmitted && answered && !isCorrect;

              let bg = "var(--surface2)";
              let color = "var(--ink)";
              let border = "1px solid var(--border)";

              if (isSubmitted) {
                if (isCorrect) { bg = "rgba(163,230,53,0.2)"; color = "var(--leaf)"; border = "1px solid var(--leaf)"; }
                else if (isWrong) { bg = "rgba(244,63,94,0.2)"; color = "var(--rose)"; border = "1px solid var(--rose)"; }
              } else {
                if (answered) { bg = "color-mix(in srgb, var(--sky) 20%, var(--surface))"; border = "1px solid var(--sky)"; }
                if (flagged) { border = "2px solid var(--honey)"; }
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    const el = document.getElementById(`q-card-${q.id}`);
                    if (el) el.scrollIntoView({behavior: "smooth", block: "center"});
                  }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: bg,
                    color: color,
                    border: border,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0
                  }}
                  title={`Câu ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Cards List */}
        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          {simTest.questions.map((q, idx) => {
            const userAns = userAnswers[q.id];
            const isFlagged = flaggedQuestions[q.id];
            const isCorrect = isSubmitted && userAns?.toUpperCase() === q.correctAnswer?.toUpperCase();
            const isWrong = isSubmitted && userAns && !isCorrect;
            const explanation = aiExplanations[q.id];

            return (
              <div
                key={q.id}
                id={`q-card-${q.id}`}
                className="card"
                style={{
                  border: isSubmitted
                    ? isCorrect
                      ? "1px solid color-mix(in srgb, var(--leaf) 50%, var(--border))"
                      : "1px solid color-mix(in srgb, var(--rose) 50%, var(--border))"
                    : isFlagged
                    ? "1px solid var(--honey)"
                    : "1px solid var(--border)"
                }}
              >
                {/* Question Header */}
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10}}>
                  <div style={{display: "flex", alignItems: "center", gap: 8}}>
                    <span style={{fontWeight: 700, fontSize: 14, color: "var(--ink)"}}>
                      Câu {idx + 1}:
                    </span>
                    {q.category && (
                      <span className="chip" style={{fontSize: 10, background: "var(--surface2)", color: "var(--ink3)"}}>
                        {q.category}
                      </span>
                    )}
                    {q.level && (
                      <span className="chip" style={{fontSize: 10, background: "rgba(234,179,8,0.12)", color: "var(--honey)"}}>
                        {q.level}
                      </span>
                    )}
                  </div>
                  {!isSubmitted && (
                    <button
                      className="btn bs bsm"
                      style={{fontSize: 11, padding: "2px 8px", borderColor: isFlagged ? "var(--honey)" : "var(--border)"}}
                      onClick={() => toggleFlagQuestion(q.id)}
                    >
                      {isFlagged ? "🚩 Đã gắn cờ" : "⚑ Gắn cờ"}
                    </button>
                  )}
                </div>

                {/* Optional Passage */}
                {q.passage && (
                  <div style={{
                    background: "var(--surface2)",
                    borderLeft: "3px solid var(--sky)",
                    padding: "10px 12px",
                    borderRadius: 4,
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: "var(--ink2)",
                    marginBottom: 12,
                    fontStyle: "italic",
                    whiteSpace: "pre-line"
                  }}>
                    {q.passage}
                  </div>
                )}

                {/* Question Text */}
                <div style={{fontSize: 13.5, fontWeight: 550, color: "var(--ink)", marginBottom: 12, lineHeight: 1.5}}>
                  {q.question}
                </div>

                {/* Options List */}
                <div style={{display: "grid", gridTemplateColumns: "1fr", gap: 6, marginBottom: 12}}>
                  {q.options.map(opt => {
                    const isSelected = userAns === opt.key;
                    const isCorrectOpt = isSubmitted && opt.key.toUpperCase() === q.correctAnswer.toUpperCase();
                    const isWrongOpt = isSubmitted && isSelected && !isCorrectOpt;

                    let optBg = "var(--surface2)";
                    let optBorder = "1px solid var(--border)";
                    let optColor = "var(--ink)";

                    if (isSubmitted) {
                      if (isCorrectOpt) {
                        optBg = "rgba(163,230,53,0.15)";
                        optBorder = "1px solid var(--leaf)";
                        optColor = "var(--leaf)";
                      } else if (isWrongOpt) {
                        optBg = "rgba(244,63,94,0.15)";
                        optBorder = "1px solid var(--rose)";
                        optColor = "var(--rose)";
                      }
                    } else if (isSelected) {
                      optBg = "color-mix(in srgb, var(--sky) 15%, var(--surface))";
                      optBorder = "1px solid var(--sky)";
                    }

                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelectAnswer(q.id, opt.key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          borderRadius: 6,
                          background: optBg,
                          border: optBorder,
                          color: optColor,
                          cursor: isSubmitted ? "default" : "pointer",
                          transition: "all 0.12s ease"
                        }}
                      >
                        <span style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 11,
                          background: isSelected ? "var(--sky)" : "var(--surface)",
                          color: isSelected ? "#000" : "var(--ink2)",
                          border: "1px solid var(--border)",
                          flexShrink: 0
                        }}>
                          {opt.key}
                        </span>
                        <span style={{fontSize: 13, lineHeight: 1.4}}>
                          {opt.text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Analysis after Submission */}
                {isSubmitted && (
                  <div style={{marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--border2)"}}>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 6}}>
                      <strong style={{color: isCorrect ? "var(--leaf)" : "var(--rose)", fontSize: 13}}>
                        {isCorrect ? "✓ Chính xác" : `✗ Chưa chính xác (Đáp án đúng: ${q.correctAnswer})`}
                      </strong>
                    </div>

                    {q.explanation && (
                      <div style={{fontSize: 12, color: "var(--ink2)", lineHeight: 1.55, marginBottom: 8}}>
                        💡 <strong>Giải thích:</strong> {q.explanation}
                      </div>
                    )}

                    {/* Distractor Diagnosis */}
                    {q.distractorDiagnosis && userAns && !isCorrect && q.distractorDiagnosis[userAns] && (
                      <div style={{
                        fontSize: 11.5,
                        background: "rgba(244,63,94,0.08)",
                        borderLeft: "3px solid var(--rose)",
                        padding: "6px 10px",
                        borderRadius: 4,
                        marginBottom: 8,
                        color: "var(--rose)"
                      }}>
                        ⚠️ <strong>Phân tích bẫy bạn mắc phải ({userAns}):</strong> {q.distractorDiagnosis[userAns]}
                      </div>
                    )}

                    {/* Related Structure Lookup */}
                    {q.relatedStructureId && (
                      <div style={{fontSize: 11, color: "var(--sky)", marginBottom: 8}}>
                        🔗 Cấu trúc liên quan: <code>{q.relatedStructureId}</code>
                      </div>
                    )}

                    {/* AI Deep Explainer Button & Output */}
                    <div style={{marginTop: 6}}>
                      <button
                        className="btn bg bsm"
                        style={{fontSize: 11}}
                        onClick={() => requestAIExplanation(q)}
                        disabled={explainingQId === q.id}
                      >
                        {explainingQId === q.id ? "🤖 Đang phân tích..." : "🤖 Nhờ AI giải thích chuyên sâu & mẹo né bẫy"}
                      </button>

                      {explanation && (
                        <div style={{
                          marginTop: 8,
                          padding: "10px 12px",
                          borderRadius: 6,
                          background: "var(--surface2)",
                          border: "1px solid var(--border)",
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: "var(--ink)",
                          whiteSpace: "pre-line"
                        }}>
                          {explanation}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER: MAIN VIETNAM EXAMS PORTAL
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="canvas fu">
      {/* Portal Header */}
      <div className="kicker">Chương trình chuẩn GDPT 2018 & ĐHQG-HCM</div>
      <h1 className="title-x">
        Vietnam Exams <em>(THPTQG & V-ACT)</em> ✦
      </h1>
      <p className="subtitle" style={{marginBottom: 16}}>
        Cổng luyện thi chuyên biệt Tiếng Anh THPT Quốc Gia (đề thi chính thức 2026, 2025 và dự báo xu hướng 2027) cùng bài thi Đánh giá năng lực ĐHQG-HCM V-ACT. Tích hợp bộ giải đề bấm giờ, 464 cấu trúc bẫy điểm 9+, ma trận ma trận bám sát SGK 10-12 và lộ trình Sprint.
      </p>

      {/* Target & Track Bar */}
      <div className="card mb16" style={{background: "color-mix(in srgb, var(--gold, #eab308) 5%, var(--surface))", border: "1px solid color-mix(in srgb, var(--gold, #eab308) 30%, var(--border))"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12}}>
          <div>
            <div style={{fontSize: 11, color: "var(--ink3)", textTransform: "uppercase", letterSpacing: "0.08em"}}>Mục tiêu điểm số</div>
            <div style={{fontSize: 14, fontWeight: 700, color: "var(--ink)", marginTop: 2}}>
              THPT Quốc Gia: <span style={{color: "var(--gold, #eab308)"}}>9.0+ / 10.0</span> · V-ACT ĐHQG-HCM: <span style={{color: "var(--sky)"}}>250+ / 300</span>
            </div>
          </div>
          <div style={{display: "flex", gap: 6, alignItems: "center"}}>
            <span style={{fontSize: 11.5, color: "var(--ink3)", marginRight: 4}}>Lọc kỳ thi:</span>
            <button className={`btn ${filterTrack === "all" ? "bp" : "bg"} bsm`} onClick={() => setFilterTrack("all")}>Tất cả</button>
            <button className={`btn ${filterTrack === "thptqg" ? "bp" : "bg"} bsm`} onClick={() => setFilterTrack("thptqg")}>🎓 THPTQG</button>
            <button className={`btn ${filterTrack === "vact" ? "bp" : "bg"} bsm`} onClick={() => setFilterTrack("vact")}>🏛️ V-ACT</button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 10, marginBottom: 18, overflowX: "auto"}}>
        {[
          {id: "tests", label: "📝 Bộ đề thi thật", badge: `${officialTests.length} đề`},
          {id: "matrix", label: "📊 Ma trận & Xu hướng 2026-2027", badge: "Mới"},
          {id: "structures", label: "⚡ 464 Cấu trúc bẫy 9+", badge: `${allStructures.length}`},
          {id: "roadmaps", label: "🗺️ Lộ trình Sprint 60d / 45d", badge: "2 lộ trình"},
          {id: "vocab", label: "📚 Từ vựng phân hóa", badge: "480 từ"}
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`btn ${activeTab === t.id ? "bp" : "bg"} bsm`}
            style={{whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6}}
          >
            {t.label}
            <span style={{fontSize: 10, opacity: 0.85, background: "rgba(0,0,0,0.15)", padding: "1px 5px", borderRadius: 4}}>
              {t.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 1: OFFICIAL EXAM PAPERS                                 */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "tests" && (
        <div>
          <div style={{fontSize: 12, color: "var(--ink3)", marginBottom: 12}}>
            Đề thi chính thức được trích xuất nguyên bản từ kỳ thi Bộ Giáo dục & Đào tạo (2026 Mã 1101, Chuyên Tuyên Quang đợt 2) và ĐHQG-HCM V-ACT 2026. Chọn đề thi để bắt đầu làm bài bấm giờ thực tế:
          </div>
          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 14}}>
            {filteredTests.map(test => (
              <div key={test.id} className="card" style={{display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                <div>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8}}>
                    <span className="chip" style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      background: test.examType === "thptqg" ? "rgba(234,179,8,0.15)" : "rgba(14,165,233,0.15)",
                      color: test.examType === "thptqg" ? "var(--gold, #eab308)" : "var(--sky)"
                    }}>
                      {test.examType === "thptqg" ? "THPT Quốc Gia" : "ĐHQG-HCM V-ACT"}
                    </span>
                    <span style={{fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: "var(--ink3)"}}>
                      ⏱ {Math.round(test.durationSeconds / 60)} phút
                    </span>
                  </div>
                  <h3 style={{margin: "0 0 6px 0", fontSize: 15, color: "var(--ink)", lineHeight: 1.35}}>
                    {test.title}
                  </h3>
                  <div style={{fontSize: 11.5, color: "var(--ink2)", marginBottom: 8}}>
                    {test.questionCount} câu hỏi · {test.sourcePolicy}
                  </div>
                  <div style={{fontSize: 11, color: "var(--ink3)", lineHeight: 1.5, marginBottom: 14}}>
                    Bao gồm các phần: Ngữ âm, Trọng âm, Điền thông báo/quảng cáo, Sắp xếp logic đoạn văn (Discourse Cohesion), Đọc hiểu nâng cao phân hóa điểm 9+.
                  </div>
                </div>
                <div style={{display: "flex", gap: 8}}>
                  <button className="btn bp bsm" style={{flex: 1, fontWeight: 600}} onClick={() => startExamSimulation(test)}>
                    🚀 Vào thi bấm giờ ({Math.round(test.durationSeconds / 60)}m)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 2: EXAM MATRIX & 2026-2027 TENDENCY                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "matrix" && (
        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          <div className="card ag" style={{padding: 16}}>
            <h3 style={{margin: "0 0 8px 0", fontSize: 16, color: "var(--leaf)"}}>
              🎯 Ma Trận 6 Dạng Bài Chuẩn GDPT 2018 (Đề Thi 2026 & Dự Báo 2027)
            </h3>
            <p style={{fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.6, margin: 0}}>
              Kỳ thi tốt nghiệp THPT từ năm 2025 theo Chương trình GDPT 2018 đã thay đổi căn bản cấu trúc đề thi Tiếng Anh: giảm kiểm tra ngữ pháp đơn lẻ, chuyển dịch mạnh sang <strong>ngữ cảnh thực tế (Authentic texts)</strong> và <strong>năng lực diễn ngôn (Discourse Cohesion)</strong>.
            </p>
          </div>

          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12}}>
            {[
              {
                num: "Dạng 1",
                title: "Ngữ Âm & Trọng Âm",
                count: "4 câu (1.0 điểm)",
                diff: "Nhận biết - Thông hiểu (8.0 nền)",
                details: "Bẫy phát âm nguyên âm đơn/đôi, phụ âm câm, quy tắc đuôi -ed/-s/es. Trọng âm từ 2 âm tiết (danh/động từ) và 3 âm tiết có hậu tố -ic, -tion, -ity, -al."
              },
              {
                num: "Dạng 2 (MỚI)",
                title: "Điền Khuyết Thông Báo & Quảng Cáo",
                count: "6 câu (1.5 điểm)",
                diff: "Thông hiểu - Vận dụng",
                details: "Sử dụng ngữ liệu thực tế (thông báo trường học, tuyển dụng tình nguyện viên, quảng cáo sản phẩm xanh). Bẫy giới từ cố định, thì động từ và danh động từ/động từ nguyên mẫu."
              },
              {
                num: "Dạng 3 (TRỌNG TÂM 9+)",
                title: "Sắp Xếp Câu Tạo Đoạn Văn Logic",
                count: "5 câu (1.25 điểm)",
                diff: "Vận dụng cao (Phân hóa 9+)",
                details: "Dạng bài HOÀN TOÀN MỚI của GDPT 2018. Đòi hỏi học sinh phân tích mạch lạc (Coherence) & liên kết (Cohesion): xác định câu chủ đề, trật tự thời gian, nguyên nhân - kết quả và đại từ chỉ định thay thế."
              },
              {
                num: "Dạng 4",
                title: "Đọc Điền Từ Khuyết (Cloze Test)",
                count: "5 câu (1.25 điểm)",
                diff: "Vận dụng",
                details: "Các liên từ logic (However, Therefore, In addition), đại từ quan hệ (which, that, whom, whose), lượng từ (each, every, other, another) và Collocations cố định C1."
              },
              {
                num: "Dạng 5",
                title: "Đọc Hiểu 1 (Thông Hiểu Ngữ Nghĩa)",
                count: "4 câu (1.0 điểm)",
                diff: "Thông hiểu",
                details: "Bài đọc 250-300 từ. Chủ đề gắn liền SGK 10-12: Trí tuệ nhân tạo, Gen Z và việc làm, Lối sống xanh, Di sản văn hóa. Bẫy đại từ thay thế và câu hỏi phủ định (NOT mentioned)."
              },
              {
                num: "Dạng 6 (PHÂN HÓA 9.6 - 10.0)",
                title: "Đọc Hiểu 2 (Học Thuật Nâng Cao C1/C2)",
                count: "8 câu (2.0 điểm)",
                diff: "Vận dụng cao (Cực khó)",
                details: "Trích từ các báo cáo chuyên sâu (Brookings Institution, The Economist, National Geographic). Câu hỏi suy luận hàm ý (Inference), thái độ tác giả (Tone), từ đồng nghĩa khó đoán và đại ý đoạn văn."
              }
            ].map(item => (
              <div key={item.num} className="card" style={{borderLeft: "3px solid var(--gold, #eab308)"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
                  <strong style={{color: "var(--gold, #eab308)", fontSize: 13}}>{item.num}: {item.title}</strong>
                  <span className="chip" style={{fontSize: 10, background: "var(--surface2)"}}>{item.count}</span>
                </div>
                <div style={{fontSize: 11, fontWeight: 600, color: "var(--sky)", marginBottom: 6}}>
                  Mức độ: {item.diff}
                </div>
                <div style={{fontSize: 12, color: "var(--ink2)", lineHeight: 1.55}}>
                  {item.details}
                </div>
              </div>
            ))}
          </div>

          {/* 2027 Tendency Forecast */}
          <div className="card" style={{borderTop: "3px solid var(--sky)"}}>
            <h3 style={{margin: "0 0 10px 0", fontSize: 15, color: "var(--sky)"}}>
              🔮 Dự Báo Xu Hướng Đề Thi THPTQG & V-ACT 2027
            </h3>
            <div style={{fontSize: 12.5, color: "var(--ink2)", lineHeight: 1.65}}>
              1. <strong>Tích hợp các vấn đề thời sự toàn cầu & Việt Nam:</strong> Trọng tâm sẽ bám sát chuyển đổi số, năng lượng tái tạo, biến đổi khí hậu tại Đồng bằng Sông Cửu Long, và sức khỏe tâm thần của người trẻ.<br/>
              2. <strong>Tăng tính ứng dụng giao tiếp:</strong> Đề thi loại bỏ hẳn các câu đố mẹo ngữ pháp vụn vặt; thay vào đó là yêu cầu hiểu ngữ cảnh trọn vẹn của đoạn văn.<br/>
              3. <strong>V-ACT ĐHQG-HCM:</strong> Tăng tỷ trọng câu hỏi suy luận logic ngôn ngữ (critical reasoning), phân biệt sắc thái nghĩa giữa các từ đồng nghĩa gần nghĩa trong tiếng Anh học thuật.
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 3: 464 TRAP STRUCTURES                                  */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "structures" && (
        <div>
          {/* Search & Filter Bar */}
          <div className="card mb14" style={{padding: 12}}>
            <div style={{display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center"}}>
              <input
                type="text"
                placeholder="🔍 Tìm cấu trúc (vd: inversion, hardly, regret, câu chẻ, bẫy...)"
                value={structQuery}
                onChange={e => setStructQuery(e.target.value)}
                style={{flex: 1, minWidth: 240, padding: "7px 12px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--ink)", fontSize: 13}}
              />
              <select
                value={structCategory}
                onChange={e => setStructCategory(e.target.value)}
                style={{padding: "7px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--ink)", fontSize: 12.5}}
              >
                {structCategories.map(c => (
                  <option key={c} value={c}>
                    {c === "all" ? "Tất cả dạng bẫy" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{fontSize: 12, color: "var(--ink3)", marginBottom: 10}}>
            Hiển thị {filteredStructures.length} / {allStructures.length} cấu trúc ngữ pháp & collocations trọng tâm phân hóa:
          </div>

          {/* Structures Grid */}
          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12}}>
            {filteredStructures.slice(0, 60).map(s => {
              const isExpanded = expandedStructId === s.id;
              return (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    cursor: "pointer",
                    border: isExpanded ? "1px solid var(--leaf)" : "1px solid var(--border)",
                    transition: "all 0.15s ease"
                  }}
                  onClick={() => setExpandedStructId(isExpanded ? null : s.id)}
                >
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6}}>
                    <strong style={{color: "var(--leaf)", fontSize: 13}}>
                      {s.structure}
                    </strong>
                    {s.level && (
                      <span className="chip" style={{fontSize: 10, background: "var(--surface2)"}}>
                        {s.level}
                      </span>
                    )}
                  </div>

                  <div style={{fontSize: 12.5, fontWeight: 550, color: "var(--ink)", marginBottom: 6}}>
                    {s.meaning}
                  </div>

                  <div style={{fontSize: 12, color: "var(--ink2)", fontStyle: "italic", marginBottom: 6, background: "var(--surface2)", padding: "4px 8px", borderRadius: 4}}>
                    Ví dụ: {s.example}
                  </div>

                  {s.trapNote && (
                    <div style={{fontSize: 11.5, color: "var(--honey)", lineHeight: 1.45, marginTop: 4}}>
                      ⚠️ <strong>Bẫy đề thi:</strong> {s.trapNote}
                    </div>
                  )}

                  <div style={{fontSize: 10, color: "var(--ink3)", marginTop: 6, textAlign: "right"}}>
                    {isExpanded ? "▲ Thu gọn" : "▼ Xem chi tiết"}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStructures.length > 60 && (
            <div style={{textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--ink3)"}}>
              Đang hiển thị 60 cấu trúc tiêu biểu nhất. Hãy gõ từ khóa tìm kiếm để thu hẹp cấu trúc bạn muốn ôn tập!
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 4: SPRINT ROADMAPS (THPTQG 60D & V-ACT 45D)             */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "roadmaps" && (
        <div style={{display: "flex", flexDirection: "column", gap: 16}}>
          {["thptqg-sprint-60d", "vact-sprint-45d"].map(rId => {
            const rm = roadmaps[rId];
            if (!rm) return null;
            return (
              <div key={rId} className="card" style={{borderTop: `3px solid ${rId.includes('thptqg') ? 'var(--gold, #eab308)' : 'var(--sky)'}`}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8}}>
                  <div>
                    <h3 style={{margin: 0, fontSize: 17, color: "var(--ink)"}}>{rm.title}</h3>
                    <div style={{fontSize: 12, color: "var(--ink2)", marginTop: 4}}>
                      Mục tiêu: <strong>{rm.targetScore}</strong> · Tổng thời gian: <strong>{rm.totalDays} ngày</strong>
                    </div>
                  </div>
                  <span className="chip" style={{fontSize: 11, background: "var(--surface2)"}}>
                    {rm.examType?.toUpperCase()}
                  </span>
                </div>

                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 12}}>
                  {(rm.phases || rm.milestones || []).map((phase, pIdx) => (
                    <div key={pIdx} style={{background: "var(--surface2)", padding: 12, borderRadius: 8, border: "1px solid var(--border)"}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
                        <strong style={{fontSize: 12.5, color: "var(--ink)"}}>
                          Giai đoạn {pIdx + 1}: {phase.name || phase.title}
                        </strong>
                        <span style={{fontSize: 10.5, color: "var(--leaf)", fontFamily: "'Geist Mono', monospace"}}>
                          {phase.days || `Ngày ${phase.startDay}-${phase.endDay}`}
                        </span>
                      </div>
                      <div style={{fontSize: 11.5, color: "var(--ink2)", lineHeight: 1.5, marginBottom: 8}}>
                        {phase.goal || phase.focus}
                      </div>

                      <div style={{display: "flex", flexDirection: "column", gap: 4}}>
                        {(phase.tasks || phase.checkpoints || []).map((task, tIdx) => {
                          const taskId = `${rId}-p${pIdx}-t${tIdx}`;
                          const isDone = !!completedMilestones[taskId];
                          return (
                            <label key={tIdx} style={{display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: isDone ? "var(--ink3)" : "var(--ink)", cursor: "pointer"}}>
                              <input
                                type="checkbox"
                                checked={isDone}
                                onChange={() => toggleMilestone(taskId)}
                              />
                              <span style={{textDecoration: isDone ? "line-through" : "none"}}>
                                {task}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────── */}
      {/* TAB 5: VOCABULARY PATCHES                                   */}
      {/* ─────────────────────────────────────────────────────────── */}
      {activeTab === "vocab" && (
        <div style={{display: "flex", flexDirection: "column", gap: 14}}>
          <div style={{fontSize: 12, color: "var(--ink3)"}}>
            Kho từ vựng C1/C2 chắt lọc từ SGK 10, 11, 12 và các đề thi THPTQG & V-ACT. Bấm để chuyển ngay sang chế độ học Flashcard 3D FSRS hoặc Game tốc độ:
          </div>

          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14}}>
            {/* THPTQG Patch */}
            <div className="card" style={{borderLeft: "3px solid var(--gold, #eab308)"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6}}>
                <h3 style={{margin: 0, fontSize: 15, color: "var(--ink)"}}>
                  THPTQG 12: Bộ Từ Vựng C1/C2 Phân Hóa 9-10
                </h3>
                <span className="chip" style={{fontSize: 10, background: "rgba(234,179,8,0.12)", color: "var(--gold, #eab308)"}}>
                  300 từ
                </span>
              </div>
              <p style={{fontSize: 12, color: "var(--ink2)", lineHeight: 1.55, marginBottom: 12}}>
                Trích xuất từ các bài đọc nâng cao Brookings Institution, SGK 10-12 chương trình mới. Chia nhỏ làm 7 sub-patches (20 từ/mục) giúp ghi nhớ sâu.
              </p>
              <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                <button
                  className="btn bp bsm"
                  style={{flex: 1}}
                  onClick={() => {
                    setState(prev => ({...prev, activePatchId: "patch-thptqg-12", vocabMode: "flashcard"}));
                    goToPage("vocab");
                  }}
                >
                  🎴 Flashcard 3D FSRS
                </button>
                <button
                  className="btn bg bsm"
                  style={{flex: 1}}
                  onClick={() => {
                    setState(prev => ({...prev, activePatchId: "patch-thptqg-12", vocabMode: "match"}));
                    goToPage("vocab");
                  }}
                >
                  ⚡ Match Game 12 ô
                </button>
              </div>
            </div>

            {/* V-ACT Patch */}
            <div className="card" style={{borderLeft: "3px solid var(--sky)"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6}}>
                <h3 style={{margin: 0, fontSize: 15, color: "var(--ink)"}}>
                  V-ACT ĐHQG-HCM: Bộ Từ Vựng Logic & Ngữ Cảnh
                </h3>
                <span className="chip" style={{fontSize: 10, background: "rgba(14,165,233,0.12)", color: "var(--sky)"}}>
                  180 từ
                </span>
              </div>
              <p style={{fontSize: 12, color: "var(--ink2)", lineHeight: 1.55, marginBottom: 12}}>
                Tập trung vào các từ vựng học thuật mang tính suy luận, lập luận phản biện và phân biệt sắc thái nghĩa trong bài thi Đánh giá năng lực.
              </p>
              <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                <button
                  className="btn bp bsm"
                  style={{flex: 1}}
                  onClick={() => {
                    setState(prev => ({...prev, activePatchId: "patch-vact-aptitude", vocabMode: "flashcard"}));
                    goToPage("vocab");
                  }}
                >
                  🎴 Flashcard 3D FSRS
                </button>
                <button
                  className="btn bg bsm"
                  style={{flex: 1}}
                  onClick={() => {
                    setState(prev => ({...prev, activePatchId: "patch-vact-aptitude", vocabMode: "match"}));
                    goToPage("vocab");
                  }}
                >
                  ⚡ Match Game 12 ô
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
