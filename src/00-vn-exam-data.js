// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 00-vn-exam-data.js — UNIFIED EXAM DATASET (THPTQG + V-ACT + IELTS)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Contains:
// 1. VN_EXAM_VOCAB: 300 C1/C2 words + 200 high-frequency structures
// 2. VN_DEFAULT_PATCHES: Hierarchical vocabulary decks & sub-patches
// 3. VN_DIAGNOSTIC_TEST: 10-question placement test (10 mins)
// 4. VN_EXAM_TESTS: Real official exam papers (THPTQG 2026, 2025 & V-ACT 2026, 2025)
// 5. VN_EXAM_ROADMAPS: Structured sprints for THPTQG, V-ACT, and IELTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VN_EXAM_VOCAB = [
  {
    "id": 1,
    "word": "to alleviate",
    "meaning": "làm giảm, làm dịu bớt",
    "cefr": "C1",
    "ipa": "/əˈliːvieɪt/",
    "syn": "ease, mitigate",
    "opp": "aggravate",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The charity distributed clean water to alleviate the suffering of flood victims."
  },
  {
    "id": 2,
    "word": "adverse (adj)",
    "meaning": "bất lợi, có hại",
    "cefr": "C1",
    "ipa": "/ædˈvɜːs/",
    "syn": "unfavorable, hostile",
    "opp": "favorable",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Analysts warn that the new policy could have an adverse effect on small businesses."
  },
  {
    "id": 3,
    "word": "to advocate",
    "meaning": "ủng hộ, biện hộ cho",
    "cefr": "C1",
    "ipa": "/ˈædvəkeɪt/",
    "syn": "support, back",
    "opp": "oppose",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Several teachers advocate using podcasts to improve students' listening skills."
  },
  {
    "id": 4,
    "word": "ambiguous (adj)",
    "meaning": "mơ hồ, không rõ ràng",
    "cefr": "C1",
    "ipa": "/æmˈbɪɡjuəs/",
    "syn": "unclear, vague",
    "opp": "definite",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The minister's ambiguous answer left reporters unsure of the government's position."
  },
  {
    "id": 5,
    "word": "apprehensive (adj)",
    "meaning": "lo lắng, e sợ",
    "cefr": "C1",
    "ipa": "/ˌæprɪˈhensɪv/",
    "syn": "anxious, worried",
    "opp": "calm",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Students often feel apprehensive on the morning of a big exam."
  },
  {
    "id": 6,
    "word": "arduous (adj)",
    "meaning": "khó khăn, gian khổ",
    "cefr": "C2",
    "ipa": "/ˈɑːdjuəs/",
    "syn": "difficult, strenuous",
    "opp": "easy",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "After an arduous climb of eight hours, the team finally reached the summit."
  },
  {
    "id": 7,
    "word": "assertive (adj)",
    "meaning": "quả quyết, quyết đoán",
    "cefr": "C1",
    "ipa": "/əˈsɜːtɪv/",
    "syn": "confident, firm",
    "opp": "timid",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The training taught staff to be assertive without sounding rude."
  },
  {
    "id": 8,
    "word": "benevolent (adj)",
    "meaning": "nhân từ, tốt bụng",
    "cefr": "C1",
    "ipa": "/bəˈnevələnt/",
    "syn": "kind, charitable",
    "opp": "malevolent",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "A benevolent stranger paid for the family's groceries."
  },
  {
    "id": 9,
    "word": "coherent (adj)",
    "meaning": "mạch lạc, rõ ràng",
    "cefr": "C1",
    "ipa": "/kəʊˈhɪərənt/",
    "syn": "logical, consistent",
    "opp": "incoherent",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Under pressure, she still gave a coherent account of the accident."
  },
  {
    "id": 10,
    "word": "comprehensive (adj)",
    "meaning": "toàn diện, đầy đủ",
    "cefr": "C1",
    "ipa": "/ˌkɒmprɪˈhensɪv/",
    "syn": "complete, thorough",
    "opp": "partial",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The report offers a comprehensive review of air pollution in the region."
  },
  {
    "id": 11,
    "word": "to contemplate",
    "meaning": "suy ngẫm, cân nhắc",
    "cefr": "C1",
    "ipa": "/ˈkɒntəmpleɪt/",
    "syn": "consider, ponder",
    "opp": "dismiss",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "She sat by the window to contemplate her next career move."
  },
  {
    "id": 12,
    "word": "to convey",
    "meaning": "truyền đạt, biểu đạt",
    "cefr": "C1",
    "ipa": "/kənˈveɪ/",
    "syn": "communicate, express",
    "opp": "conceal",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Gestures often convey more meaning than words."
  },
  {
    "id": 13,
    "word": "credible (adj)",
    "meaning": "đáng tin cậy",
    "cefr": "C1",
    "ipa": "/ˈkredəbl/",
    "syn": "believable, convincing",
    "opp": "incredible",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The witness provided a credible explanation that matched the security footage."
  },
  {
    "id": 14,
    "word": "crucial (adj)",
    "meaning": "then chốt, quan trọng",
    "cefr": "C1",
    "ipa": "/ˈkruːʃl/",
    "syn": "vital, essential",
    "opp": "trivial",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Regular practice plays a crucial role in mastering a foreign language."
  },
  {
    "id": 15,
    "word": "cynical (adj)",
    "meaning": "hoài nghi, hay chỉ trích",
    "cefr": "C1",
    "ipa": "/ˈsɪnɪkl/",
    "syn": "skeptical, distrustful",
    "opp": "optimistic",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Cynical voters doubted that any politician would keep the promise."
  },
  {
    "id": 16,
    "word": "detrimental (adj)",
    "meaning": "có hại, bất lợi",
    "cefr": "C2",
    "ipa": "/ˌdetrɪˈmentl/",
    "syn": "harmful, damaging",
    "opp": "beneficial",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Doctors say that skipping breakfast can be detrimental to concentration."
  },
  {
    "id": 17,
    "word": "diligent (adj)",
    "meaning": "siêng năng, cần cù",
    "cefr": "C1",
    "ipa": "/ˈdɪlɪdʒənt/",
    "syn": "hardworking, industrious",
    "opp": "lazy",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The diligent librarian catalogued every volume within a month."
  },
  {
    "id": 18,
    "word": "discrepancy (n)",
    "meaning": "sự khác biệt, chênh lệch",
    "cefr": "C1",
    "ipa": "/dɪsˈkrepənsi/",
    "syn": "difference, inconsistency",
    "opp": "agreement",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Auditors found a discrepancy between the receipts and the final accounts."
  },
  {
    "id": 19,
    "word": "to disperse",
    "meaning": "giải tán, phân tán",
    "cefr": "C1",
    "ipa": "/dɪˈspɜːs/",
    "syn": "scatter, spread",
    "opp": "gather",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Police waited for the crowd to disperse before closing the square."
  },
  {
    "id": 20,
    "word": "to diverge",
    "meaning": "tách ra, khác nhau",
    "cefr": "C2",
    "ipa": "/daɪˈvɜːdʒ/",
    "syn": "separate, branch off",
    "opp": "converge",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The two sisters' careers began to diverge after they left university."
  },
  {
    "id": 21,
    "word": "to elaborate",
    "meaning": "giải thích chi tiết",
    "cefr": "C1",
    "ipa": "/ɪˈlæbəreɪt/",
    "syn": "detail, expand",
    "opp": "simplify",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Could you elaborate on your plan for the school garden?"
  },
  {
    "id": 22,
    "word": "eloquent (adj)",
    "meaning": "có tài hùng biện, thuyết phục",
    "cefr": "C2",
    "ipa": "/ˈeləkwənt/",
    "syn": "articulate, expressive",
    "opp": "inarticulate",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Her eloquent speech about recycling moved the whole assembly."
  },
  {
    "id": 23,
    "word": "to emphasize",
    "meaning": "nhấn mạnh",
    "cefr": "C1",
    "ipa": "/ˈemfəsaɪz/",
    "syn": "stress, highlight",
    "opp": "downplay",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Coaches emphasize teamwork as much as individual skill."
  },
  {
    "id": 24,
    "word": "to endeavor",
    "meaning": "nỗ lực, cố gắng",
    "cefr": "C1",
    "ipa": "/ɪnˈdevə/",
    "syn": "strive, attempt",
    "opp": "quit",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Scientists endeavor to map the ocean floor with robotic submarines."
  },
  {
    "id": 25,
    "word": "engrossed (adj)",
    "meaning": "bị cuốn hút, mải mê",
    "cefr": "C1",
    "ipa": "/ɪnˈɡrəʊst/",
    "syn": "absorbed, captivated",
    "opp": "distracted",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The children were so engrossed in the puzzle that they missed lunch."
  },
  {
    "id": 26,
    "word": "to entail",
    "meaning": "đòi hỏi, bao gồm",
    "cefr": "C1",
    "ipa": "/ɪnˈteɪl/",
    "syn": "involve, require",
    "opp": "exclude",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Accepting the scholarship would entail moving abroad for two years."
  },
  {
    "id": 27,
    "word": "equivalent (adj/n)",
    "meaning": "tương đương",
    "cefr": "C1",
    "ipa": "/ɪˈkwɪvələnt/",
    "syn": "equal, comparable",
    "opp": "different",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "One mile is roughly equivalent to one point six kilometres."
  },
  {
    "id": 28,
    "word": "to eradicate",
    "meaning": "xóa bỏ, diệt trừ",
    "cefr": "C2",
    "ipa": "/ɪˈrædɪkeɪt/",
    "syn": "eliminate, wipe out",
    "opp": "establish",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Global vaccination campaigns helped eradicate smallpox in the last century."
  },
  {
    "id": 29,
    "word": "erratic (adj)",
    "meaning": "thất thường, không ổn định",
    "cefr": "C2",
    "ipa": "/ɪˈrætɪk/",
    "syn": "irregular, unpredictable",
    "opp": "consistent",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The bus service has been erratic lately, arriving early one day and late the next."
  },
  {
    "id": 30,
    "word": "excessive (adj)",
    "meaning": "quá mức, thái quá",
    "cefr": "C1",
    "ipa": "/ɪkˈsesɪv/",
    "syn": "extreme, immoderate",
    "opp": "moderate",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Excessive screen time at night can disrupt a teenager's sleep."
  },
  {
    "id": 31,
    "word": "feasible (adj)",
    "meaning": "khả thi, có thể thực hiện",
    "cefr": "C1",
    "ipa": "/ˈfiːzəbl/",
    "syn": "possible, practicable",
    "opp": "impracticable",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Building a bridge here is technically feasible but very expensive."
  },
  {
    "id": 32,
    "word": "formidable (adj)",
    "meaning": "ghê gớm, đáng gờm",
    "cefr": "C2",
    "ipa": "/ˈfɔːmɪdəbl/",
    "syn": "daunting, intimidating",
    "opp": "harmless",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The champion remains a formidable opponent despite her recent injury."
  },
  {
    "id": 33,
    "word": "frivolous (adj)",
    "meaning": "phù phiếm, nhẹ dạ",
    "cefr": "C2",
    "ipa": "/ˈfrɪvələs/",
    "syn": "trivial, superficial",
    "opp": "serious",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The court dismissed the frivolous lawsuit within minutes."
  },
  {
    "id": 34,
    "word": "to gratify",
    "meaning": "làm hài lòng",
    "cefr": "C1",
    "ipa": "/ˈɡrætɪfaɪ/",
    "syn": "please, satisfy",
    "opp": "displease",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "It gratified the retired teacher to see her students succeed."
  },
  {
    "id": 35,
    "word": "hostile (adj)",
    "meaning": "thù địch, chống đối",
    "cefr": "C1",
    "ipa": "/ˈhɒstaɪl/",
    "syn": "aggressive, unfriendly",
    "opp": "friendly",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The refugees received a hostile welcome in the first village."
  },
  {
    "id": 36,
    "word": "imminent (adj)",
    "meaning": "sắp xảy ra, cận kề",
    "cefr": "C2",
    "ipa": "/ˈɪmɪnənt/",
    "syn": "impending, approaching",
    "opp": "distant",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Dark clouds gathered, and the villagers knew the storm was imminent."
  },
  {
    "id": 37,
    "word": "impartial (adj)",
    "meaning": "công bằng, vô tư",
    "cefr": "C1",
    "ipa": "/ɪmˈpɑːʃl/",
    "syn": "unbiased, fair",
    "opp": "biased",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Judges must remain impartial and listen to both sides before ruling."
  },
  {
    "id": 38,
    "word": "imperative (adj)",
    "meaning": "cấp bách, bắt buộc",
    "cefr": "C1",
    "ipa": "/ɪmˈperətɪv/",
    "syn": "essential, vital",
    "opp": "optional",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "It is imperative that all candidates arrive twenty minutes before the exam."
  },
  {
    "id": 39,
    "word": "impulsive (adj)",
    "meaning": "bốc đồng, thiếu suy nghĩ",
    "cefr": "C1",
    "ipa": "/ɪmˈpʌlsɪv/",
    "syn": "spontaneous, rash",
    "opp": "cautious",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "His impulsive decision to quit left the team short-handed."
  },
  {
    "id": 40,
    "word": "incessant (adj)",
    "meaning": "không ngừng, liên miên",
    "cefr": "C2",
    "ipa": "/ɪnˈsesnt/",
    "syn": "constant, unceasing",
    "opp": "intermittent",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The incessant noise from the construction site kept residents awake all night."
  },
  {
    "id": 41,
    "word": "to inhibit",
    "meaning": "ngăn chặn, kiềm chế",
    "cefr": "C1",
    "ipa": "/ɪnˈhɪbɪt/",
    "syn": "hinder, restrain",
    "opp": "encourage",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Stage fright can inhibit even talented speakers during a presentation."
  },
  {
    "id": 42,
    "word": "integrity (n)",
    "meaning": "sự trung thực, liêm chính",
    "cefr": "C1",
    "ipa": "/ɪnˈteɡrəti/",
    "syn": "honesty, honor",
    "opp": "dishonesty",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The judge's integrity has never been questioned."
  },
  {
    "id": 43,
    "word": "intricate (adj)",
    "meaning": "phức tạp, rắc rối",
    "cefr": "C1",
    "ipa": "/ˈɪntrɪkət/",
    "syn": "complex, complicated",
    "opp": "simple",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The palace is famous for its intricate carvings of lotus flowers."
  },
  {
    "id": 44,
    "word": "lucrative (adj)",
    "meaning": "sinh lợi, béo bở",
    "cefr": "C2",
    "ipa": "/ˈluːkrətɪv/",
    "syn": "profitable, rewarding",
    "opp": "unprofitable",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "He gave up a lucrative career in banking to teach mathematics."
  },
  {
    "id": 45,
    "word": "meticulous (adj)",
    "meaning": "tỉ mỉ, kỹ lưỡng",
    "cefr": "C2",
    "ipa": "/məˈtɪkjələs/",
    "syn": "thorough, careful",
    "opp": "careless",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "Watchmakers perform meticulous work with tiny screws."
  },
  {
    "id": 46,
    "word": "notorious (adj)",
    "meaning": "khét tiếng (tiêu cực)",
    "cefr": "C1",
    "ipa": "/nəʊˈtɔːriəs/",
    "syn": "infamous",
    "opp": "reputable",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The narrow junction is notorious for accidents during the rainy season."
  },
  {
    "id": 47,
    "word": "oblivious (adj)",
    "meaning": "không nhận ra, lơ đãng",
    "cefr": "C1",
    "ipa": "/əˈblɪviəs/",
    "syn": "unaware, ignorant",
    "opp": "aware",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Absorbed in her novel, she was oblivious to the ringing telephone."
  },
  {
    "id": 48,
    "word": "plausible (adj)",
    "meaning": "hợp lý, đáng tin",
    "cefr": "C1",
    "ipa": "/ˈplɔːzəbl/",
    "syn": "believable, credible",
    "opp": "implausible",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The detective offered a plausible explanation for the missing keys."
  },
  {
    "id": 49,
    "word": "pragmatic (adj)",
    "meaning": "thực tế, thực dụng",
    "cefr": "C1",
    "ipa": "/præɡˈmætɪk/",
    "syn": "practical, realistic",
    "opp": "idealistic",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The council chose a pragmatic solution: repair the old bridge instead of building a new one."
  },
  {
    "id": 50,
    "word": "resilient (adj)",
    "meaning": "kiên cường, phục hồi nhanh",
    "cefr": "C1",
    "ipa": "/rɪˈzɪliənt/",
    "syn": "tough, adaptable",
    "opp": "fragile",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The resilient town rebuilt its market within a year of the fire."
  },
  {
    "id": 51,
    "word": "to scrutinize",
    "meaning": "xem xét kỹ lưỡng",
    "cefr": "C2",
    "ipa": "/ˈskruːtənaɪz/",
    "syn": "examine, inspect",
    "opp": "skim",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Customs officers scrutinize every document before allowing the goods through."
  },
  {
    "id": 52,
    "word": "to substantiate",
    "meaning": "chứng minh, xác thực",
    "cefr": "C2",
    "ipa": "/səbˈstænʃieɪt/",
    "syn": "verify, confirm",
    "opp": "disprove",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The journalist could not substantiate her claims with any evidence."
  },
  {
    "id": 53,
    "word": "succinct (adj)",
    "meaning": "ngắn gọn, súc tích",
    "cefr": "C1",
    "ipa": "/səkˈsɪŋkt/",
    "syn": "concise, brief",
    "opp": "verbose",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The chairman kept his opening remarks brief and succinct."
  },
  {
    "id": 54,
    "word": "tedious (adj)",
    "meaning": "tẻ nhạt, chán ngắt",
    "cefr": "C1",
    "ipa": "/ˈtiːdiəs/",
    "syn": "boring, monotonous",
    "opp": "interesting",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Copying the files by hand proved slow and tedious."
  },
  {
    "id": 55,
    "word": "tranquil (adj)",
    "meaning": "yên bình, thanh bình",
    "cefr": "C1",
    "ipa": "/ˈtræŋkwɪl/",
    "syn": "peaceful, calm",
    "opp": "noisy",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "We spent a tranquil afternoon fishing by the mountain lake."
  },
  {
    "id": 56,
    "word": "to undermine",
    "meaning": "làm suy yếu, phá hoại",
    "cefr": "C1",
    "ipa": "/ˌʌndəˈmaɪn/",
    "syn": "weaken, damage",
    "opp": "strengthen",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Constant criticism can undermine a student's confidence."
  },
  {
    "id": 57,
    "word": "versatile (adj)",
    "meaning": "linh hoạt, đa năng",
    "cefr": "C1",
    "ipa": "/ˈvɜːsətaɪl/",
    "syn": "flexible, adaptable",
    "opp": "limited",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "Eggs are a versatile ingredient in both sweet and savoury dishes."
  },
  {
    "id": 58,
    "word": "viable (adj)",
    "meaning": "khả thi, có thể thực hiện",
    "cefr": "C1",
    "ipa": "/ˈvaɪəbl/",
    "syn": "workable, feasible",
    "opp": "impractical",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Engineers concluded that the tunnel project was no longer viable."
  },
  {
    "id": 59,
    "word": "vivid (adj)",
    "meaning": "sinh động, rõ ràng",
    "cefr": "C1",
    "ipa": "/ˈvɪvɪd/",
    "syn": "lively, striking",
    "opp": "dull",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Grandfather's vivid stories brought the old village to life."
  },
  {
    "id": 60,
    "word": "vulnerable (adj)",
    "meaning": "dễ bị tổn thương",
    "cefr": "C1",
    "ipa": "/ˈvʌlnərəbl/",
    "syn": "exposed, weak",
    "opp": "protected",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Elderly people living alone are vulnerable to telephone scams."
  },
  {
    "id": 61,
    "word": "allegedly (adv)",
    "meaning": "được cho là, cáo buộc là",
    "cefr": "C1",
    "ipa": "/əˈledʒɪdli/",
    "syn": "supposedly, reportedly",
    "opp": "certainly",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The suspect allegedly entered the building shortly before midnight."
  },
  {
    "id": 62,
    "word": "antagonist (n)",
    "meaning": "kẻ đối địch, đối thủ",
    "cefr": "C1",
    "ipa": "/ænˈtæɡənɪst/",
    "syn": "opponent, rival",
    "opp": "ally",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "In the novel, the antagonist slowly ruins the hero's reputation."
  },
  {
    "id": 63,
    "word": "to appease",
    "meaning": "xoa dịu, làm nguôi giận",
    "cefr": "C2",
    "ipa": "/əˈpiːz/",
    "syn": "calm, pacify",
    "opp": "provoke",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "A quick snack did little to appease his hunger before dinner."
  },
  {
    "id": 64,
    "word": "to boast",
    "meaning": "khoe khoang, tự hào (về)",
    "cefr": "C1",
    "ipa": "/bəʊst/",
    "syn": "brag, show off",
    "opp": "hide",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The town can boast the oldest library in the country."
  },
  {
    "id": 65,
    "word": "burgeoning (adj)",
    "meaning": "phát triển nhanh chóng",
    "cefr": "C2",
    "ipa": "/ˈbɜːdʒənɪŋ/",
    "syn": "growing, expanding",
    "opp": "declining",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The burgeoning demand for delivery services has created thousands of jobs."
  },
  {
    "id": 66,
    "word": "to coincide",
    "meaning": "trùng hợp, xảy ra cùng lúc",
    "cefr": "C1",
    "ipa": "/ˌkəʊɪnˈsaɪd/",
    "syn": "match, concur",
    "opp": "differ",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The festival coincides with the harvest moon every October."
  },
  {
    "id": 67,
    "word": "to collaborate",
    "meaning": "hợp tác, cộng tác",
    "cefr": "C1",
    "ipa": "/kəˈlæbəreɪt/",
    "syn": "cooperate, work together",
    "opp": "compete",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The two schools collaborate on an annual science fair."
  },
  {
    "id": 68,
    "word": "complacent (adj)",
    "meaning": "tự mãn, thỏa mãn với bản thân",
    "cefr": "C2",
    "ipa": "/kəmˈpleɪsnt/",
    "syn": "self-satisfied, smug",
    "opp": "concerned",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "Inspectors warned the kitchen staff against becoming complacent about hygiene."
  },
  {
    "id": 69,
    "word": "to condone",
    "meaning": "bỏ qua, tha thứ",
    "cefr": "C2",
    "ipa": "/kənˈdəʊn/",
    "syn": "overlook, tolerate",
    "opp": "condemn",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The school does not condone cheating in any form."
  },
  {
    "id": 70,
    "word": "consecutive (adj)",
    "meaning": "liên tiếp, nối tiếp",
    "cefr": "C1",
    "ipa": "/kənˈsekjətɪv/",
    "syn": "successive, continuous",
    "opp": "interrupted",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "It rained for five consecutive days, flooding the sports field."
  },
  {
    "id": 71,
    "word": "conspicuous (adj)",
    "meaning": "dễ thấy, nổi bật",
    "cefr": "C1",
    "ipa": "/kənˈspɪkjuəs/",
    "syn": "noticeable, prominent",
    "opp": "hidden",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "His bright red jacket made him conspicuous in the crowd."
  },
  {
    "id": 72,
    "word": "to contemplate",
    "meaning": "suy ngẫm, dự định",
    "cefr": "C1",
    "ipa": "/ˈkɒntəmpleɪt/",
    "syn": "consider, reflect",
    "opp": "dismiss",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "She sat by the window to contemplate her next career move."
  },
  {
    "id": 73,
    "word": "credible (adj)",
    "meaning": "đáng tin cậy",
    "cefr": "C1",
    "ipa": "/ˈkredəbl/",
    "syn": "reliable, believable",
    "opp": "doubtful",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The witness provided a credible explanation that matched the security footage."
  },
  {
    "id": 74,
    "word": "to culminate",
    "meaning": "đạt đến đỉnh điểm",
    "cefr": "C2",
    "ipa": "/ˈkʌlmɪneɪt/",
    "syn": "peak, climax",
    "opp": "begin",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Months of rehearsal culminated in a brilliant opening night."
  },
  {
    "id": 75,
    "word": "deficit (n)",
    "meaning": "sự thiếu hụt",
    "cefr": "C1",
    "ipa": "/ˈdefɪsɪt/",
    "syn": "shortage, lack",
    "opp": "surplus",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The airline reported a large deficit for the second year running."
  },
  {
    "id": 76,
    "word": "to deplete",
    "meaning": "làm cạn kiệt",
    "cefr": "C1",
    "ipa": "/dɪˈpliːt/",
    "syn": "exhaust, drain",
    "opp": "replenish",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Years of overfishing have severely depleted fish stocks in the bay."
  },
  {
    "id": 77,
    "word": "to derive (from)",
    "meaning": "bắt nguồn từ",
    "cefr": "C1",
    "ipa": "/dɪˈraɪv/",
    "syn": "obtain, originate",
    "opp": "lose",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The word 'salary' derives from the Roman soldiers' salt allowance."
  },
  {
    "id": 78,
    "word": "to detract (from)",
    "meaning": "làm giảm giá trị",
    "cefr": "C2",
    "ipa": "/dɪˈtrækt/",
    "syn": "diminish, reduce",
    "opp": "enhance",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The graffiti on the old bridge detracts from its historic charm."
  },
  {
    "id": 79,
    "word": "to diminish",
    "meaning": "giảm bớt, thu nhỏ",
    "cefr": "C1",
    "ipa": "/dɪˈmɪnɪʃ/",
    "syn": "decrease, lessen",
    "opp": "increase",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The medicine gradually diminished the pain in his back."
  },
  {
    "id": 80,
    "word": "to discern",
    "meaning": "nhận ra, phân biệt",
    "cefr": "C2",
    "ipa": "/dɪˈsɜːn/",
    "syn": "perceive, detect",
    "opp": "overlook",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "In the fog, sailors could barely discern the outline of the harbour."
  },
  {
    "id": 81,
    "word": "to disregard",
    "meaning": "phớt lờ, coi thường",
    "cefr": "C1",
    "ipa": "/ˌdɪsrɪˈɡɑːd/",
    "syn": "ignore, neglect",
    "opp": "consider",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "He ignored the warning signs and showed complete disregard for his safety."
  },
  {
    "id": 82,
    "word": "eloquence (n)",
    "meaning": "tài hùng biện",
    "cefr": "C2",
    "ipa": "/ˈeləkwəns/",
    "syn": "fluency, expressiveness",
    "opp": "inarticulateness",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The delegate argued with such eloquence that the motion passed easily."
  },
  {
    "id": 83,
    "word": "to emerge",
    "meaning": "xuất hiện, nổi lên",
    "cefr": "C1",
    "ipa": "/iˈmɜːdʒ/",
    "syn": "appear, arise",
    "opp": "disappear",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "New details about the crash continue to emerge every day."
  },
  {
    "id": 84,
    "word": "to endeavor",
    "meaning": "nỗ lực, cố gắng",
    "cefr": "C1",
    "ipa": "",
    "syn": "strive, try",
    "opp": "idleness",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Scientists endeavor to map the ocean floor with robotic submarines."
  },
  {
    "id": 85,
    "word": "enthralled (adj)",
    "meaning": "bị mê hoặc, cuốn hút",
    "cefr": "C2",
    "ipa": "",
    "syn": "fascinated, captivated",
    "opp": "bored",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The audience sat enthralled throughout the puppet show."
  },
  {
    "id": 86,
    "word": "epitome (n)",
    "meaning": "hình mẫu, ví dụ hoàn hảo",
    "cefr": "C2",
    "ipa": "/ɪˈpɪtəmi/",
    "syn": "embodiment, model",
    "opp": "opposite",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "With her calm courage, the young nurse became the epitome of professionalism."
  },
  {
    "id": 87,
    "word": "erroneous (adj)",
    "meaning": "sai lầm, không chính xác",
    "cefr": "C1",
    "ipa": "/ɪˈrəʊniəs/",
    "syn": "incorrect, false",
    "opp": "accurate",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The newspaper later printed an apology for the erroneous report."
  },
  {
    "id": 88,
    "word": "to exemplify",
    "meaning": "minh họa, làm ví dụ cho",
    "cefr": "C1",
    "ipa": "/ɪɡˈzemplɪfaɪ/",
    "syn": "illustrate, demonstrate",
    "opp": "obscure",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "These students exemplify the spirit of fair play we want to encourage."
  },
  {
    "id": 89,
    "word": "exorbitant (adj)",
    "meaning": "(giá cả) quá cao",
    "cefr": "C2",
    "ipa": "/ɪɡˈzɔːbɪtənt/",
    "syn": "excessive, unreasonable",
    "opp": "moderate",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Tourists complained about the exorbitant price of bottled water at the hotel."
  },
  {
    "id": 90,
    "word": "to facilitate",
    "meaning": "tạo điều kiện, giúp đỡ",
    "cefr": "C1",
    "ipa": "/fəˈsɪlɪteɪt/",
    "syn": "enable, assist",
    "opp": "hinder",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The new software will facilitate communication between departments."
  },
  {
    "id": 91,
    "word": "futile (adj)",
    "meaning": "vô ích, không hiệu quả",
    "cefr": "C2",
    "ipa": "/ˈfjuːtaɪl/",
    "syn": "useless, pointless",
    "opp": "effective",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Rescue teams continued their futile search through the collapsed tunnel."
  },
  {
    "id": 92,
    "word": "to hinder",
    "meaning": "cản trở, gây trở ngại",
    "cefr": "C1",
    "ipa": "/ˈhɪndə(r)/",
    "syn": "obstruct, prevent",
    "opp": "assist",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Heavy backpacks hinder young hikers on long climbs."
  },
  {
    "id": 93,
    "word": "hypothetical (adj)",
    "meaning": "giả định, mang tính giả thuyết",
    "cefr": "C2",
    "ipa": "/ˌhaɪpəˈθetɪkl/",
    "syn": "theoretical, supposed",
    "opp": "real",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "In a hypothetical scenario where everyone votes, turnout would reach one hundred percent."
  },
  {
    "id": 94,
    "word": "illicit (adj)",
    "meaning": "bất hợp pháp",
    "cefr": "C2",
    "ipa": "/ɪˈlɪsɪt/",
    "syn": "illegal, unlawful",
    "opp": "legal",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Customs officers seized illicit cigarettes at the border."
  },
  {
    "id": 95,
    "word": "impeccable (adj)",
    "meaning": "hoàn hảo, không chê vào đâu",
    "cefr": "C1",
    "ipa": "/ɪmˈpekəbl/",
    "syn": "flawless, perfect",
    "opp": "flawed",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The ballroom's impeccable floors gleamed under the chandeliers."
  },
  {
    "id": 96,
    "word": "inadvertent (adj)",
    "meaning": "vô tình, không cố ý",
    "cefr": "C1",
    "ipa": "/ˌɪnədˈvɜːtnt/",
    "syn": "unintentional, accidental",
    "opp": "deliberate",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The mistake was an inadvertent typing error, not a lie."
  },
  {
    "id": 97,
    "word": "incessantly (adv)",
    "meaning": "không ngừng, liên tục",
    "cefr": "C2",
    "ipa": "/ɪnˈsesntli/",
    "syn": "constantly, continually",
    "opp": "rarely",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The baby cried incessantly until the pediatrician found the cause."
  },
  {
    "id": 98,
    "word": "inherent (adj)",
    "meaning": "vốn có, cố hữu",
    "cefr": "C1",
    "ipa": "/ɪnˈhɪərənt/",
    "syn": "innate, built-in",
    "opp": "external",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Risk is inherent in every investment, however safe it appears."
  },
  {
    "id": 99,
    "word": "intact (adj)",
    "meaning": "nguyên vẹn, không bị hư hại",
    "cefr": "C1",
    "ipa": "/ɪnˈtækt/",
    "syn": "undamaged, whole",
    "opp": "broken",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Remarkably, the ancient manuscripts were still intact after three hundred years."
  },
  {
    "id": 100,
    "word": "intrinsic (adj)",
    "meaning": "thuộc bản chất, bên trong",
    "cefr": "C2",
    "ipa": "/ɪnˈtrɪnzɪk/",
    "syn": "essential, inherent",
    "opp": "extrinsic",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Curiosity is an intrinsic part of human nature."
  },
  {
    "id": 101,
    "word": "to invoke",
    "meaning": "viện dẫn, cầu khẩn",
    "cefr": "C2",
    "ipa": "/ɪnˈvəʊk/",
    "syn": "call upon, appeal to",
    "opp": "ignore",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The defence lawyer invoked an old law to protect her client."
  },
  {
    "id": 102,
    "word": "to jeopardize",
    "meaning": "gây nguy hiểm, đe dọa",
    "cefr": "C2",
    "ipa": "/ˈdʒepədaɪz/",
    "syn": "endanger, risk",
    "opp": "protect",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Missing two more training sessions could jeopardize his place in the final."
  },
  {
    "id": 103,
    "word": "lucrative (adj)",
    "meaning": "sinh lời, béo bở",
    "cefr": "C1",
    "ipa": "/ˈluːkrətɪv/",
    "syn": "profitable, rewarding",
    "opp": "unprofitable",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "He gave up a lucrative career in banking to teach mathematics."
  },
  {
    "id": 104,
    "word": "mandatory (adj)",
    "meaning": "bắt buộc",
    "cefr": "C1",
    "ipa": "/mænˈdeɪtəri/",
    "syn": "compulsory, required",
    "opp": "optional",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Helmets are mandatory for all riders on this track."
  },
  {
    "id": 105,
    "word": "metaphor (n)",
    "meaning": "phép ẩn dụ",
    "cefr": "C1",
    "ipa": "/ˈmetəfɔː(r)/",
    "syn": "symbol, analogy",
    "opp": "literalness",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The poet's metaphor of life as a journey appears throughout the poem."
  },
  {
    "id": 106,
    "word": "to mitigate",
    "meaning": "giảm nhẹ, làm dịu",
    "cefr": "C2",
    "ipa": "/ˈmɪtɪɡeɪt/",
    "syn": "lessen, alleviate",
    "opp": "aggravate",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Planting trees along the coast helps mitigate the force of storm waves."
  },
  {
    "id": 107,
    "word": "momentum (n)",
    "meaning": "đà, động lực",
    "cefr": "C1",
    "ipa": "/məˈmentəm/",
    "syn": "drive, impetus",
    "opp": "stagnation",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The campaign for cleaner rivers is gathering momentum across the country."
  },
  {
    "id": 108,
    "word": "mundane (adj)",
    "meaning": "bình thường, tẻ nhạt",
    "cefr": "C1",
    "ipa": "/mʌnˈdeɪn/",
    "syn": "ordinary, routine",
    "opp": "extraordinary",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Robot vacuum cleaners take care of mundane household chores."
  },
  {
    "id": 109,
    "word": "negligent (adj)",
    "meaning": "cẩu thả, lơ đãng",
    "cefr": "C1",
    "ipa": "/ˈneɡlɪdʒənt/",
    "syn": "careless, inattentive",
    "opp": "careful",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The court found the factory negligent for ignoring safety checks."
  },
  {
    "id": 110,
    "word": "notion (n)",
    "meaning": "quan niệm, ý niệm",
    "cefr": "C1",
    "ipa": "/ˈnəʊʃn/",
    "syn": "idea, belief",
    "opp": "disbelief",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The notion that goldfish have short memories has been disproved."
  },
  {
    "id": 111,
    "word": "obscure (adj)",
    "meaning": "mơ hồ, khó hiểu",
    "cefr": "C1",
    "ipa": "/əbˈskjʊə(r)/",
    "syn": "unclear, hidden",
    "opp": "obvious",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Jargon can obscure a message that is actually quite simple."
  },
  {
    "id": 112,
    "word": "obsolete (adj)",
    "meaning": "lỗi thời, không còn dùng",
    "cefr": "C1",
    "ipa": "/ˈɒbsəliːt/",
    "syn": "outdated, old-fashioned",
    "opp": "modern",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Fax machines quickly became obsolete once email took over offices."
  },
  {
    "id": 113,
    "word": "omission (n)",
    "meaning": "sự bỏ sót, thiếu sót",
    "cefr": "C2",
    "ipa": "/əˈmɪʃn/",
    "syn": "exclusion, oversight",
    "opp": "inclusion",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The missing signature was an honest omission, the clerk explained."
  },
  {
    "id": 114,
    "word": "onerous (adj)",
    "meaning": "nặng nề, khó nhọc",
    "cefr": "C2",
    "ipa": "/ˈəʊnərəs/",
    "syn": "burdensome, heavy",
    "opp": "easy",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The interns complained about the onerous paperwork required each week."
  },
  {
    "id": 115,
    "word": "to perceive",
    "meaning": "nhận thức, cảm nhận",
    "cefr": "C1",
    "ipa": "/pəˈsiːv/",
    "syn": "sense, recognize",
    "opp": "ignore",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Dogs perceive high-pitched sounds that humans cannot hear."
  },
  {
    "id": 116,
    "word": "peril (n)",
    "meaning": "nguy hiểm, rủi ro",
    "cefr": "C2",
    "ipa": "/ˈperəl/",
    "syn": "danger, risk",
    "opp": "safety",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The climbers knew the peril of crossing the glacier without a guide."
  },
  {
    "id": 117,
    "word": "pervasive (adj)",
    "meaning": "lan rộng, phổ biến",
    "cefr": "C2",
    "ipa": "/pəˈveɪsɪv/",
    "syn": "widespread, prevalent",
    "opp": "limited",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Advertising has become pervasive, appearing even in school corridors."
  },
  {
    "id": 118,
    "word": "plight (n)",
    "meaning": "hoàn cảnh khó khăn",
    "cefr": "C1",
    "ipa": "/plaɪt/",
    "syn": "dilemma, hardship",
    "opp": "advantage",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Documentaries about the plight of sea turtles moved many viewers."
  },
  {
    "id": 119,
    "word": "precise (adj)",
    "meaning": "chính xác",
    "cefr": "C1",
    "ipa": "/prɪˈsaɪs/",
    "syn": "exact, accurate",
    "opp": "vague",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "We need the precise measurements before cutting the glass."
  },
  {
    "id": 120,
    "word": "predominant (adj)",
    "meaning": "chiếm ưu thế, nổi bật",
    "cefr": "C1",
    "ipa": "/prɪˈdɒmɪnənt/",
    "syn": "main, dominant",
    "opp": "minor",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Blue remains the predominant colour in the school's new logo."
  },
  {
    "id": 121,
    "word": "prevalent (adj)",
    "meaning": "phổ biến, thịnh hành",
    "cefr": "C1",
    "ipa": "/ˈprevələnt/",
    "syn": "widespread, common",
    "opp": "rare",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Flu is especially prevalent in crowded cities during winter."
  },
  {
    "id": 122,
    "word": "profound (adj)",
    "meaning": "sâu sắc",
    "cefr": "C1",
    "ipa": "/prəˈfaʊnd/",
    "syn": "deep, intense",
    "opp": "superficial",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The discovery of penicillin had a profound effect on modern medicine."
  },
  {
    "id": 123,
    "word": "prolific (adj)",
    "meaning": "năng suất cao, sáng tạo",
    "cefr": "C2",
    "ipa": "/prəˈlɪfɪk/",
    "syn": "productive, creative",
    "opp": "unproductive",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The prolific author published five novels in three years."
  },
  {
    "id": 124,
    "word": "to prompt",
    "meaning": "thúc đẩy, khiến cho",
    "cefr": "C1",
    "ipa": "/prɒmpt/",
    "syn": "encourage, cause",
    "opp": "delay",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The minister's remark prompted an immediate response from the opposition."
  },
  {
    "id": 125,
    "word": "prone (to) (adj)",
    "meaning": "dễ bị, có khuynh hướng",
    "cefr": "C1",
    "ipa": "/prəʊn/",
    "syn": "likely, susceptible",
    "opp": "resistant",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Tired drivers are prone to making mistakes on motorways."
  },
  {
    "id": 126,
    "word": "prosperous (adj)",
    "meaning": "thịnh vượng, phát đạt",
    "cefr": "C1",
    "ipa": "/ˈprɒspərəs/",
    "syn": "wealthy, thriving",
    "opp": "poor",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The port grew prosperous on trade in spices and silk."
  },
  {
    "id": 127,
    "word": "to provoke",
    "meaning": "khiêu khích, kích động",
    "cefr": "C1",
    "ipa": "/prəˈvəʊk/",
    "syn": "irritate, incite",
    "opp": "calm",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The cartoon was meant to amuse, not to provoke anger."
  },
  {
    "id": 128,
    "word": "prudent (adj)",
    "meaning": "thận trọng, khôn ngoan",
    "cefr": "C1",
    "ipa": "/ˈpruːdnt/",
    "syn": "wise, cautious",
    "opp": "reckless",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "It is prudent to save part of every month's allowance."
  },
  {
    "id": 129,
    "word": "to pursue",
    "meaning": "theo đuổi",
    "cefr": "C1",
    "ipa": "/pəˈsjuː/",
    "syn": "chase, follow",
    "opp": "abandon",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "She gave up law to pursue a career in music."
  },
  {
    "id": 130,
    "word": "rational (adj)",
    "meaning": "hợp lý, có lý trí",
    "cefr": "C1",
    "ipa": "/ˈræʃnəl/",
    "syn": "logical, reasonable",
    "opp": "irrational",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "There is a rational explanation for the strange lights in the sky."
  },
  {
    "id": 131,
    "word": "to reconcile",
    "meaning": "hòa giải, dung hòa",
    "cefr": "C2",
    "ipa": "/ˈrekənsaɪl/",
    "syn": "settle, harmonize",
    "opp": "separate",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The talks helped reconcile the two communities after years of tension."
  },
  {
    "id": 132,
    "word": "redundant (adj)",
    "meaning": "dư thừa",
    "cefr": "C1",
    "ipa": "/rɪˈdʌndənt/",
    "syn": "unnecessary, repetitive",
    "opp": "essential",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The new software made several clerical positions redundant."
  },
  {
    "id": 133,
    "word": "to refute",
    "meaning": "bác bỏ, phủ nhận",
    "cefr": "C2",
    "ipa": "/rɪˈfjuːt/",
    "syn": "disprove, deny",
    "opp": "confirm",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The researchers refute earlier claims with fresh evidence."
  },
  {
    "id": 134,
    "word": "to reiterate",
    "meaning": "nhắc lại, lặp lại",
    "cefr": "C1",
    "ipa": "/riˈɪtəreɪt/",
    "syn": "repeat, restate",
    "opp": "withdraw",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The headmaster reiterated the rule about phones during assembly."
  },
  {
    "id": 135,
    "word": "to relinquish",
    "meaning": "từ bỏ, nhượng lại",
    "cefr": "C2",
    "ipa": "/rɪˈlɪŋkwɪʃ/",
    "syn": "give up, surrender",
    "opp": "retain",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The champion refused to relinquish her title without a fight."
  },
  {
    "id": 136,
    "word": "reminiscent (adj)",
    "meaning": "gợi nhớ, làm nhớ lại",
    "cefr": "C2",
    "ipa": "/ˌremɪˈnɪsnt/",
    "syn": "suggestive, evocative",
    "opp": "forgetful",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The song's melody is reminiscent of old summer holidays."
  },
  {
    "id": 137,
    "word": "resolute (adj)",
    "meaning": "kiên quyết, cứng rắn",
    "cefr": "C1",
    "ipa": "/ˈrezəluːt/",
    "syn": "determined, firm",
    "opp": "uncertain",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "Despite the setbacks, the crew remained resolute about the voyage."
  },
  {
    "id": 138,
    "word": "to retaliate",
    "meaning": "trả đũa, trả thù",
    "cefr": "C2",
    "ipa": "/rɪˈtælieɪt/",
    "syn": "revenge, strike back",
    "opp": "forgive",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The captain warned the team not to retaliate after the foul."
  },
  {
    "id": 139,
    "word": "to revere",
    "meaning": "tôn kính, kính trọng",
    "cefr": "C2",
    "ipa": "/rɪˈvɪə(r)/",
    "syn": "admire, respect",
    "opp": "despise",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Villagers still revere the doctor who founded the clinic."
  },
  {
    "id": 140,
    "word": "rigorous (adj)",
    "meaning": "nghiêm ngặt, khắt khe",
    "cefr": "C1",
    "ipa": "/ˈrɪɡərəs/",
    "syn": "strict, thorough",
    "opp": "lenient",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The bridge passed a rigorous inspection before reopening."
  },
  {
    "id": 141,
    "word": "scrupulous (adj)",
    "meaning": "cẩn trọng, trung thực",
    "cefr": "C2",
    "ipa": "/ˈskruːpjələs/",
    "syn": "careful, honest",
    "opp": "careless",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The accountant kept scrupulous records of every receipt."
  },
  {
    "id": 142,
    "word": "skeptical (adj)",
    "meaning": "hoài nghi, nghi ngờ",
    "cefr": "C1",
    "ipa": "/ˈskeptɪkl/",
    "syn": "doubtful, suspicious",
    "opp": "trusting",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Scientists remained skeptical until the results could be reproduced."
  },
  {
    "id": 143,
    "word": "to speculate",
    "meaning": "suy đoán, phỏng đoán",
    "cefr": "C1",
    "ipa": "/ˈspekjuleɪt/",
    "syn": "guess, hypothesize",
    "opp": "know",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Journalists continue to speculate about the reasons for the minister's resignation."
  },
  {
    "id": 144,
    "word": "spontaneous (adj)",
    "meaning": "tự phát, tự nhiên",
    "cefr": "C1",
    "ipa": "/spɒnˈteɪniəs/",
    "syn": "impulsive, natural",
    "opp": "planned",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The crowd broke into spontaneous applause at the final chord."
  },
  {
    "id": 145,
    "word": "subtle (adj)",
    "meaning": "tinh tế, khéo léo",
    "cefr": "C1",
    "ipa": "/ˈsʌtl/",
    "syn": "delicate, slight",
    "opp": "obvious",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The perfume has a subtle scent of lemon and cedar."
  },
  {
    "id": 146,
    "word": "superficial (adj)",
    "meaning": "hời hợt, bề ngoài",
    "cefr": "C1",
    "ipa": "/ˌsuːpəˈfɪʃl/",
    "syn": "shallow, surface",
    "opp": "deep",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "A superficial glance at the data hides several worrying trends."
  },
  {
    "id": 147,
    "word": "to surpass",
    "meaning": "vượt trội, vượt qua",
    "cefr": "C1",
    "ipa": "/səˈpɑːs/",
    "syn": "exceed, outdo",
    "opp": "fall behind",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "This year's harvest should surpass even the record of 2015."
  },
  {
    "id": 148,
    "word": "susceptible (adj)",
    "meaning": "dễ bị ảnh hưởng",
    "cefr": "C1",
    "ipa": "/səˈseptəbl/",
    "syn": "vulnerable, prone",
    "opp": "resistant",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Young children are especially susceptible to colds in winter."
  },
  {
    "id": 149,
    "word": "to sustain",
    "meaning": "duy trì, chống đỡ",
    "cefr": "C1",
    "ipa": "/səˈsteɪn/",
    "syn": "maintain, support",
    "opp": "destroy",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Solar panels help the village sustain its electricity supply."
  },
  {
    "id": 150,
    "word": "tangible (adj)",
    "meaning": "hữu hình, rõ ràng",
    "cefr": "C1",
    "ipa": "/ˈtændʒəbl/",
    "syn": "concrete, real",
    "opp": "abstract",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The charity's work has tangible results: forty wells and two schools."
  },
  {
    "id": 151,
    "word": "to terminate",
    "meaning": "chấm dứt, kết thúc",
    "cefr": "C1",
    "ipa": "/ˈtɜːmɪneɪt/",
    "syn": "end, conclude",
    "opp": "begin",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The airline will terminate the unprofitable route at the end of March."
  },
  {
    "id": 152,
    "word": "to thrive",
    "meaning": "phát triển mạnh mẽ",
    "cefr": "C1",
    "ipa": "/θraɪv/",
    "syn": "flourish, prosper",
    "opp": "decline",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "These hardy plants thrive in poor soil and little rain."
  },
  {
    "id": 153,
    "word": "transient (adj)",
    "meaning": "thoáng qua, tạm thời",
    "cefr": "C2",
    "ipa": "/ˈtrænziənt/",
    "syn": "temporary, short-lived",
    "opp": "permanent",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The town's prosperity proved transient once the mine closed."
  },
  {
    "id": 154,
    "word": "transparent (adj)",
    "meaning": "minh bạch, rõ ràng",
    "cefr": "C1",
    "ipa": "/trænsˈpærənt/",
    "syn": "clear, obvious",
    "opp": "opaque",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The company promised transparent accounts open to public inspection."
  },
  {
    "id": 155,
    "word": "turbulent (adj)",
    "meaning": "hỗn loạn, biến động",
    "cefr": "C2",
    "ipa": "/ˈtɜːbjələnt/",
    "syn": "chaotic, unstable",
    "opp": "calm",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The aircraft landed safely after a turbulent flight over the mountains."
  },
  {
    "id": 156,
    "word": "undeniable (adj)",
    "meaning": "không thể phủ nhận",
    "cefr": "C1",
    "ipa": "/ˌʌndɪˈnaɪəbl/",
    "syn": "certain, indisputable",
    "opp": "doubtful",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The team's improvement this season is undeniable."
  },
  {
    "id": 157,
    "word": "unprecedented (adj)",
    "meaning": "chưa từng có",
    "cefr": "C1",
    "ipa": "/ʌnˈpresɪdentɪd/",
    "syn": "unheard-of, exceptional",
    "opp": "ordinary",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The hurricane caused unprecedented damage along the entire coastline."
  },
  {
    "id": 158,
    "word": "to violate",
    "meaning": "vi phạm",
    "cefr": "C1",
    "ipa": "/ˈvaɪəleɪt/",
    "syn": "break, infringe",
    "opp": "obey",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The fine is for drivers who violate the speed limit near schools."
  },
  {
    "id": 159,
    "word": "vividly (adv)",
    "meaning": "một cách sinh động, rõ ràng",
    "cefr": "C1",
    "ipa": "/ˈvɪvɪdli/",
    "syn": "clearly, brightly",
    "opp": "dimly (+ viết tay: boring)",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "She still vividly remembers her first day at the mountain school."
  },
  {
    "id": 160,
    "word": "to warrant",
    "meaning": "đảm bảo, biện minh cho",
    "cefr": "C2",
    "ipa": "/ˈwɒrənt/",
    "syn": "justify, guarantee",
    "opp": "disprove",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The seriousness of the situation warrants an immediate investigation."
  },
  {
    "id": 161,
    "word": "to withdraw",
    "meaning": "rút lui, rút lại",
    "cefr": "C1",
    "ipa": "/wɪðˈdrɔː/",
    "syn": "remove, retreat",
    "opp": "advance",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The candidate decided to withdraw from the race after the scandal."
  },
  {
    "id": 162,
    "word": "to withstand",
    "meaning": "chịu đựng, chống lại",
    "cefr": "C1",
    "ipa": "/wɪðˈstænd/",
    "syn": "resist, endure",
    "opp": "surrender",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The sea wall was built to withstand hundred-year storms."
  },
  {
    "id": 163,
    "word": "widespread (adj)",
    "meaning": "lan rộng, phổ biến",
    "cefr": "C1",
    "ipa": "/ˈwaɪdspred/",
    "syn": "common, prevalent",
    "opp": "rare",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The use of smartphones is now widespread among schoolchildren."
  },
  {
    "id": 164,
    "word": "to abide by",
    "meaning": "tuân thủ",
    "cefr": "C1",
    "ipa": "/əˈbaɪd baɪ/",
    "syn": "obey, follow",
    "opp": "disobey",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Members must abide by the club's rules at all times."
  },
  {
    "id": 165,
    "word": "to accelerate",
    "meaning": "tăng tốc",
    "cefr": "C1",
    "ipa": "/əkˈseləreɪt/",
    "syn": "speed up, hasten",
    "opp": "slow down",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The government plans to accelerate the switch to electric buses."
  },
  {
    "id": 166,
    "word": "to acclaim",
    "meaning": "hoan nghênh, ca ngợi",
    "cefr": "C2",
    "ipa": "/əˈkleɪm/",
    "syn": "praise, applaud",
    "opp": "criticize",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The young pianist won international acclaim after her first tour."
  },
  {
    "id": 167,
    "word": "to acquire",
    "meaning": "đạt được, thu được",
    "cefr": "C1",
    "ipa": "/əˈkwaɪə(r)/",
    "syn": "obtain, gain",
    "opp": "lose",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Children acquire their mother tongue long before they learn grammar."
  },
  {
    "id": 168,
    "word": "to adhere (to)",
    "meaning": "dính vào, tuân theo",
    "cefr": "C2",
    "ipa": "/ədˈhɪə(r)/",
    "syn": "stick to, follow",
    "opp": "ignore",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "All competitors must adhere to the tournament's code of conduct."
  },
  {
    "id": 169,
    "word": "affluent (adj)",
    "meaning": "giàu có, sung túc",
    "cefr": "C2",
    "ipa": "/ˈæfluənt/",
    "syn": "wealthy, rich",
    "opp": "poor",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The affluent suburbs surround the old industrial district."
  },
  {
    "id": 170,
    "word": "to allocate",
    "meaning": "phân bố, chỉ định",
    "cefr": "C1",
    "ipa": "/ˈæləkeɪt/",
    "syn": "assign, distribute",
    "opp": "withhold",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The council will allocate extra funds to rural schools this year."
  },
  {
    "id": 171,
    "word": "to amplify",
    "meaning": "khuếch đại, mở rộng",
    "cefr": "C1",
    "ipa": "/ˈæmplɪfaɪ/",
    "syn": "enlarge, intensify",
    "opp": "weaken",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "A simple microphone can amplify the speaker's voice across the hall."
  },
  {
    "id": 172,
    "word": "anecdote (n)",
    "meaning": "giai thoại, chuyện kể",
    "cefr": "C1",
    "ipa": "/ˈænɪkdəʊt/",
    "syn": "story, tale",
    "opp": "fact",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The mayor opened his speech with a humorous anecdote about his first job."
  },
  {
    "id": 173,
    "word": "arbitrary (adj)",
    "meaning": "tùy tiện, không có căn cứ",
    "cefr": "C2",
    "ipa": "/ˈɑːbɪtrɪ/",
    "syn": "random, subjective",
    "opp": "logical",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Students complained that the strict curfew seemed completely arbitrary."
  },
  {
    "id": 174,
    "word": "assertion (n)",
    "meaning": "sự khẳng định",
    "cefr": "C1",
    "ipa": "/əˈsɜːʃn/",
    "syn": "claim, statement",
    "opp": "denial",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The scientist's assertion that the drug works was backed by two trials."
  },
  {
    "id": 175,
    "word": "to attain",
    "meaning": "đạt được",
    "cefr": "C1",
    "ipa": "/əˈteɪn/",
    "syn": "achieve, accomplish",
    "opp": "fail",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Only two swimmers managed to attain the qualifying time."
  },
  {
    "id": 176,
    "word": "authentic (adj)",
    "meaning": "thật, xác thực",
    "cefr": "C1",
    "ipa": "/ɔːˈθentɪk/",
    "syn": "genuine, real",
    "opp": "fake",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The museum invited experts to verify that the painting was authentic."
  },
  {
    "id": 177,
    "word": "belligerent (adj)",
    "meaning": "hiếu chiến, thù địch",
    "cefr": "C2",
    "ipa": "/bəˈlɪdʒərənt/",
    "syn": "aggressive, hostile",
    "opp": "peaceful",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The referee sent off the player for his belligerent behaviour."
  },
  {
    "id": 178,
    "word": "bizarre (adj)",
    "meaning": "kỳ lạ, dị thường",
    "cefr": "C1",
    "ipa": "/bɪˈzɑː(r)/",
    "syn": "strange, odd",
    "opp": "normal",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The film tells the bizarre story of a town where nobody sleeps."
  },
  {
    "id": 179,
    "word": "to breach",
    "meaning": "vi phạm, phá vỡ",
    "cefr": "C1",
    "ipa": "/briːtʃ/",
    "syn": "violate, break",
    "opp": "comply",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The company was fined for a serious breach of safety regulations."
  },
  {
    "id": 180,
    "word": "candid (adj)",
    "meaning": "thẳng thắn, trung thực",
    "cefr": "C1",
    "ipa": "/ˈkændɪd/",
    "syn": "honest, frank",
    "opp": "deceitful",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "She was candid about the mistakes in her first business plan."
  },
  {
    "id": 181,
    "word": "coincidence (n)",
    "meaning": "sự trùng hợp",
    "cefr": "C1",
    "ipa": "/kəʊˈɪnsɪdəns/",
    "syn": "accident, chance",
    "opp": "design",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Meeting my primary-school teacher on a train in Norway was a remarkable coincidence."
  },
  {
    "id": 182,
    "word": "to collide",
    "meaning": "va chạm, xung đột",
    "cefr": "C1",
    "ipa": "/kəˈlaɪd/",
    "syn": "crash, clash",
    "opp": "separate",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Two delivery vans collided at the junction outside the market."
  },
  {
    "id": 183,
    "word": "complacency (n)",
    "meaning": "sự tự mãn",
    "cefr": "C2",
    "ipa": "/kəmˈpleɪsnsi/",
    "syn": "self-satisfaction, smugness",
    "opp": "anxiety",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "After two easy wins, complacency became the team's biggest rival."
  },
  {
    "id": 184,
    "word": "to comprise",
    "meaning": "bao gồm, chứa đựng",
    "cefr": "C1",
    "ipa": "/kəmˈpraɪz/",
    "syn": "include, consist of",
    "opp": "exclude",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The final examination will comprise both written and oral parts."
  },
  {
    "id": 185,
    "word": "to conceive (of)",
    "meaning": "hình dung, tưởng tượng",
    "cefr": "C1",
    "ipa": "/kənˈsiːv/",
    "syn": "imagine, envision",
    "opp": "misunderstand",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "It is hard to conceive of a city without electricity."
  },
  {
    "id": 186,
    "word": "to condense",
    "meaning": "cô động, rút gọn",
    "cefr": "C1",
    "ipa": "/kənˈdens/",
    "syn": "shorten, compress",
    "opp": "expand",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Please condense your essay into a summary of two hundred words."
  },
  {
    "id": 187,
    "word": "to confer",
    "meaning": "trao tặng, bàn bạc",
    "cefr": "C1",
    "ipa": "/kənˈfɜː(r)/",
    "syn": "grant, bestow",
    "opp": "withhold",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The university will confer honorary degrees on three distinguished scientists."
  },
  {
    "id": 188,
    "word": "to conform (to)",
    "meaning": "tuân theo, thích nghi",
    "cefr": "C1",
    "ipa": "/kənˈfɔːm/",
    "syn": "comply, follow",
    "opp": "rebel",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "All products must conform to the new safety standards."
  },
  {
    "id": 189,
    "word": "to confront",
    "meaning": "đối mặt, đương đầu",
    "cefr": "C1",
    "ipa": "/kənˈfrʌnt/",
    "syn": "face, challenge",
    "opp": "avoid",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "She finally confronted her fear of heights on the rope course."
  },
  {
    "id": 190,
    "word": "to conserve",
    "meaning": "bảo tồn, giữ gìn",
    "cefr": "C1",
    "ipa": "/kənˈsɜːv/",
    "syn": "preserve, protect",
    "opp": "waste",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Simple habits at home can conserve water and electricity."
  },
  {
    "id": 191,
    "word": "to contemplate",
    "meaning": "suy ngẫm, dự định",
    "cefr": "C1",
    "ipa": "/ˈkɒntəmpleɪt/",
    "syn": "consider, reflect",
    "opp": "dismiss",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "She sat by the window to contemplate her next career move."
  },
  {
    "id": 192,
    "word": "to contradict",
    "meaning": "mâu thuẫn, phủ nhận",
    "cefr": "C1",
    "ipa": "/ˌkɒntrəˈdɪkt/",
    "syn": "oppose, deny",
    "opp": "confirm",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The two witnesses contradict each other about the colour of the car."
  },
  {
    "id": 193,
    "word": "to convey",
    "meaning": "truyền đạt, bày tỏ",
    "cefr": "C1",
    "ipa": "/kənˈveɪ/",
    "syn": "express, communicate",
    "opp": "hide",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Gestures often convey more meaning than words."
  },
  {
    "id": 194,
    "word": "to correspond (to/with)",
    "meaning": "tương ứng, phù hợp",
    "cefr": "C1",
    "ipa": "/ˌkɒrəˈspɒnd/",
    "syn": "match, align",
    "opp": "differ",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The witness's statement did not correspond with the camera footage."
  },
  {
    "id": 195,
    "word": "credible (adj)",
    "meaning": "đáng tin cậy",
    "cefr": "C1",
    "ipa": "/ˈkredəbl/",
    "syn": "believable, trustworthy",
    "opp": "false",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The witness provided a credible explanation that matched the security footage."
  },
  {
    "id": 196,
    "word": "culpable (adj)",
    "meaning": "có tội, đáng khiển trách",
    "cefr": "C2",
    "ipa": "/ˈkʌlpəbl/",
    "syn": "guilty, blameworthy",
    "opp": "innocent",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The investigation found the driver culpable for the collision."
  },
  {
    "id": 197,
    "word": "to curtail",
    "meaning": "cắt giảm, hạn chế",
    "cefr": "C2",
    "ipa": "/kɜːˈteɪl/",
    "syn": "reduce, shorten",
    "opp": "extend",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The airline had to curtail its schedule because of the fuel shortage."
  },
  {
    "id": 198,
    "word": "to decipher",
    "meaning": "giải mã, hiểu được",
    "cefr": "C2",
    "ipa": "/dɪˈsaɪfə(r)/",
    "syn": "decode, interpret",
    "opp": "confuse",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Historians worked for years to decipher the ancient script."
  },
  {
    "id": 199,
    "word": "to defy",
    "meaning": "thách thức, chống đối",
    "cefr": "C1",
    "ipa": "/dɪˈfaɪ/",
    "syn": "resist, disobey",
    "opp": "obey",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The tiny startup continues to defy predictions of its collapse."
  },
  {
    "id": 200,
    "word": "to denounce",
    "meaning": "tố cáo, lên án",
    "cefr": "C1",
    "ipa": "/dɪˈnaʊns/",
    "syn": "condemn, criticize",
    "opp": "praise",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The mayor publicly denounced the vandals who damaged the memorial."
  },
  {
    "id": 201,
    "word": "to depict",
    "meaning": "mô tả, khắc họa",
    "cefr": "C1",
    "ipa": "/dɪˈpɪkt/",
    "syn": "portray, illustrate",
    "opp": "distort",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The mural depicts fishermen hauling in their nets at dawn."
  },
  {
    "id": 202,
    "word": "to deter",
    "meaning": "ngăn cản, răn đe",
    "cefr": "C1",
    "ipa": "/dɪˈtɜː(r)/",
    "syn": "discourage, prevent",
    "opp": "encourage",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Bright street lighting helps deter burglars."
  },
  {
    "id": 203,
    "word": "to detract (from)",
    "meaning": "làm giảm giá trị, uy tín",
    "cefr": "C2",
    "ipa": "/dɪˈtrækt/",
    "syn": "reduce, diminish",
    "opp": "enhance",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The graffiti on the old bridge detracts from its historic charm."
  },
  {
    "id": 204,
    "word": "to devise",
    "meaning": "phát minh, nghĩ ra",
    "cefr": "C1",
    "ipa": "/dɪˈvaɪz/",
    "syn": "invent, create",
    "opp": "destroy",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The students devised a rota to share the cleaning duties."
  },
  {
    "id": 205,
    "word": "to diminish",
    "meaning": "giảm bớt, thu nhỏ",
    "cefr": "C1",
    "ipa": "/dɪˈmɪnɪʃ/",
    "syn": "lessen, decrease",
    "opp": "increase",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The medicine gradually diminished the pain in his back."
  },
  {
    "id": 206,
    "word": "to disclose",
    "meaning": "tiết lộ, để lộ ra",
    "cefr": "C1",
    "ipa": "/dɪsˈkləʊz/",
    "syn": "reveal, expose",
    "opp": "conceal",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Candidates must disclose any conflict of interest before the vote."
  },
  {
    "id": 207,
    "word": "discretion (n)",
    "meaning": "sự thận trọng, kín đáo",
    "cefr": "C2",
    "ipa": "/dɪˈskreʃn/",
    "syn": "judgment, prudence",
    "opp": "carelessness",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "Hotel staff handle celebrity guests with absolute discretion."
  },
  {
    "id": 208,
    "word": "to disperse",
    "meaning": "giải tán, phân tán",
    "cefr": "C1",
    "ipa": "/dɪˈspɜːs/",
    "syn": "scatter, spread",
    "opp": "gather",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Police waited for the crowd to disperse before closing the square."
  },
  {
    "id": 209,
    "word": "to disrupt",
    "meaning": "làm gián đoạn, phá vỡ",
    "cefr": "C1",
    "ipa": "/dɪsˈrʌpt/",
    "syn": "disturb, interrupt",
    "opp": "stabilize",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "A false alarm disrupted the afternoon exams."
  },
  {
    "id": 210,
    "word": "to diverge",
    "meaning": "khác nhau, rẽ ra",
    "cefr": "C2",
    "ipa": "/daɪˈvɜːdʒ/",
    "syn": "separate, deviate",
    "opp": "converge",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The two sisters' careers began to diverge after they left university."
  },
  {
    "id": 211,
    "word": "dubious (adj)",
    "meaning": "nghi ngờ, không chắc chắn",
    "cefr": "C1",
    "ipa": "/ˈdjuːbiəs/",
    "syn": "doubtful, uncertain",
    "opp": "certain",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Investors refused to sign the contract because of its dubious terms."
  },
  {
    "id": 212,
    "word": "to elicit",
    "meaning": "khơi gợi, gợi ra",
    "cefr": "C2",
    "ipa": "/iˈlɪsɪt/",
    "syn": "draw out, evoke",
    "opp": "suppress",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The survey was designed to elicit honest answers from employees."
  },
  {
    "id": 213,
    "word": "to elude",
    "meaning": "né tránh, thoát khỏi",
    "cefr": "C2",
    "ipa": "/iˈluːd/",
    "syn": "escape, avoid",
    "opp": "confront",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The bank robbers managed to elude the police for three days."
  },
  {
    "id": 214,
    "word": "to emerge",
    "meaning": "xuất hiện, nổi lên",
    "cefr": "C1",
    "ipa": "/iˈmɜːdʒ/",
    "syn": "appear, arise",
    "opp": "disappear",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "New details about the crash continue to emerge every day."
  },
  {
    "id": 215,
    "word": "empirical (adj)",
    "meaning": "dựa trên kinh nghiệm, thực nghiệm",
    "cefr": "C2",
    "ipa": "/ɪmˈpɪrɪkl/",
    "syn": "experimental, factual",
    "opp": "theoretical",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The theory finally received empirical support from laboratory tests."
  },
  {
    "id": 216,
    "word": "to endure",
    "meaning": "chịu đựng, kéo dài",
    "cefr": "C1",
    "ipa": "/ɪnˈdjʊə(r)/",
    "syn": "tolerate, withstand",
    "opp": "quit",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Miners once endured terrible conditions hundreds of metres underground."
  },
  {
    "id": 217,
    "word": "to enhance",
    "meaning": "nâng cao, cải thiện",
    "cefr": "C1",
    "ipa": "/ɪnˈhɑːns/",
    "syn": "improve, strengthen",
    "opp": "weaken",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "A short evening course can enhance your chances of promotion."
  },
  {
    "id": 218,
    "word": "to enrich",
    "meaning": "làm giàu, làm phong phú",
    "cefr": "C1",
    "ipa": "/ɪnˈrɪtʃ/",
    "syn": "improve, refine",
    "opp": "impoverish",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Reading widely will enrich your vocabulary and your imagination."
  },
  {
    "id": 219,
    "word": "to entail",
    "meaning": "đòi hỏi, bao gồm",
    "cefr": "C1",
    "ipa": "/ɪnˈteɪl/",
    "syn": "involve, require",
    "opp": "exclude",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Accepting the scholarship would entail moving abroad for two years."
  },
  {
    "id": 220,
    "word": "to entice",
    "meaning": "dụ dỗ, thu hút",
    "cefr": "C2",
    "ipa": "/ɪnˈtaɪs/",
    "syn": "attract, tempt",
    "opp": "repel",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Shops entice customers with discounts displayed in the windows."
  },
  {
    "id": 221,
    "word": "equilibrium (n)",
    "meaning": "trạng thái cân bằng",
    "cefr": "C2",
    "ipa": "/ˌiːkwɪˈlɪbriəm/",
    "syn": "balance, stability",
    "opp": "imbalance",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The market slowly returned to equilibrium after the price shock."
  },
  {
    "id": 222,
    "word": "to eradicate",
    "meaning": "xóa bỏ, diệt trừ",
    "cefr": "C2",
    "ipa": "/ɪˈrædɪkeɪt/",
    "syn": "eliminate, destroy",
    "opp": "preserve",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Global vaccination campaigns helped eradicate smallpox in the last century."
  },
  {
    "id": 223,
    "word": "to escalate",
    "meaning": "leo thang, tăng lên",
    "cefr": "C1",
    "ipa": "/ˈeskəleɪt/",
    "syn": "intensify, increase",
    "opp": "decrease",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Managers hoped the pay dispute would not escalate into a strike."
  },
  {
    "id": 224,
    "word": "to evaluate",
    "meaning": "đánh giá, ước lượng",
    "cefr": "C1",
    "ipa": "/ɪˈvæljueɪt/",
    "syn": "assess, judge",
    "opp": "ignore",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The committee will evaluate each proposal before awarding the grant."
  },
  {
    "id": 225,
    "word": "to evoke",
    "meaning": "gợi lên (cảm xúc, ký ức)",
    "cefr": "C1",
    "ipa": "/ɪˈvəʊk/",
    "syn": "bring to mind, arouse",
    "opp": "suppress",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The smell of chalk still evokes memories of my first classroom."
  },
  {
    "id": 226,
    "word": "to exceed",
    "meaning": "vượt quá",
    "cefr": "C1",
    "ipa": "/ɪkˈsiːd/",
    "syn": "surpass, outdo",
    "opp": "fall behind",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Application numbers exceed all forecasts this year."
  },
  {
    "id": 227,
    "word": "exemplary (adj)",
    "meaning": "gương mẫu, kiểu mẫu",
    "cefr": "C2",
    "ipa": "/ɪɡˈzempləri/",
    "syn": "model, ideal",
    "opp": "unworthy",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "Her exemplary record made her the natural choice for team captain."
  },
  {
    "id": 228,
    "word": "to exert",
    "meaning": "sử dụng, áp dụng (sức lực, quyền lực)",
    "cefr": "C1",
    "ipa": "/ɪɡˈzɜːt/",
    "syn": "apply, use",
    "opp": "withhold",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The union will exert pressure until the pay deal is honoured."
  },
  {
    "id": 229,
    "word": "explicit (adj)",
    "meaning": "rõ ràng, minh bạch",
    "cefr": "C1",
    "ipa": "/ɪkˈsplɪsɪt/",
    "syn": "clear, direct",
    "opp": "vague",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The teacher gave explicit instructions for the lab experiment."
  },
  {
    "id": 230,
    "word": "feasible (adj)",
    "meaning": "khả thi",
    "cefr": "C1",
    "ipa": "/ˈfiːzəbl/",
    "syn": "possible, workable",
    "opp": "impossible",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Building a bridge here is technically feasible but very expensive."
  },
  {
    "id": 231,
    "word": "to fluctuate",
    "meaning": "dao động, biến động",
    "cefr": "C1",
    "ipa": "/ˈflʌktʃueɪt/",
    "syn": "vary, change",
    "opp": "stabilize",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Vegetable prices fluctuate sharply from one season to the next."
  },
  {
    "id": 232,
    "word": "to formulate",
    "meaning": "xây dựng, đề ra",
    "cefr": "C1",
    "ipa": "/ˈfɔːmjuleɪt/",
    "syn": "create, develop",
    "opp": "ignore",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The committee met to formulate a response to the inspectors' report."
  },
  {
    "id": 233,
    "word": "to fortify",
    "meaning": "củng cố, làm mạnh thêm",
    "cefr": "C2",
    "ipa": "/ˈfɔːtɪfaɪ/",
    "syn": "strengthen, reinforce",
    "opp": "weaken",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Workers fortified the levee with sandbags before the flood arrived."
  },
  {
    "id": 234,
    "word": "to foster",
    "meaning": "thúc đẩy, nuôi dưỡng",
    "cefr": "C1",
    "ipa": "/ˈfɒstə(r)/",
    "syn": "encourage, nurture",
    "opp": "hinder",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Morning reading circles foster a love of stories in young pupils."
  },
  {
    "id": 235,
    "word": "friction (n)",
    "meaning": "xung đột, ma sát",
    "cefr": "C1",
    "ipa": "/ˈfrɪkʃn/",
    "syn": "conflict, tension",
    "opp": "harmony",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Trade tariffs caused friction between the two neighbouring countries."
  },
  {
    "id": 236,
    "word": "fundamental (adj)",
    "meaning": "cơ bản, thiết yếu",
    "cefr": "C1",
    "ipa": "/ˌfʌndəˈmentl/",
    "syn": "basic, essential",
    "opp": "minor",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Reading is a fundamental skill for every other subject."
  },
  {
    "id": 237,
    "word": "to gratify",
    "meaning": "làm hài lòng, thỏa mãn",
    "cefr": "C1",
    "ipa": "/ˈɡrætɪfaɪ/",
    "syn": "please, satisfy",
    "opp": "disappoint",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "It gratified the retired teacher to see her students succeed."
  },
  {
    "id": 238,
    "word": "grievance (n)",
    "meaning": "lời phàn nàn, bất bình",
    "cefr": "C2",
    "ipa": "/ˈɡriːvəns/",
    "syn": "complaint, objection",
    "opp": "contentment",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Workers filed a formal grievance about the unpaid overtime."
  },
  {
    "id": 239,
    "word": "to hamper",
    "meaning": "cản trở, gây khó khăn",
    "cefr": "C1",
    "ipa": "/ˈhæmpə(r)/",
    "syn": "obstruct, hinder",
    "opp": "facilitate",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Thick fog hampered rescue teams searching the hillside."
  },
  {
    "id": 240,
    "word": "harsh (adj)",
    "meaning": "khắc nghiệt, gay gắt",
    "cefr": "C1",
    "ipa": "/hɑːʃ/",
    "syn": "severe, strict",
    "opp": "gentle",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The desert is beautiful but harsh, with freezing nights."
  },
  {
    "id": 241,
    "word": "to heed",
    "meaning": "chú ý, lưu tâm",
    "cefr": "C2",
    "ipa": "/hiːd/",
    "syn": "pay attention to, observe",
    "opp": "ignore",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Cyclists should heed the warning signs at the level crossing."
  },
  {
    "id": 242,
    "word": "hindrance (n)",
    "meaning": "sự cản trở",
    "cefr": "C1",
    "ipa": "/ˈhɪndrəns/",
    "syn": "obstacle, barrier",
    "opp": "assistance",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Poor eyesight proved no hindrance to her chess career."
  },
  {
    "id": 243,
    "word": "to illustrate",
    "meaning": "minh họa, làm rõ",
    "cefr": "C1",
    "ipa": "/ˈɪləstreɪt/",
    "syn": "demonstrate, explain",
    "opp": "confuse",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The lecturer used a simple graph to illustrate population growth."
  },
  {
    "id": 244,
    "word": "to immerse",
    "meaning": "đắm chìm, hòa mình vào",
    "cefr": "C1",
    "ipa": "/ɪˈmɜːs/",
    "syn": "involve deeply, absorb",
    "opp": "detach",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Exchange students immerse themselves in the language of their host country."
  },
  {
    "id": 245,
    "word": "to impair",
    "meaning": "làm suy yếu, tổn hại",
    "cefr": "C1",
    "ipa": "/ɪmˈpeə(r)/",
    "syn": "damage, weaken",
    "opp": "improve",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Even moderate drinking can impair a driver's reaction time."
  },
  {
    "id": 246,
    "word": "to impose",
    "meaning": "áp đặt",
    "cefr": "C1",
    "ipa": "/ɪmˈpəʊz/",
    "syn": "enforce, force",
    "opp": "remove",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The city may impose a fine on households that waste water."
  },
  {
    "id": 247,
    "word": "incentive (n)",
    "meaning": "động lực, khuyến khích",
    "cefr": "C1",
    "ipa": "/ɪnˈsentɪv/",
    "syn": "motivation, encouragement",
    "opp": "deterrent",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Bonuses give staff an incentive to meet their monthly targets."
  },
  {
    "id": 248,
    "word": "to incorporate",
    "meaning": "kết hợp, bao gồm",
    "cefr": "C1",
    "ipa": "/ɪnˈkɔːpəreɪt/",
    "syn": "include, integrate",
    "opp": "exclude",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The final design will incorporate suggestions from both classes."
  },
  {
    "id": 249,
    "word": "inevitable (adj)",
    "meaning": "không thể tránh khỏi",
    "cefr": "C1",
    "ipa": "/ɪnˈevɪtəbl/",
    "syn": "unavoidable, certain",
    "opp": "avoidable",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "With such heavy rain, flooding in the low streets was inevitable."
  },
  {
    "id": 250,
    "word": "to infer",
    "meaning": "suy ra, kết luận",
    "cefr": "C1",
    "ipa": "/ɪnˈfɜː(r)/",
    "syn": "deduce, conclude",
    "opp": "state",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "From the empty plates, we could infer that dinner had been popular."
  },
  {
    "id": 251,
    "word": "ingenious (adj)",
    "meaning": "khéo léo, thông minh sáng tạo",
    "cefr": "C2",
    "ipa": "/ɪnˈdʒiːniəs/",
    "syn": "clever, inventive",
    "opp": "foolish",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "An ingenious pulley system lifted the piano through the window."
  },
  {
    "id": 252,
    "word": "to inhibit",
    "meaning": "ngăn chặn, kiểm chế",
    "cefr": "C1",
    "ipa": "/ɪnˈhɪbɪt/",
    "syn": "restrain, prevent",
    "opp": "encourage",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Stage fright can inhibit even talented speakers during a presentation."
  },
  {
    "id": 253,
    "word": "initiative (n)",
    "meaning": "sáng kiến, sự chủ động",
    "cefr": "C1",
    "ipa": "/ɪˈnɪʃətɪv/",
    "syn": "enterprise, action",
    "opp": "inactivity",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "A student initiative planted two hundred trees along the school fence."
  },
  {
    "id": 254,
    "word": "innovative (adj)",
    "meaning": "đổi mới, sáng tạo",
    "cefr": "C1",
    "ipa": "/ˈɪnəvətɪv/",
    "syn": "creative, original",
    "opp": "traditional",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The prize rewards the most innovative use of technology in teaching."
  },
  {
    "id": 255,
    "word": "insightful (adj)",
    "meaning": "sâu sắc, sáng suốt",
    "cefr": "C2",
    "ipa": "/ɪnˈsaɪtfl/",
    "syn": "perceptive, wise",
    "opp": "ignorant",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Her insightful questions showed she had read the report carefully."
  },
  {
    "id": 256,
    "word": "to integrate",
    "meaning": "hội nhập, kết hợp",
    "cefr": "C1",
    "ipa": "/ˈɪntɪɡreɪt/",
    "syn": "combine, merge",
    "opp": "separate",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The programme helps migrant children integrate into local schools."
  },
  {
    "id": 257,
    "word": "integrity (n)",
    "meaning": "tính trung thực, chính trực",
    "cefr": "C1",
    "ipa": "/ɪnˈteɡrəti/",
    "syn": "honesty, morality",
    "opp": "dishonesty",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The judge's integrity has never been questioned."
  },
  {
    "id": 258,
    "word": "to intimidate",
    "meaning": "dọa dẫm, hăm dọa",
    "cefr": "C1",
    "ipa": "/ɪnˈtɪmɪdeɪt/",
    "syn": "frighten, threaten",
    "opp": "comfort",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Bullies often intimidate younger students in empty corridors."
  },
  {
    "id": 259,
    "word": "intricate (adj)",
    "meaning": "phức tạp, rắc rối",
    "cefr": "C1",
    "ipa": "/ˈɪntrɪkət/",
    "syn": "complex, detailed",
    "opp": "simple",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The palace is famous for its intricate carvings of lotus flowers."
  },
  {
    "id": 260,
    "word": "to intrude",
    "meaning": "xâm phạm, chen vào",
    "cefr": "C1",
    "ipa": "/ɪnˈtruːd/",
    "syn": "interrupt, invade",
    "opp": "withdraw",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Reporters should not intrude on a family's private grief."
  },
  {
    "id": 261,
    "word": "irrelevant (adj)",
    "meaning": "không liên quan, không thích hợp",
    "cefr": "C1",
    "ipa": "/ɪˈreləvənt/",
    "syn": "unrelated, unconnected",
    "opp": "relevant",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The lawyer objected that the question was irrelevant to the case."
  },
  {
    "id": 262,
    "word": "legitimate (adj)",
    "meaning": "hợp pháp, chính đáng",
    "cefr": "C1",
    "ipa": "/lɪˈdʒɪtɪmət/",
    "syn": "lawful, valid",
    "opp": "illegal",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Refunding a faulty product is a legitimate demand."
  },
  {
    "id": 263,
    "word": "lenient (adj)",
    "meaning": "khoan dung, nhân hậu",
    "cefr": "C1",
    "ipa": "/ˈliːniənt/",
    "syn": "tolerant, merciful",
    "opp": "strict",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "The teacher was lenient and allowed a second attempt at the test."
  },
  {
    "id": 264,
    "word": "liability (n)",
    "meaning": "trách nhiệm pháp lý",
    "cefr": "C1",
    "ipa": "/ˌlaɪəˈbɪləti/",
    "syn": "responsibility, burden",
    "opp": "asset",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The company accepted full liability for the chemical spill."
  },
  {
    "id": 265,
    "word": "linguistic (adj)",
    "meaning": "thuộc ngôn ngữ học",
    "cefr": "C1",
    "ipa": "/lɪŋˈɡwɪstɪk/",
    "syn": "verbal, language-related",
    "opp": "nonverbal",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Children display remarkable linguistic ability before the age of five."
  },
  {
    "id": 266,
    "word": "lucid (adj)",
    "meaning": "rõ ràng, dễ hiểu",
    "cefr": "C2",
    "ipa": "/ˈluːsɪd/",
    "syn": "clear, intelligible",
    "opp": "confused",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The professor gave a lucid explanation of a very difficult theory."
  },
  {
    "id": 267,
    "word": "to magnify",
    "meaning": "phóng đại, làm to ra",
    "cefr": "C1",
    "ipa": "/ˈmæɡnɪfaɪ/",
    "syn": "enlarge, exaggerate",
    "opp": "reduce",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The new telescope will magnify faint galaxies a thousand times."
  },
  {
    "id": 268,
    "word": "mandatory (adj)",
    "meaning": "bắt buộc, bắt phải làm",
    "cefr": "C1",
    "ipa": "/mænˈdeɪtəri/",
    "syn": "obligatory, required",
    "opp": "voluntary",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Helmets are mandatory for all riders on this track."
  },
  {
    "id": 269,
    "word": "meticulous (adj)",
    "meaning": "tỉ mỉ, kỹ lưỡng",
    "cefr": "C2",
    "ipa": "/məˈtɪkjələs/",
    "syn": "careful, thorough",
    "opp": "careless",
    "buoi": 8,
    "topic": "Con người & phẩm chất",
    "ex": "Watchmakers perform meticulous work with tiny screws."
  },
  {
    "id": 270,
    "word": "to mimic",
    "meaning": "bắt chước, nhại lại",
    "cefr": "C1",
    "ipa": "/ˈmɪmɪk/",
    "syn": "imitate, copy",
    "opp": "differ",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Parrots can mimic human speech with surprising accuracy."
  },
  {
    "id": 271,
    "word": "notorious (adj)",
    "meaning": "khét tiếng (tiêu cực)",
    "cefr": "C1",
    "ipa": "/nəʊˈtɔːriəs/",
    "syn": "infamous, disreputable",
    "opp": "reputable",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The narrow junction is notorious for accidents during the rainy season."
  },
  {
    "id": 272,
    "word": "oblivious (adj)",
    "meaning": "không nhận ra, lơ đãng",
    "cefr": "C1",
    "ipa": "/əˈblɪviəs/",
    "syn": "unaware, ignorant",
    "opp": "conscious",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Absorbed in her novel, she was oblivious to the ringing telephone."
  },
  {
    "id": 273,
    "word": "obsolete (adj)",
    "meaning": "lỗi thời, lạc hậu",
    "cefr": "C1",
    "ipa": "/ˈɒbsəliːt/",
    "syn": "outdated, archaic",
    "opp": "modern",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Fax machines quickly became obsolete once email took over offices."
  },
  {
    "id": 274,
    "word": "ominous (adj)",
    "meaning": "điềm gở, báo hiệu xấu",
    "cefr": "C2",
    "ipa": "/ˈɒmɪnəs/",
    "syn": "threatening, foreboding",
    "opp": "promising",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "An ominous silence filled the stadium after the missed penalty."
  },
  {
    "id": 275,
    "word": "outlandish (adj)",
    "meaning": "kỳ quặc, lạ thường",
    "cefr": "C2",
    "ipa": "/aʊtˈlændɪʃ/",
    "syn": "bizarre, strange",
    "opp": "normal",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The designer's outlandish hat stole the show at the parade."
  },
  {
    "id": 276,
    "word": "to overwhelm",
    "meaning": "áp đảo, tràn ngập",
    "cefr": "C1",
    "ipa": "/ˌəʊvəˈwelm/",
    "syn": "overpower, stun",
    "opp": "underwhelm",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The response to the charity appeal continued to overwhelm the volunteers."
  },
  {
    "id": 277,
    "word": "paradox (n)",
    "meaning": "nghịch lý",
    "cefr": "C2",
    "ipa": "/ˈpærədɒks/",
    "syn": "contradiction, puzzle",
    "opp": "consistency",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "It is a paradox that the busiest people often find the most time to help."
  },
  {
    "id": 278,
    "word": "perceivable (adj)",
    "meaning": "có thể nhận thấy được",
    "cefr": "C2",
    "ipa": "",
    "syn": "detectable, noticeable",
    "opp": "invisible",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "There was no perceivable difference between the two samples."
  },
  {
    "id": 279,
    "word": "perplexed (adj)",
    "meaning": "bối rối, lúng túng",
    "cefr": "C1",
    "ipa": "/pəˈplekst/",
    "syn": "confused, puzzled",
    "opp": "certain",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The perplexed tourist studied the metro map for ten minutes."
  },
  {
    "id": 280,
    "word": "pertinent (adj)",
    "meaning": "thích hợp, có liên quan",
    "cefr": "C2",
    "ipa": "/ˈpɜːtɪnənt/",
    "syn": "relevant, appropriate",
    "opp": "irrelevant",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Please keep your comments pertinent to the topic under discussion."
  },
  {
    "id": 281,
    "word": "pivotal (adj)",
    "meaning": "then chốt, quan trọng",
    "cefr": "C1",
    "ipa": "/ˈpɪvətl/",
    "syn": "crucial, essential",
    "opp": "minor",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "Her pivotal role in the negotiations earned her national respect."
  },
  {
    "id": 282,
    "word": "plausible (adj)",
    "meaning": "hợp lý, đáng tin",
    "cefr": "C1",
    "ipa": "/ˈplɔːzəbl/",
    "syn": "reasonable, believable",
    "opp": "implausible",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "The detective offered a plausible explanation for the missing keys."
  },
  {
    "id": 283,
    "word": "to postulate",
    "meaning": "giả định, cho rằng",
    "cefr": "C2",
    "ipa": "/ˈpɒstʃəleɪt/",
    "syn": "assume, hypothesize",
    "opp": "deny",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The theory postulates that language shaped the way early humans thought."
  },
  {
    "id": 284,
    "word": "precaution (n)",
    "meaning": "biện pháp phòng ngừa",
    "cefr": "C1",
    "ipa": "/prɪˈkɔːʃn/",
    "syn": "safeguard, protection",
    "opp": "risk",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "Take the basic precaution of backing up your files every evening."
  },
  {
    "id": 285,
    "word": "predicament (n)",
    "meaning": "tình huống khó xử",
    "cefr": "C1",
    "ipa": "/prɪˈdɪkəmənt/",
    "syn": "dilemma, difficulty",
    "opp": "advantage",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "Losing his passport abroad left him in an awkward predicament."
  },
  {
    "id": 286,
    "word": "preliminary (adj)",
    "meaning": "sơ bộ, ban đầu",
    "cefr": "C1",
    "ipa": "/prɪˈlɪmɪnəri/",
    "syn": "initial, preparatory",
    "opp": "final",
    "buoi": 7,
    "topic": "Hành vi & quy trình",
    "ex": "The preliminary results suggest the vaccine is safe."
  },
  {
    "id": 287,
    "word": "to presume",
    "meaning": "cho là, đoán là",
    "cefr": "C1",
    "ipa": "/prɪˈzjuːm/",
    "syn": "assume, suppose",
    "opp": "doubt",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "I presume you have all read the circular about the school trip."
  },
  {
    "id": 288,
    "word": "to prevail",
    "meaning": "chiếm ưu thế, thắng thế",
    "cefr": "C1",
    "ipa": "/prɪˈveɪl/",
    "syn": "triumph, dominate",
    "opp": "fail",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "In the end, calm judgement prevailed over anger."
  },
  {
    "id": 289,
    "word": "profoundly (adv)",
    "meaning": "sâu sắc, mạnh mẽ",
    "cefr": "C2",
    "ipa": "/prəˈfaʊndli/",
    "syn": "deeply, intensely",
    "opp": "superficially",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "Moving to the countryside profoundly changed her view of city life."
  },
  {
    "id": 290,
    "word": "to prolong",
    "meaning": "kéo dài, gia hạn",
    "cefr": "C1",
    "ipa": "/prəˈlɒŋ/",
    "syn": "extend, lengthen",
    "opp": "shorten",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The new treatment can prolong the lives of patients with the disease."
  },
  {
    "id": 291,
    "word": "prominent (adj)",
    "meaning": "nổi bật, quan trọng",
    "cefr": "C1",
    "ipa": "",
    "syn": "well-known, noticeable (mờ)",
    "opp": "obscure (mờ)",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "A prominent portrait of the founder hangs above the entrance."
  },
  {
    "id": 292,
    "word": "prospect (n)",
    "meaning": "triển vọng, khả năng",
    "cefr": "C1",
    "ipa": "",
    "syn": "possibility, chance (mờ)",
    "opp": "improbability (mờ)",
    "buoi": 4,
    "topic": "Xã hội & kinh tế",
    "ex": "The prospect of a week without homework delighted the class."
  },
  {
    "id": 293,
    "word": "to provoke",
    "meaning": "khiêu khích, kích động",
    "cefr": "C1",
    "ipa": "",
    "syn": "irritate, incite (mờ)",
    "opp": "soothe (mờ)",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The cartoon was meant to amuse, not to provoke anger."
  },
  {
    "id": 294,
    "word": "rationale (n)",
    "meaning": "lý do căn bản",
    "cefr": "C1",
    "ipa": "",
    "syn": "reason, justification (mờ)",
    "opp": "irrationality (mờ)",
    "buoi": 3,
    "topic": "Tư duy & nhận thức",
    "ex": "The principal explained the rationale behind the new timetable."
  },
  {
    "id": 295,
    "word": "to recur",
    "meaning": "tái diễn, lặp lại",
    "cefr": "C1",
    "ipa": "",
    "syn": "happen again, repeat (mờ)",
    "opp": "cease (mờ)",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "Doctors warned that the infection might recur without a full course of treatment."
  },
  {
    "id": 296,
    "word": "to reinforce",
    "meaning": "củng cố, tăng cường",
    "cefr": "C1",
    "ipa": "",
    "syn": "strengthen, support (mờ)",
    "opp": "weaken (mờ)",
    "buoi": 2,
    "topic": "Thay đổi & ảnh hưởng",
    "ex": "The trainer used role-play to reinforce the lessons from the morning lecture."
  },
  {
    "id": 297,
    "word": "reluctant (adj)",
    "meaning": "miễn cưỡng, do dự",
    "cefr": "C1",
    "ipa": "",
    "syn": "unwilling, hesitant (mờ)",
    "opp": "willing (mờ)",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "He was reluctant to admit that he had forgotten the appointment."
  },
  {
    "id": 298,
    "word": "resilient (adj)",
    "meaning": "kiên cường, phục hồi nhanh",
    "cefr": "C1",
    "ipa": "",
    "syn": "strong, adaptable (mờ)",
    "opp": "fragile (mờ)",
    "buoi": 6,
    "topic": "Cảm xúc & quan hệ",
    "ex": "The resilient town rebuilt its market within a year of the fire."
  },
  {
    "id": 299,
    "word": "to scrutinize",
    "meaning": "xem xét kỹ lưỡng",
    "cefr": "C2",
    "ipa": "",
    "syn": "inspect, examine (mờ)",
    "opp": "neglect (mờ)",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Customs officers scrutinize every document before allowing the goods through."
  },
  {
    "id": 300,
    "word": "skeptical (adj)",
    "meaning": "hoài nghi, nghi ngờ",
    "cefr": "C1",
    "ipa": "",
    "syn": "doubtful, unconvinced (mờ)",
    "opp": "trusting (mờ)",
    "buoi": 1,
    "topic": "Đánh giá & thái độ",
    "ex": "Scientists remained skeptical until the results could be reproduced."
  }
];

const VN_EXAM_STRUCTURES = [
  {
    "id": "struct-1",
    "structure": "absorbed in something",
    "meaning": "mải mê, say mê cái gì"
  },
  {
    "id": "struct-2",
    "structure": "be dependent on something",
    "meaning": "phụ thuộc vào cái gì"
  },
  {
    "id": "struct-3",
    "structure": "be responsible for doing something",
    "meaning": "chịu trách nhiệm làm gì"
  },
  {
    "id": "struct-4",
    "structure": "disagree with something",
    "meaning": "không đồng ý với cái gì"
  },
  {
    "id": "struct-5",
    "structure": "fall for something",
    "meaning": "bị lừa, mắc bẫy cái gì"
  },
  {
    "id": "struct-6",
    "structure": "figure out something",
    "meaning": "tìm ra, hiểu ra cái gì"
  },
  {
    "id": "struct-7",
    "structure": "let somebody down",
    "meaning": "làm ai đó thất vọng"
  },
  {
    "id": "struct-8",
    "structure": "play a role in doing something",
    "meaning": "đóng vai trò trong việc làm gì"
  },
  {
    "id": "struct-9",
    "structure": "pretend to do something",
    "meaning": "giả vờ làm gì"
  },
  {
    "id": "struct-10",
    "structure": "reflect on something",
    "meaning": "suy ngẫm, chiêm nghiệm về cái gì"
  },
  {
    "id": "struct-11",
    "structure": "rely on something",
    "meaning": "dựa vào, phụ thuộc vào cái gì"
  },
  {
    "id": "struct-12",
    "structure": "sign up for something",
    "meaning": "đăng ký tham gia, ghi danh vào cái gì"
  },
  {
    "id": "struct-13",
    "structure": "take a gap year",
    "meaning": "nghỉ một năm (thường là học sinh tốt nghiệp cấp 3 chuẩn bị vào đại học hoặc sinh viên mới tốt nghiệp)"
  },
  {
    "id": "struct-14",
    "structure": "turn to somebody/something",
    "meaning": "tìm đến ai/cái gì để nhận được giúp đỡ, lời khuyên"
  },
  {
    "id": "struct-15",
    "structure": "worried about something",
    "meaning": "lo lắng về cái gì"
  },
  {
    "id": "struct-16",
    "structure": "account for",
    "meaning": "chiếm (tỷ lệ), giải thích cho"
  },
  {
    "id": "struct-17",
    "structure": "appeal to somebody",
    "meaning": "thu hút ai đó"
  },
  {
    "id": "struct-18",
    "structure": "apply for",
    "meaning": "nộp đơn xin (việc, học bổng, vị trí,…)"
  },
  {
    "id": "struct-19",
    "structure": "at the cost of",
    "meaning": "phải trả giá bằng"
  },
  {
    "id": "struct-20",
    "structure": "be concerned about",
    "meaning": "lo ngại về, quan tâm đến"
  },
  {
    "id": "struct-21",
    "structure": "be linked to something",
    "meaning": "có liên quan đến"
  },
  {
    "id": "struct-22",
    "structure": "be to blame for something",
    "meaning": "phải chịu trách nhiệm cho việc gì"
  },
  {
    "id": "struct-23",
    "structure": "come along",
    "meaning": "đến, xuất hiện, đồng hành"
  },
  {
    "id": "struct-24",
    "structure": "concern about something",
    "meaning": "lo lắng, lo ngại về điều gì đó"
  },
  {
    "id": "struct-25",
    "structure": "demand for something",
    "meaning": "nhu cầu đối với cái gì"
  },
  {
    "id": "struct-26",
    "structure": "different from",
    "meaning": "khác với"
  },
  {
    "id": "struct-27",
    "structure": "eager to do something",
    "meaning": "háo hức làm điều gì đó"
  },
  {
    "id": "struct-28",
    "structure": "give up",
    "meaning": "từ bỏ"
  },
  {
    "id": "struct-29",
    "structure": "interact with",
    "meaning": "tương tác với"
  },
  {
    "id": "struct-30",
    "structure": "live off the land",
    "meaning": "sống dựa vào thiên nhiên, tự cung tự cấp"
  },
  {
    "id": "struct-31",
    "structure": "made from",
    "meaning": "được làm từ"
  },
  {
    "id": "struct-32",
    "structure": "open to somebody",
    "meaning": "mở cửa, sẵn sàng cho ai đó tiếp cận/tham gia"
  },
  {
    "id": "struct-33",
    "structure": "protect somebody from something",
    "meaning": "bảo vệ ai khỏi điều gì"
  },
  {
    "id": "struct-34",
    "structure": "put something at risk",
    "meaning": "đặt cái gì vào tình thế rủi ro"
  },
  {
    "id": "struct-35",
    "structure": "roll up",
    "meaning": "cuộn lại, kéo lên (tay áo)"
  },
  {
    "id": "struct-36",
    "structure": "sacrifice something for something",
    "meaning": "hy sinh cái gì cho cái gì"
  },
  {
    "id": "struct-37",
    "structure": "struggle to do something",
    "meaning": "chật vật để làm điều gì đó"
  },
  {
    "id": "struct-38",
    "structure": "take over",
    "meaning": "tiếp quản, chiếm quyền kiểm soát"
  },
  {
    "id": "struct-39",
    "structure": "trade something for something",
    "meaning": "đổi cái gì lấy cái gì"
  },
  {
    "id": "struct-40",
    "structure": "with a view to doing something",
    "meaning": "với mục đích làm gì đó"
  },
  {
    "id": "struct-41",
    "structure": "in case of",
    "meaning": "trong trường hợp"
  },
  {
    "id": "struct-42",
    "structure": "stay on track",
    "meaning": "giữ vững sự tập trung, không bị sao nhãng, giữ đúng hướng"
  },
  {
    "id": "struct-43",
    "structure": "put off",
    "meaning": "hoãn lại, trì hoãn"
  },
  {
    "id": "struct-44",
    "structure": "bring out something",
    "meaning": "làm lộ ra, làm nổi bật; xuất bản, đưa ra thị trường"
  },
  {
    "id": "struct-45",
    "structure": "clear out something",
    "meaning": "dọn sạch, dọn dẹp, vứt bỏ những thứ không cần thiết"
  },
  {
    "id": "struct-46",
    "structure": "keep out",
    "meaning": "ngăn không cho vào"
  },
  {
    "id": "struct-47",
    "structure": "take part in something",
    "meaning": "tham gia vào việc gì đó"
  },
  {
    "id": "struct-48",
    "structure": "exposure to something",
    "meaning": "sự tiếp xúc với cái gì"
  },
  {
    "id": "struct-49",
    "structure": "fill out",
    "meaning": "điền vào (mẫu đơn, giấy tờ)"
  },
  {
    "id": "struct-50",
    "structure": "filter out",
    "meaning": "lọc ra, loại bỏ"
  },
  {
    "id": "struct-51",
    "structure": "make use of",
    "meaning": "tận dụng, sử dụng"
  },
  {
    "id": "struct-52",
    "structure": "mean to do something",
    "meaning": "có ý định làm gì"
  },
  {
    "id": "struct-53",
    "structure": "push out",
    "meaning": "đẩy ra, loại bỏ"
  },
  {
    "id": "struct-54",
    "structure": "run off",
    "meaning": "bỏ chạy, chạy trốn"
  },
  {
    "id": "struct-55",
    "structure": "show off",
    "meaning": "khoe khoang, phô trương"
  },
  {
    "id": "struct-56",
    "structure": "suffer from",
    "meaning": "chịu đựng, mắc phải (bệnh, vấn đề)"
  },
  {
    "id": "struct-57",
    "structure": "take precautions",
    "meaning": "thực hiện các biện pháp phòng ngừa"
  },
  {
    "id": "struct-58",
    "structure": "try doing something",
    "meaning": "thử làm việc gì"
  },
  {
    "id": "struct-59",
    "structure": "catch up on",
    "meaning": "làm bù, bắt kịp"
  },
  {
    "id": "struct-60",
    "structure": "enjoy doing something",
    "meaning": "thích làm gì"
  },
  {
    "id": "struct-61",
    "structure": "fit in",
    "meaning": "hòa nhập"
  },
  {
    "id": "struct-62",
    "structure": "forget to do something",
    "meaning": "quên làm gì"
  },
  {
    "id": "struct-63",
    "structure": "lead to something",
    "meaning": "dẫn đến điều gì"
  },
  {
    "id": "struct-64",
    "structure": "make up for",
    "meaning": "bù đắp"
  },
  {
    "id": "struct-65",
    "structure": "manage to do something",
    "meaning": "xoay xở để làm được"
  },
  {
    "id": "struct-66",
    "structure": "promise to do something",
    "meaning": "hứa làm gì"
  },
  {
    "id": "struct-67",
    "structure": "set off",
    "meaning": "khởi hành"
  },
  {
    "id": "struct-68",
    "structure": "be curious about something",
    "meaning": "tò mò về cái gì"
  },
  {
    "id": "struct-69",
    "structure": "do laundry",
    "meaning": "giặt giũ"
  },
  {
    "id": "struct-70",
    "structure": "grow up",
    "meaning": "lớn lên, trưởng thành"
  },
  {
    "id": "struct-71",
    "structure": "in advance",
    "meaning": "trước"
  },
  {
    "id": "struct-72",
    "structure": "keep up",
    "meaning": "tiếp tục, duy trì"
  },
  {
    "id": "struct-73",
    "structure": "make a budget",
    "meaning": "lập ngân sách"
  },
  {
    "id": "struct-74",
    "structure": "make for",
    "meaning": "tạo nên điều gì"
  },
  {
    "id": "struct-75",
    "structure": "make up",
    "meaning": "trang điểm; bịa chuyện; chiếm; làm hòa"
  },
  {
    "id": "struct-76",
    "structure": "pick up",
    "meaning": "xác định, nhận (tín hiệu/vị trí…)"
  },
  {
    "id": "struct-77",
    "structure": "put out",
    "meaning": "dập lửa"
  },
  {
    "id": "struct-78",
    "structure": "set aside",
    "meaning": "gạt sang một bên, tiết kiệm"
  },
  {
    "id": "struct-79",
    "structure": "stick to something",
    "meaning": "tuân thủ, làm theo cái gì"
  },
  {
    "id": "struct-80",
    "structure": "take place",
    "meaning": "diễn ra"
  },
  {
    "id": "struct-81",
    "structure": "a sense of community",
    "meaning": "ý thức cộng đồng"
  },
  {
    "id": "struct-82",
    "structure": "advise somebody to do something",
    "meaning": "khuyên ai đó làm gì đó"
  },
  {
    "id": "struct-83",
    "structure": "call for",
    "meaning": "kêu gọi, yêu cầu"
  },
  {
    "id": "struct-84",
    "structure": "gain real-world experience",
    "meaning": "có được kinh nghiệm thực tế"
  },
  {
    "id": "struct-85",
    "structure": "get along with",
    "meaning": "hòa thuận, có mối quan hệ tốt với ai"
  },
  {
    "id": "struct-86",
    "structure": "get through to somebody",
    "meaning": "liên lạc với ai"
  },
  {
    "id": "struct-87",
    "structure": "make the most of something",
    "meaning": "tận dụng tối đa cái gì"
  },
  {
    "id": "struct-88",
    "structure": "miss out on something",
    "meaning": "bỏ lỡ cái gì"
  },
  {
    "id": "struct-89",
    "structure": "reach out to",
    "meaning": "liên lạc, tiếp cận với ai đó để được hỗ trợ"
  },
  {
    "id": "struct-90",
    "structure": "speak up against",
    "meaning": "lên tiếng phản đối ai/cái gì"
  },
  {
    "id": "struct-91",
    "structure": "stand up for",
    "meaning": "bảo vệ, đấu tranh cho ai/cái gì"
  },
  {
    "id": "struct-92",
    "structure": "stay away from",
    "meaning": "tránh xa"
  },
  {
    "id": "struct-93",
    "structure": "stock up on something",
    "meaning": "dự trữ cái gì"
  },
  {
    "id": "struct-94",
    "structure": "be careful with somebody/something",
    "meaning": "cẩn thận với ai/cái gì"
  },
  {
    "id": "struct-95",
    "structure": "be open to",
    "meaning": "dành cho ai tham gia, mở cửa cho ai"
  },
  {
    "id": "struct-96",
    "structure": "be passionate about (doing) something",
    "meaning": "đam mê (làm) điều gì"
  },
  {
    "id": "struct-97",
    "structure": "connect with somebody",
    "meaning": "kết nối với ai"
  },
  {
    "id": "struct-98",
    "structure": "fancy doing something",
    "meaning": "thích làm gì"
  },
  {
    "id": "struct-99",
    "structure": "get on with",
    "meaning": "có mối quan hệ tốt với ai"
  },
  {
    "id": "struct-100",
    "structure": "give back to the community",
    "meaning": "đóng góp lại cho cộng đồng"
  },
  {
    "id": "struct-101",
    "structure": "look for",
    "meaning": "tìm kiếm"
  },
  {
    "id": "struct-102",
    "structure": "put up with",
    "meaning": "chịu đựng"
  },
  {
    "id": "struct-103",
    "structure": "run wild",
    "meaning": "trở nên mất kiểm soát, tự do"
  },
  {
    "id": "struct-104",
    "structure": "speak up for (≈ stand up for)",
    "meaning": "lên tiếng bảo vệ, ủng hộ cho"
  },
  {
    "id": "struct-105",
    "structure": "take down",
    "meaning": "gỡ cái gì xuống; xóa bỏ (thông tin, bài viết…)"
  },
  {
    "id": "struct-106",
    "structure": "take in",
    "meaning": "hấp thụ; hiểu cái gì"
  },
  {
    "id": "struct-107",
    "structure": "take off",
    "meaning": "cất cánh; cởi quần áo; thành công"
  },
  {
    "id": "struct-108",
    "structure": "take on",
    "meaning": "thuê; đảm nhận công việc"
  },
  {
    "id": "struct-109",
    "structure": "take out",
    "meaning": "lấy, mang cái gì ra khỏi cái gì"
  },
  {
    "id": "struct-110",
    "structure": "take up",
    "meaning": "bắt đầu theo đuổi cái gì (hoạt động, sở thích, thói quen…) — bản in ghi nhầm số \"119\""
  },
  {
    "id": "struct-111",
    "structure": "commitment to doing something",
    "meaning": "cam kết làm điều gì đó"
  },
  {
    "id": "struct-112",
    "structure": "cut down on",
    "meaning": "cắt giảm"
  },
  {
    "id": "struct-149",
    "structure": "depend on",
    "meaning": "phụ thuộc vào, dựa vào"
  },
  {
    "id": "struct-150",
    "structure": "focus on",
    "meaning": "tập trung vào"
  },
  {
    "id": "struct-151",
    "structure": "make an effort to do something",
    "meaning": "nỗ lực/cố gắng làm gì đó"
  },
  {
    "id": "struct-152",
    "structure": "result from",
    "meaning": "là kết quả từ"
  },
  {
    "id": "struct-153",
    "structure": "switch to",
    "meaning": "chuyển đổi sang cái gì"
  },
  {
    "id": "struct-154",
    "structure": "cope with",
    "meaning": "đối phó, đương đầu với"
  },
  {
    "id": "struct-155",
    "structure": "deal with",
    "meaning": "giải quyết, xử lý"
  },
  {
    "id": "struct-156",
    "structure": "encourage somebody to do something",
    "meaning": "khuyến khích ai đó làm gì"
  },
  {
    "id": "struct-157",
    "structure": "measure up (to somebody/something)",
    "meaning": "đạt tiêu chuẩn, đáp ứng kỳ vọng"
  },
  {
    "id": "struct-158",
    "structure": "persuade somebody to do something",
    "meaning": "thuyết phục ai đó làm gì"
  },
  {
    "id": "struct-159",
    "structure": "be accustomed to something",
    "meaning": "quen với điều gì"
  },
  {
    "id": "struct-160",
    "structure": "be confronted with something",
    "meaning": "đối mặt với điều gì"
  },
  {
    "id": "struct-161",
    "structure": "blend in with somebody",
    "meaning": "hòa nhập với ai"
  },
  {
    "id": "struct-162",
    "structure": "emerge from something",
    "meaning": "nổi lên từ, xuất hiện từ"
  },
  {
    "id": "struct-163",
    "structure": "expose somebody to something",
    "meaning": "cho ai tiếp xúc với cái gì"
  },
  {
    "id": "struct-164",
    "structure": "fall into something",
    "meaning": "rơi vào tình trạng gì, sa vào"
  },
  {
    "id": "struct-165",
    "structure": "fearful of something",
    "meaning": "sợ hãi điều gì"
  },
  {
    "id": "struct-166",
    "structure": "give somebody insights into something",
    "meaning": "cho ai cái nhìn sâu sắc về điều gì"
  },
  {
    "id": "struct-167",
    "structure": "give up",
    "meaning": "từ bỏ"
  },
  {
    "id": "struct-168",
    "structure": "move out",
    "meaning": "rời khỏi nơi đang ở hoặc làm việc"
  },
  {
    "id": "struct-169",
    "structure": "participate in something",
    "meaning": "tham gia vào cái gì"
  },
  {
    "id": "struct-170",
    "structure": "pick out",
    "meaning": "lựa chọn"
  },
  {
    "id": "struct-171",
    "structure": "preferable to something",
    "meaning": "đáng ưu chuộng hơn cái gì, thích hợp hơn"
  },
  {
    "id": "struct-172",
    "structure": "push something aside",
    "meaning": "gạt cái gì sang một bên"
  },
  {
    "id": "struct-173",
    "structure": "sleep rough",
    "meaning": "ngủ ngoài trời, vô gia cư"
  },
  {
    "id": "struct-174",
    "structure": "take care of/ look after",
    "meaning": "chăm sóc, lo liệu"
  },
  {
    "id": "struct-175",
    "structure": "turn out",
    "meaning": "hóa ra là"
  },
  {
    "id": "struct-176",
    "structure": "worry about something",
    "meaning": "lo lắng về điều gì"
  },
  {
    "id": "struct-177",
    "structure": "be attributed to",
    "meaning": "được cho là do, được quy cho"
  },
  {
    "id": "struct-178",
    "structure": "be based on something",
    "meaning": "được dựa trên cái gì"
  },
  {
    "id": "struct-179",
    "structure": "be capable of doing something",
    "meaning": "có khả năng làm gì"
  },
  {
    "id": "struct-180",
    "structure": "be impressed by something",
    "meaning": "bị ấn tượng bởi cái gì"
  },
  {
    "id": "struct-181",
    "structure": "discourage somebody from doing something",
    "meaning": "làm ai đó nản lòng/nhút nhát làm gì"
  },
  {
    "id": "struct-182",
    "structure": "get credit for something",
    "meaning": "được công nhận/khen ngợi vì điều gì"
  },
  {
    "id": "struct-183",
    "structure": "insist on something",
    "meaning": "khăng khăng, nằng nặc"
  },
  {
    "id": "struct-184",
    "structure": "keep an eye on",
    "meaning": "theo dõi, để mắt đến, trông nom ai/cái gì"
  },
  {
    "id": "struct-185",
    "structure": "make an impact on",
    "meaning": "tạo ra ảnh hưởng/tác động đến"
  },
  {
    "id": "struct-186",
    "structure": "broaden somebody's perspective",
    "meaning": "mở rộng góc nhìn/quan điểm của ai đó"
  },
  {
    "id": "struct-187",
    "structure": "build relationships",
    "meaning": "xây dựng các mối quan hệ"
  },
  {
    "id": "struct-188",
    "structure": "carry on",
    "meaning": "tiếp tục"
  },
  {
    "id": "struct-189",
    "structure": "catch on",
    "meaning": "trở nên phổ biến"
  },
  {
    "id": "struct-190",
    "structure": "find out",
    "meaning": "phát hiện ra, hiểu ra"
  },
  {
    "id": "struct-191",
    "structure": "get off the beaten track",
    "meaning": "đi đến những nơi hẻo lánh, ít người biết"
  },
  {
    "id": "struct-192",
    "structure": "have an effect on something",
    "meaning": "có ảnh hưởng đến cái gì"
  },
  {
    "id": "struct-193",
    "structure": "integrate something into something",
    "meaning": "kết hợp, hóa nhập cái gì vào cái gì"
  },
  {
    "id": "struct-194",
    "structure": "lift somebody out of something",
    "meaning": "giúp ai thoát khỏi điều gì"
  },
  {
    "id": "struct-195",
    "structure": "opt for something",
    "meaning": "chọn cái gì"
  },
  {
    "id": "struct-196",
    "structure": "be willing to do something",
    "meaning": "sẵn lòng làm gì"
  },
  {
    "id": "struct-197",
    "structure": "benefit from",
    "meaning": "hưởng lợi từ"
  },
  {
    "id": "struct-198",
    "structure": "drive somebody to do something",
    "meaning": "thúc đẩy ai đó làm gì"
  },
  {
    "id": "struct-199",
    "structure": "make decisions",
    "meaning": "đưa ra quyết định"
  },
  {
    "id": "struct-200",
    "structure": "tend to do something",
    "meaning": "có xu hướng làm gì"
  },
  {
    "id": "struct-1",
    "structure": "to alleviate",
    "meaning": "làm giảm, làm dịu bớt"
  },
  {
    "id": "struct-2",
    "structure": "adverse (adj)",
    "meaning": "bất lợi, có hại"
  },
  {
    "id": "struct-3",
    "structure": "to advocate",
    "meaning": "ủng hộ, biện hộ cho"
  },
  {
    "id": "struct-4",
    "structure": "ambiguous (adj)",
    "meaning": "mơ hồ, không rõ ràng"
  },
  {
    "id": "struct-5",
    "structure": "apprehensive (adj)",
    "meaning": "lo lắng, e sợ"
  },
  {
    "id": "struct-6",
    "structure": "arduous (adj)",
    "meaning": "khó khăn, gian khổ"
  },
  {
    "id": "struct-7",
    "structure": "assertive (adj)",
    "meaning": "quả quyết, quyết đoán"
  },
  {
    "id": "struct-8",
    "structure": "benevolent (adj)",
    "meaning": "nhân từ, tốt bụng"
  },
  {
    "id": "struct-9",
    "structure": "coherent (adj)",
    "meaning": "mạch lạc, rõ ràng"
  },
  {
    "id": "struct-10",
    "structure": "comprehensive (adj)",
    "meaning": "toàn diện, đầy đủ"
  },
  {
    "id": "struct-11",
    "structure": "to contemplate",
    "meaning": "suy ngẫm, cân nhắc"
  },
  {
    "id": "struct-12",
    "structure": "to convey",
    "meaning": "truyền đạt, biểu đạt"
  },
  {
    "id": "struct-13",
    "structure": "credible (adj)",
    "meaning": "đáng tin cậy"
  },
  {
    "id": "struct-14",
    "structure": "crucial (adj)",
    "meaning": "then chốt, quan trọng"
  },
  {
    "id": "struct-15",
    "structure": "cynical (adj)",
    "meaning": "hoài nghi, hay chỉ trích"
  },
  {
    "id": "struct-16",
    "structure": "detrimental (adj)",
    "meaning": "có hại, bất lợi"
  },
  {
    "id": "struct-17",
    "structure": "diligent (adj)",
    "meaning": "siêng năng, cần cù"
  },
  {
    "id": "struct-18",
    "structure": "discrepancy (n)",
    "meaning": "sự khác biệt, chênh lệch"
  },
  {
    "id": "struct-19",
    "structure": "to disperse",
    "meaning": "giải tán, phân tán"
  },
  {
    "id": "struct-20",
    "structure": "to diverge",
    "meaning": "tách ra, khác nhau"
  },
  {
    "id": "struct-21",
    "structure": "to elaborate",
    "meaning": "giải thích chi tiết"
  },
  {
    "id": "struct-22",
    "structure": "eloquent (adj)",
    "meaning": "có tài hùng biện, thuyết phục"
  },
  {
    "id": "struct-23",
    "structure": "to emphasize",
    "meaning": "nhấn mạnh"
  },
  {
    "id": "struct-24",
    "structure": "to endeavor",
    "meaning": "nỗ lực, cố gắng"
  },
  {
    "id": "struct-25",
    "structure": "engrossed (adj)",
    "meaning": "bị cuốn hút, mải mê"
  },
  {
    "id": "struct-26",
    "structure": "to entail",
    "meaning": "đòi hỏi, bao gồm"
  },
  {
    "id": "struct-27",
    "structure": "equivalent (adj/n)",
    "meaning": "tương đương"
  },
  {
    "id": "struct-28",
    "structure": "to eradicate",
    "meaning": "xóa bỏ, diệt trừ"
  },
  {
    "id": "struct-29",
    "structure": "erratic (adj)",
    "meaning": "thất thường, không ổn định"
  },
  {
    "id": "struct-30",
    "structure": "excessive (adj)",
    "meaning": "quá mức, thái quá"
  },
  {
    "id": "struct-31",
    "structure": "feasible (adj)",
    "meaning": "khả thi, có thể thực hiện"
  },
  {
    "id": "struct-32",
    "structure": "formidable (adj)",
    "meaning": "ghê gớm, đáng gờm"
  },
  {
    "id": "struct-33",
    "structure": "frivolous (adj)",
    "meaning": "phù phiếm, nhẹ dạ"
  },
  {
    "id": "struct-34",
    "structure": "to gratify",
    "meaning": "làm hài lòng"
  },
  {
    "id": "struct-35",
    "structure": "hostile (adj)",
    "meaning": "thù địch, chống đối"
  },
  {
    "id": "struct-36",
    "structure": "imminent (adj)",
    "meaning": "sắp xảy ra, cận kề"
  },
  {
    "id": "struct-37",
    "structure": "impartial (adj)",
    "meaning": "công bằng, vô tư"
  },
  {
    "id": "struct-38",
    "structure": "imperative (adj)",
    "meaning": "cấp bách, bắt buộc"
  },
  {
    "id": "struct-39",
    "structure": "impulsive (adj)",
    "meaning": "bốc đồng, thiếu suy nghĩ"
  },
  {
    "id": "struct-40",
    "structure": "incessant (adj)",
    "meaning": "không ngừng, liên miên"
  },
  {
    "id": "struct-41",
    "structure": "to inhibit",
    "meaning": "ngăn chặn, kiềm chế"
  },
  {
    "id": "struct-42",
    "structure": "integrity (n)",
    "meaning": "sự trung thực, liêm chính"
  },
  {
    "id": "struct-43",
    "structure": "intricate (adj)",
    "meaning": "phức tạp, rắc rối"
  },
  {
    "id": "struct-44",
    "structure": "lucrative (adj)",
    "meaning": "sinh lợi, béo bở"
  },
  {
    "id": "struct-45",
    "structure": "meticulous (adj)",
    "meaning": "tỉ mỉ, kỹ lưỡng"
  },
  {
    "id": "struct-46",
    "structure": "notorious (adj)",
    "meaning": "khét tiếng (tiêu cực)"
  },
  {
    "id": "struct-47",
    "structure": "oblivious (adj)",
    "meaning": "không nhận ra, lơ đãng"
  },
  {
    "id": "struct-48",
    "structure": "plausible (adj)",
    "meaning": "hợp lý, đáng tin"
  },
  {
    "id": "struct-49",
    "structure": "pragmatic (adj)",
    "meaning": "thực tế, thực dụng"
  },
  {
    "id": "struct-50",
    "structure": "resilient (adj)",
    "meaning": "kiên cường, phục hồi nhanh"
  },
  {
    "id": "struct-51",
    "structure": "to scrutinize",
    "meaning": "xem xét kỹ lưỡng"
  },
  {
    "id": "struct-52",
    "structure": "to substantiate",
    "meaning": "chứng minh, xác thực"
  },
  {
    "id": "struct-53",
    "structure": "succinct (adj)",
    "meaning": "ngắn gọn, súc tích"
  },
  {
    "id": "struct-54",
    "structure": "tedious (adj)",
    "meaning": "tẻ nhạt, chán ngắt"
  },
  {
    "id": "struct-55",
    "structure": "tranquil (adj)",
    "meaning": "yên bình, thanh bình"
  },
  {
    "id": "struct-56",
    "structure": "to undermine",
    "meaning": "làm suy yếu, phá hoại"
  },
  {
    "id": "struct-57",
    "structure": "versatile (adj)",
    "meaning": "linh hoạt, đa năng"
  },
  {
    "id": "struct-58",
    "structure": "viable (adj)",
    "meaning": "khả thi, có thể thực hiện"
  },
  {
    "id": "struct-59",
    "structure": "vivid (adj)",
    "meaning": "sinh động, rõ ràng"
  },
  {
    "id": "struct-60",
    "structure": "vulnerable (adj)",
    "meaning": "dễ bị tổn thương"
  },
  {
    "id": "struct-61",
    "structure": "allegedly (adv)",
    "meaning": "được cho là, cáo buộc là"
  },
  {
    "id": "struct-62",
    "structure": "antagonist (n)",
    "meaning": "kẻ đối địch, đối thủ"
  },
  {
    "id": "struct-63",
    "structure": "to appease",
    "meaning": "xoa dịu, làm nguôi giận"
  },
  {
    "id": "struct-64",
    "structure": "to boast",
    "meaning": "khoe khoang, tự hào (về)"
  },
  {
    "id": "struct-65",
    "structure": "burgeoning (adj)",
    "meaning": "phát triển nhanh chóng"
  },
  {
    "id": "struct-66",
    "structure": "to coincide",
    "meaning": "trùng hợp, xảy ra cùng lúc"
  },
  {
    "id": "struct-67",
    "structure": "to collaborate",
    "meaning": "hợp tác, cộng tác"
  },
  {
    "id": "struct-68",
    "structure": "complacent (adj)",
    "meaning": "tự mãn, thỏa mãn với bản thân"
  },
  {
    "id": "struct-69",
    "structure": "to condone",
    "meaning": "bỏ qua, tha thứ"
  },
  {
    "id": "struct-70",
    "structure": "consecutive (adj)",
    "meaning": "liên tiếp, nối tiếp"
  },
  {
    "id": "struct-71",
    "structure": "conspicuous (adj)",
    "meaning": "dễ thấy, nổi bật"
  },
  {
    "id": "struct-72",
    "structure": "to contemplate",
    "meaning": "suy ngẫm, dự định"
  },
  {
    "id": "struct-73",
    "structure": "credible (adj)",
    "meaning": "đáng tin cậy"
  },
  {
    "id": "struct-74",
    "structure": "to culminate",
    "meaning": "đạt đến đỉnh điểm"
  },
  {
    "id": "struct-75",
    "structure": "deficit (n)",
    "meaning": "sự thiếu hụt"
  },
  {
    "id": "struct-76",
    "structure": "to deplete",
    "meaning": "làm cạn kiệt"
  },
  {
    "id": "struct-77",
    "structure": "to derive (from)",
    "meaning": "bắt nguồn từ"
  },
  {
    "id": "struct-78",
    "structure": "to detract (from)",
    "meaning": "làm giảm giá trị"
  },
  {
    "id": "struct-79",
    "structure": "to diminish",
    "meaning": "giảm bớt, thu nhỏ"
  },
  {
    "id": "struct-80",
    "structure": "to discern",
    "meaning": "nhận ra, phân biệt"
  },
  {
    "id": "struct-81",
    "structure": "to disregard",
    "meaning": "phớt lờ, coi thường"
  },
  {
    "id": "struct-82",
    "structure": "eloquence (n)",
    "meaning": "tài hùng biện"
  },
  {
    "id": "struct-83",
    "structure": "to emerge",
    "meaning": "xuất hiện, nổi lên"
  },
  {
    "id": "struct-84",
    "structure": "to endeavor",
    "meaning": "nỗ lực, cố gắng"
  },
  {
    "id": "struct-85",
    "structure": "enthralled (adj)",
    "meaning": "bị mê hoặc, cuốn hút"
  },
  {
    "id": "struct-86",
    "structure": "epitome (n)",
    "meaning": "hình mẫu, ví dụ hoàn hảo"
  },
  {
    "id": "struct-87",
    "structure": "erroneous (adj)",
    "meaning": "sai lầm, không chính xác"
  },
  {
    "id": "struct-88",
    "structure": "to exemplify",
    "meaning": "minh họa, làm ví dụ cho"
  },
  {
    "id": "struct-89",
    "structure": "exorbitant (adj)",
    "meaning": "(giá cả) quá cao"
  },
  {
    "id": "struct-90",
    "structure": "to facilitate",
    "meaning": "tạo điều kiện, giúp đỡ"
  },
  {
    "id": "struct-91",
    "structure": "futile (adj)",
    "meaning": "vô ích, không hiệu quả"
  },
  {
    "id": "struct-92",
    "structure": "to hinder",
    "meaning": "cản trở, gây trở ngại"
  },
  {
    "id": "struct-93",
    "structure": "hypothetical (adj)",
    "meaning": "giả định, mang tính giả thuyết"
  },
  {
    "id": "struct-94",
    "structure": "illicit (adj)",
    "meaning": "bất hợp pháp"
  },
  {
    "id": "struct-95",
    "structure": "impeccable (adj)",
    "meaning": "hoàn hảo, không chê vào đâu"
  },
  {
    "id": "struct-96",
    "structure": "inadvertent (adj)",
    "meaning": "vô tình, không cố ý"
  },
  {
    "id": "struct-97",
    "structure": "incessantly (adv)",
    "meaning": "không ngừng, liên tục"
  },
  {
    "id": "struct-98",
    "structure": "inherent (adj)",
    "meaning": "vốn có, cố hữu"
  },
  {
    "id": "struct-99",
    "structure": "intact (adj)",
    "meaning": "nguyên vẹn, không bị hư hại"
  },
  {
    "id": "struct-100",
    "structure": "intrinsic (adj)",
    "meaning": "thuộc bản chất, bên trong"
  },
  {
    "id": "struct-101",
    "structure": "to invoke",
    "meaning": "viện dẫn, cầu khẩn"
  },
  {
    "id": "struct-102",
    "structure": "to jeopardize",
    "meaning": "gây nguy hiểm, đe dọa"
  },
  {
    "id": "struct-103",
    "structure": "lucrative (adj)",
    "meaning": "sinh lời, béo bở"
  },
  {
    "id": "struct-104",
    "structure": "mandatory (adj)",
    "meaning": "bắt buộc"
  },
  {
    "id": "struct-105",
    "structure": "metaphor (n)",
    "meaning": "phép ẩn dụ"
  },
  {
    "id": "struct-106",
    "structure": "to mitigate",
    "meaning": "giảm nhẹ, làm dịu"
  },
  {
    "id": "struct-107",
    "structure": "momentum (n)",
    "meaning": "đà, động lực"
  },
  {
    "id": "struct-108",
    "structure": "mundane (adj)",
    "meaning": "bình thường, tẻ nhạt"
  },
  {
    "id": "struct-109",
    "structure": "negligent (adj)",
    "meaning": "cẩu thả, lơ đãng"
  },
  {
    "id": "struct-110",
    "structure": "notion (n)",
    "meaning": "quan niệm, ý niệm"
  },
  {
    "id": "struct-111",
    "structure": "obscure (adj)",
    "meaning": "mơ hồ, khó hiểu"
  },
  {
    "id": "struct-112",
    "structure": "obsolete (adj)",
    "meaning": "lỗi thời, không còn dùng"
  },
  {
    "id": "struct-113",
    "structure": "omission (n)",
    "meaning": "sự bỏ sót, thiếu sót"
  },
  {
    "id": "struct-114",
    "structure": "onerous (adj)",
    "meaning": "nặng nề, khó nhọc"
  },
  {
    "id": "struct-115",
    "structure": "to perceive",
    "meaning": "nhận thức, cảm nhận"
  },
  {
    "id": "struct-116",
    "structure": "peril (n)",
    "meaning": "nguy hiểm, rủi ro"
  },
  {
    "id": "struct-117",
    "structure": "pervasive (adj)",
    "meaning": "lan rộng, phổ biến"
  },
  {
    "id": "struct-118",
    "structure": "plight (n)",
    "meaning": "hoàn cảnh khó khăn"
  },
  {
    "id": "struct-119",
    "structure": "precise (adj)",
    "meaning": "chính xác"
  },
  {
    "id": "struct-120",
    "structure": "predominant (adj)",
    "meaning": "chiếm ưu thế, nổi bật"
  },
  {
    "id": "struct-121",
    "structure": "prevalent (adj)",
    "meaning": "phổ biến, thịnh hành"
  },
  {
    "id": "struct-122",
    "structure": "profound (adj)",
    "meaning": "sâu sắc"
  },
  {
    "id": "struct-123",
    "structure": "prolific (adj)",
    "meaning": "năng suất cao, sáng tạo"
  },
  {
    "id": "struct-124",
    "structure": "to prompt",
    "meaning": "thúc đẩy, khiến cho"
  },
  {
    "id": "struct-125",
    "structure": "prone (to) (adj)",
    "meaning": "dễ bị, có khuynh hướng"
  },
  {
    "id": "struct-126",
    "structure": "prosperous (adj)",
    "meaning": "thịnh vượng, phát đạt"
  },
  {
    "id": "struct-127",
    "structure": "to provoke",
    "meaning": "khiêu khích, kích động"
  },
  {
    "id": "struct-128",
    "structure": "prudent (adj)",
    "meaning": "thận trọng, khôn ngoan"
  },
  {
    "id": "struct-129",
    "structure": "to pursue",
    "meaning": "theo đuổi"
  },
  {
    "id": "struct-130",
    "structure": "rational (adj)",
    "meaning": "hợp lý, có lý trí"
  },
  {
    "id": "struct-131",
    "structure": "to reconcile",
    "meaning": "hòa giải, dung hòa"
  },
  {
    "id": "struct-132",
    "structure": "redundant (adj)",
    "meaning": "dư thừa"
  },
  {
    "id": "struct-133",
    "structure": "to refute",
    "meaning": "bác bỏ, phủ nhận"
  },
  {
    "id": "struct-134",
    "structure": "to reiterate",
    "meaning": "nhắc lại, lặp lại"
  },
  {
    "id": "struct-135",
    "structure": "to relinquish",
    "meaning": "từ bỏ, nhượng lại"
  },
  {
    "id": "struct-136",
    "structure": "reminiscent (adj)",
    "meaning": "gợi nhớ, làm nhớ lại"
  },
  {
    "id": "struct-137",
    "structure": "resolute (adj)",
    "meaning": "kiên quyết, cứng rắn"
  },
  {
    "id": "struct-138",
    "structure": "to retaliate",
    "meaning": "trả đũa, trả thù"
  },
  {
    "id": "struct-139",
    "structure": "to revere",
    "meaning": "tôn kính, kính trọng"
  },
  {
    "id": "struct-140",
    "structure": "rigorous (adj)",
    "meaning": "nghiêm ngặt, khắt khe"
  },
  {
    "id": "struct-141",
    "structure": "scrupulous (adj)",
    "meaning": "cẩn trọng, trung thực"
  },
  {
    "id": "struct-142",
    "structure": "skeptical (adj)",
    "meaning": "hoài nghi, nghi ngờ"
  },
  {
    "id": "struct-143",
    "structure": "to speculate",
    "meaning": "suy đoán, phỏng đoán"
  },
  {
    "id": "struct-144",
    "structure": "spontaneous (adj)",
    "meaning": "tự phát, tự nhiên"
  },
  {
    "id": "struct-145",
    "structure": "subtle (adj)",
    "meaning": "tinh tế, khéo léo"
  },
  {
    "id": "struct-146",
    "structure": "superficial (adj)",
    "meaning": "hời hợt, bề ngoài"
  },
  {
    "id": "struct-147",
    "structure": "to surpass",
    "meaning": "vượt trội, vượt qua"
  },
  {
    "id": "struct-148",
    "structure": "susceptible (adj)",
    "meaning": "dễ bị ảnh hưởng"
  },
  {
    "id": "struct-149",
    "structure": "to sustain",
    "meaning": "duy trì, chống đỡ"
  },
  {
    "id": "struct-150",
    "structure": "tangible (adj)",
    "meaning": "hữu hình, rõ ràng"
  },
  {
    "id": "struct-151",
    "structure": "to terminate",
    "meaning": "chấm dứt, kết thúc"
  },
  {
    "id": "struct-152",
    "structure": "to thrive",
    "meaning": "phát triển mạnh mẽ"
  },
  {
    "id": "struct-153",
    "structure": "transient (adj)",
    "meaning": "thoáng qua, tạm thời"
  },
  {
    "id": "struct-154",
    "structure": "transparent (adj)",
    "meaning": "minh bạch, rõ ràng"
  },
  {
    "id": "struct-155",
    "structure": "turbulent (adj)",
    "meaning": "hỗn loạn, biến động"
  },
  {
    "id": "struct-156",
    "structure": "undeniable (adj)",
    "meaning": "không thể phủ nhận"
  },
  {
    "id": "struct-157",
    "structure": "unprecedented (adj)",
    "meaning": "chưa từng có"
  },
  {
    "id": "struct-158",
    "structure": "to violate",
    "meaning": "vi phạm"
  },
  {
    "id": "struct-159",
    "structure": "vividly (adv)",
    "meaning": "một cách sinh động, rõ ràng"
  },
  {
    "id": "struct-160",
    "structure": "to warrant",
    "meaning": "đảm bảo, biện minh cho"
  },
  {
    "id": "struct-161",
    "structure": "to withdraw",
    "meaning": "rút lui, rút lại"
  },
  {
    "id": "struct-162",
    "structure": "to withstand",
    "meaning": "chịu đựng, chống lại"
  },
  {
    "id": "struct-163",
    "structure": "widespread (adj)",
    "meaning": "lan rộng, phổ biến"
  },
  {
    "id": "struct-164",
    "structure": "to abide by",
    "meaning": "tuân thủ"
  },
  {
    "id": "struct-165",
    "structure": "to accelerate",
    "meaning": "tăng tốc"
  },
  {
    "id": "struct-166",
    "structure": "to acclaim",
    "meaning": "hoan nghênh, ca ngợi"
  },
  {
    "id": "struct-167",
    "structure": "to acquire",
    "meaning": "đạt được, thu được"
  },
  {
    "id": "struct-168",
    "structure": "to adhere (to)",
    "meaning": "dính vào, tuân theo"
  },
  {
    "id": "struct-169",
    "structure": "affluent (adj)",
    "meaning": "giàu có, sung túc"
  },
  {
    "id": "struct-170",
    "structure": "to allocate",
    "meaning": "phân bố, chỉ định"
  },
  {
    "id": "struct-171",
    "structure": "to amplify",
    "meaning": "khuếch đại, mở rộng"
  },
  {
    "id": "struct-172",
    "structure": "anecdote (n)",
    "meaning": "giai thoại, chuyện kể"
  },
  {
    "id": "struct-173",
    "structure": "arbitrary (adj)",
    "meaning": "tùy tiện, không có căn cứ"
  },
  {
    "id": "struct-174",
    "structure": "assertion (n)",
    "meaning": "sự khẳng định"
  },
  {
    "id": "struct-175",
    "structure": "to attain",
    "meaning": "đạt được"
  },
  {
    "id": "struct-176",
    "structure": "authentic (adj)",
    "meaning": "thật, xác thực"
  },
  {
    "id": "struct-177",
    "structure": "belligerent (adj)",
    "meaning": "hiếu chiến, thù địch"
  },
  {
    "id": "struct-178",
    "structure": "bizarre (adj)",
    "meaning": "kỳ lạ, dị thường"
  },
  {
    "id": "struct-179",
    "structure": "to breach",
    "meaning": "vi phạm, phá vỡ"
  },
  {
    "id": "struct-180",
    "structure": "candid (adj)",
    "meaning": "thẳng thắn, trung thực"
  },
  {
    "id": "struct-181",
    "structure": "coincidence (n)",
    "meaning": "sự trùng hợp"
  },
  {
    "id": "struct-182",
    "structure": "to collide",
    "meaning": "va chạm, xung đột"
  },
  {
    "id": "struct-183",
    "structure": "complacency (n)",
    "meaning": "sự tự mãn"
  },
  {
    "id": "struct-184",
    "structure": "to comprise",
    "meaning": "bao gồm, chứa đựng"
  },
  {
    "id": "struct-185",
    "structure": "to conceive (of)",
    "meaning": "hình dung, tưởng tượng"
  },
  {
    "id": "struct-186",
    "structure": "to condense",
    "meaning": "cô động, rút gọn"
  },
  {
    "id": "struct-187",
    "structure": "to confer",
    "meaning": "trao tặng, bàn bạc"
  },
  {
    "id": "struct-188",
    "structure": "to conform (to)",
    "meaning": "tuân theo, thích nghi"
  },
  {
    "id": "struct-189",
    "structure": "to confront",
    "meaning": "đối mặt, đương đầu"
  },
  {
    "id": "struct-190",
    "structure": "to conserve",
    "meaning": "bảo tồn, giữ gìn"
  },
  {
    "id": "struct-191",
    "structure": "to contemplate",
    "meaning": "suy ngẫm, dự định"
  },
  {
    "id": "struct-192",
    "structure": "to contradict",
    "meaning": "mâu thuẫn, phủ nhận"
  },
  {
    "id": "struct-193",
    "structure": "to convey",
    "meaning": "truyền đạt, bày tỏ"
  },
  {
    "id": "struct-194",
    "structure": "to correspond (to/with)",
    "meaning": "tương ứng, phù hợp"
  },
  {
    "id": "struct-195",
    "structure": "credible (adj)",
    "meaning": "đáng tin cậy"
  },
  {
    "id": "struct-196",
    "structure": "culpable (adj)",
    "meaning": "có tội, đáng khiển trách"
  },
  {
    "id": "struct-197",
    "structure": "to curtail",
    "meaning": "cắt giảm, hạn chế"
  },
  {
    "id": "struct-198",
    "structure": "to decipher",
    "meaning": "giải mã, hiểu được"
  },
  {
    "id": "struct-199",
    "structure": "to defy",
    "meaning": "thách thức, chống đối"
  },
  {
    "id": "struct-200",
    "structure": "to denounce",
    "meaning": "tố cáo, lên án"
  },
  {
    "id": "struct-201",
    "structure": "to depict",
    "meaning": "mô tả, khắc họa"
  },
  {
    "id": "struct-202",
    "structure": "to deter",
    "meaning": "ngăn cản, răn đe"
  },
  {
    "id": "struct-203",
    "structure": "to detract (from)",
    "meaning": "làm giảm giá trị, uy tín"
  },
  {
    "id": "struct-204",
    "structure": "to devise",
    "meaning": "phát minh, nghĩ ra"
  },
  {
    "id": "struct-205",
    "structure": "to diminish",
    "meaning": "giảm bớt, thu nhỏ"
  },
  {
    "id": "struct-206",
    "structure": "to disclose",
    "meaning": "tiết lộ, để lộ ra"
  },
  {
    "id": "struct-207",
    "structure": "discretion (n)",
    "meaning": "sự thận trọng, kín đáo"
  },
  {
    "id": "struct-208",
    "structure": "to disperse",
    "meaning": "giải tán, phân tán"
  },
  {
    "id": "struct-209",
    "structure": "to disrupt",
    "meaning": "làm gián đoạn, phá vỡ"
  },
  {
    "id": "struct-210",
    "structure": "to diverge",
    "meaning": "khác nhau, rẽ ra"
  },
  {
    "id": "struct-211",
    "structure": "dubious (adj)",
    "meaning": "nghi ngờ, không chắc chắn"
  },
  {
    "id": "struct-212",
    "structure": "to elicit",
    "meaning": "khơi gợi, gợi ra"
  },
  {
    "id": "struct-213",
    "structure": "to elude",
    "meaning": "né tránh, thoát khỏi"
  },
  {
    "id": "struct-214",
    "structure": "to emerge",
    "meaning": "xuất hiện, nổi lên"
  },
  {
    "id": "struct-215",
    "structure": "empirical (adj)",
    "meaning": "dựa trên kinh nghiệm, thực nghiệm"
  },
  {
    "id": "struct-216",
    "structure": "to endure",
    "meaning": "chịu đựng, kéo dài"
  },
  {
    "id": "struct-217",
    "structure": "to enhance",
    "meaning": "nâng cao, cải thiện"
  },
  {
    "id": "struct-218",
    "structure": "to enrich",
    "meaning": "làm giàu, làm phong phú"
  },
  {
    "id": "struct-219",
    "structure": "to entail",
    "meaning": "đòi hỏi, bao gồm"
  },
  {
    "id": "struct-220",
    "structure": "to entice",
    "meaning": "dụ dỗ, thu hút"
  },
  {
    "id": "struct-221",
    "structure": "equilibrium (n)",
    "meaning": "trạng thái cân bằng"
  },
  {
    "id": "struct-222",
    "structure": "to eradicate",
    "meaning": "xóa bỏ, diệt trừ"
  },
  {
    "id": "struct-223",
    "structure": "to escalate",
    "meaning": "leo thang, tăng lên"
  },
  {
    "id": "struct-224",
    "structure": "to evaluate",
    "meaning": "đánh giá, ước lượng"
  },
  {
    "id": "struct-225",
    "structure": "to evoke",
    "meaning": "gợi lên (cảm xúc, ký ức)"
  },
  {
    "id": "struct-226",
    "structure": "to exceed",
    "meaning": "vượt quá"
  },
  {
    "id": "struct-227",
    "structure": "exemplary (adj)",
    "meaning": "gương mẫu, kiểu mẫu"
  },
  {
    "id": "struct-228",
    "structure": "to exert",
    "meaning": "sử dụng, áp dụng (sức lực, quyền lực)"
  },
  {
    "id": "struct-229",
    "structure": "explicit (adj)",
    "meaning": "rõ ràng, minh bạch"
  },
  {
    "id": "struct-230",
    "structure": "feasible (adj)",
    "meaning": "khả thi"
  },
  {
    "id": "struct-231",
    "structure": "to fluctuate",
    "meaning": "dao động, biến động"
  },
  {
    "id": "struct-232",
    "structure": "to formulate",
    "meaning": "xây dựng, đề ra"
  },
  {
    "id": "struct-233",
    "structure": "to fortify",
    "meaning": "củng cố, làm mạnh thêm"
  },
  {
    "id": "struct-234",
    "structure": "to foster",
    "meaning": "thúc đẩy, nuôi dưỡng"
  },
  {
    "id": "struct-235",
    "structure": "friction (n)",
    "meaning": "xung đột, ma sát"
  },
  {
    "id": "struct-236",
    "structure": "fundamental (adj)",
    "meaning": "cơ bản, thiết yếu"
  },
  {
    "id": "struct-237",
    "structure": "to gratify",
    "meaning": "làm hài lòng, thỏa mãn"
  },
  {
    "id": "struct-238",
    "structure": "grievance (n)",
    "meaning": "lời phàn nàn, bất bình"
  },
  {
    "id": "struct-239",
    "structure": "to hamper",
    "meaning": "cản trở, gây khó khăn"
  },
  {
    "id": "struct-240",
    "structure": "harsh (adj)",
    "meaning": "khắc nghiệt, gay gắt"
  },
  {
    "id": "struct-241",
    "structure": "to heed",
    "meaning": "chú ý, lưu tâm"
  },
  {
    "id": "struct-242",
    "structure": "hindrance (n)",
    "meaning": "sự cản trở"
  },
  {
    "id": "struct-243",
    "structure": "to illustrate",
    "meaning": "minh họa, làm rõ"
  },
  {
    "id": "struct-244",
    "structure": "to immerse",
    "meaning": "đắm chìm, hòa mình vào"
  },
  {
    "id": "struct-245",
    "structure": "to impair",
    "meaning": "làm suy yếu, tổn hại"
  },
  {
    "id": "struct-246",
    "structure": "to impose",
    "meaning": "áp đặt"
  },
  {
    "id": "struct-247",
    "structure": "incentive (n)",
    "meaning": "động lực, khuyến khích"
  },
  {
    "id": "struct-248",
    "structure": "to incorporate",
    "meaning": "kết hợp, bao gồm"
  },
  {
    "id": "struct-249",
    "structure": "inevitable (adj)",
    "meaning": "không thể tránh khỏi"
  },
  {
    "id": "struct-250",
    "structure": "to infer",
    "meaning": "suy ra, kết luận"
  },
  {
    "id": "struct-251",
    "structure": "ingenious (adj)",
    "meaning": "khéo léo, thông minh sáng tạo"
  },
  {
    "id": "struct-252",
    "structure": "to inhibit",
    "meaning": "ngăn chặn, kiểm chế"
  },
  {
    "id": "struct-253",
    "structure": "initiative (n)",
    "meaning": "sáng kiến, sự chủ động"
  },
  {
    "id": "struct-254",
    "structure": "innovative (adj)",
    "meaning": "đổi mới, sáng tạo"
  },
  {
    "id": "struct-255",
    "structure": "insightful (adj)",
    "meaning": "sâu sắc, sáng suốt"
  },
  {
    "id": "struct-256",
    "structure": "to integrate",
    "meaning": "hội nhập, kết hợp"
  },
  {
    "id": "struct-257",
    "structure": "integrity (n)",
    "meaning": "tính trung thực, chính trực"
  },
  {
    "id": "struct-258",
    "structure": "to intimidate",
    "meaning": "dọa dẫm, hăm dọa"
  },
  {
    "id": "struct-259",
    "structure": "intricate (adj)",
    "meaning": "phức tạp, rắc rối"
  },
  {
    "id": "struct-260",
    "structure": "to intrude",
    "meaning": "xâm phạm, chen vào"
  },
  {
    "id": "struct-261",
    "structure": "irrelevant (adj)",
    "meaning": "không liên quan, không thích hợp"
  },
  {
    "id": "struct-262",
    "structure": "legitimate (adj)",
    "meaning": "hợp pháp, chính đáng"
  },
  {
    "id": "struct-263",
    "structure": "lenient (adj)",
    "meaning": "khoan dung, nhân hậu"
  },
  {
    "id": "struct-264",
    "structure": "liability (n)",
    "meaning": "trách nhiệm pháp lý"
  },
  {
    "id": "struct-265",
    "structure": "linguistic (adj)",
    "meaning": "thuộc ngôn ngữ học"
  },
  {
    "id": "struct-266",
    "structure": "lucid (adj)",
    "meaning": "rõ ràng, dễ hiểu"
  },
  {
    "id": "struct-267",
    "structure": "to magnify",
    "meaning": "phóng đại, làm to ra"
  },
  {
    "id": "struct-268",
    "structure": "mandatory (adj)",
    "meaning": "bắt buộc, bắt phải làm"
  },
  {
    "id": "struct-269",
    "structure": "meticulous (adj)",
    "meaning": "tỉ mỉ, kỹ lưỡng"
  },
  {
    "id": "struct-270",
    "structure": "to mimic",
    "meaning": "bắt chước, nhại lại"
  },
  {
    "id": "struct-271",
    "structure": "notorious (adj)",
    "meaning": "khét tiếng (tiêu cực)"
  },
  {
    "id": "struct-272",
    "structure": "oblivious (adj)",
    "meaning": "không nhận ra, lơ đãng"
  },
  {
    "id": "struct-273",
    "structure": "obsolete (adj)",
    "meaning": "lỗi thời, lạc hậu"
  },
  {
    "id": "struct-274",
    "structure": "ominous (adj)",
    "meaning": "điềm gở, báo hiệu xấu"
  },
  {
    "id": "struct-275",
    "structure": "outlandish (adj)",
    "meaning": "kỳ quặc, lạ thường"
  },
  {
    "id": "struct-276",
    "structure": "to overwhelm",
    "meaning": "áp đảo, tràn ngập"
  },
  {
    "id": "struct-277",
    "structure": "paradox (n)",
    "meaning": "nghịch lý"
  },
  {
    "id": "struct-278",
    "structure": "perceivable (adj)",
    "meaning": "có thể nhận thấy được"
  },
  {
    "id": "struct-279",
    "structure": "perplexed (adj)",
    "meaning": "bối rối, lúng túng"
  },
  {
    "id": "struct-280",
    "structure": "pertinent (adj)",
    "meaning": "thích hợp, có liên quan"
  },
  {
    "id": "struct-281",
    "structure": "pivotal (adj)",
    "meaning": "then chốt, quan trọng"
  },
  {
    "id": "struct-282",
    "structure": "plausible (adj)",
    "meaning": "hợp lý, đáng tin"
  },
  {
    "id": "struct-283",
    "structure": "to postulate",
    "meaning": "giả định, cho rằng"
  },
  {
    "id": "struct-284",
    "structure": "precaution (n)",
    "meaning": "biện pháp phòng ngừa"
  },
  {
    "id": "struct-285",
    "structure": "predicament (n)",
    "meaning": "tình huống khó xử"
  },
  {
    "id": "struct-286",
    "structure": "preliminary (adj)",
    "meaning": "sơ bộ, ban đầu"
  },
  {
    "id": "struct-287",
    "structure": "to presume",
    "meaning": "cho là, đoán là"
  },
  {
    "id": "struct-288",
    "structure": "to prevail",
    "meaning": "chiếm ưu thế, thắng thế"
  },
  {
    "id": "struct-289",
    "structure": "profoundly (adv)",
    "meaning": "sâu sắc, mạnh mẽ"
  },
  {
    "id": "struct-290",
    "structure": "to prolong",
    "meaning": "kéo dài, gia hạn"
  },
  {
    "id": "struct-291",
    "structure": "prominent (adj)",
    "meaning": "nổi bật, quan trọng"
  },
  {
    "id": "struct-292",
    "structure": "prospect (n)",
    "meaning": "triển vọng, khả năng"
  },
  {
    "id": "struct-293",
    "structure": "to provoke",
    "meaning": "khiêu khích, kích động"
  },
  {
    "id": "struct-294",
    "structure": "rationale (n)",
    "meaning": "lý do căn bản"
  },
  {
    "id": "struct-295",
    "structure": "to recur",
    "meaning": "tái diễn, lặp lại"
  },
  {
    "id": "struct-296",
    "structure": "to reinforce",
    "meaning": "củng cố, tăng cường"
  },
  {
    "id": "struct-297",
    "structure": "reluctant (adj)",
    "meaning": "miễn cưỡng, do dự"
  },
  {
    "id": "struct-298",
    "structure": "resilient (adj)",
    "meaning": "kiên cường, phục hồi nhanh"
  },
  {
    "id": "struct-299",
    "structure": "to scrutinize",
    "meaning": "xem xét kỹ lưỡng"
  },
  {
    "id": "struct-300",
    "structure": "skeptical (adj)",
    "meaning": "hoài nghi, nghi ngờ"
  }
];

const VN_DEFAULT_PATCHES = {
  "patch-thptqg-12": {
    "id": "patch-thptqg-12",
    "name": "THPTQG 12: Bộ từ vựng C1/C2 Phân hóa 9-10 (300 từ)",
    "parentId": null,
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-1",
      "en12-2",
      "en12-3",
      "en12-4",
      "en12-5",
      "en12-6",
      "en12-7",
      "en12-8",
      "en12-9",
      "en12-10",
      "en12-11",
      "en12-12",
      "en12-13",
      "en12-14",
      "en12-15",
      "en12-16",
      "en12-17",
      "en12-18",
      "en12-19",
      "en12-20",
      "en12-21",
      "en12-22",
      "en12-23",
      "en12-24",
      "en12-25",
      "en12-26",
      "en12-27",
      "en12-28",
      "en12-29",
      "en12-30",
      "en12-31",
      "en12-32",
      "en12-33",
      "en12-34",
      "en12-35",
      "en12-36",
      "en12-37",
      "en12-38",
      "en12-39",
      "en12-40",
      "en12-41",
      "en12-42",
      "en12-43",
      "en12-44",
      "en12-45",
      "en12-46",
      "en12-47",
      "en12-48",
      "en12-49",
      "en12-50",
      "en12-51",
      "en12-52",
      "en12-53",
      "en12-54",
      "en12-55",
      "en12-56",
      "en12-57",
      "en12-58",
      "en12-59",
      "en12-60",
      "en12-61",
      "en12-62",
      "en12-63",
      "en12-64",
      "en12-65",
      "en12-66",
      "en12-67",
      "en12-68",
      "en12-69",
      "en12-70",
      "en12-71",
      "en12-72",
      "en12-73",
      "en12-74",
      "en12-75",
      "en12-76",
      "en12-77",
      "en12-78",
      "en12-79",
      "en12-80",
      "en12-81",
      "en12-82",
      "en12-83",
      "en12-84",
      "en12-85",
      "en12-86",
      "en12-87",
      "en12-88",
      "en12-89",
      "en12-90",
      "en12-91",
      "en12-92",
      "en12-93",
      "en12-94",
      "en12-95",
      "en12-96",
      "en12-97",
      "en12-98",
      "en12-99",
      "en12-100",
      "en12-101",
      "en12-102",
      "en12-103",
      "en12-104",
      "en12-105",
      "en12-106",
      "en12-107",
      "en12-108",
      "en12-109",
      "en12-110",
      "en12-111",
      "en12-112",
      "en12-113",
      "en12-114",
      "en12-115",
      "en12-116",
      "en12-117",
      "en12-118",
      "en12-119",
      "en12-120",
      "en12-121",
      "en12-122",
      "en12-123",
      "en12-124",
      "en12-125",
      "en12-126",
      "en12-127",
      "en12-128",
      "en12-129",
      "en12-130",
      "en12-131",
      "en12-132",
      "en12-133",
      "en12-134",
      "en12-135",
      "en12-136",
      "en12-137",
      "en12-138",
      "en12-139",
      "en12-140",
      "en12-141",
      "en12-142",
      "en12-143",
      "en12-144",
      "en12-145",
      "en12-146",
      "en12-147",
      "en12-148",
      "en12-149",
      "en12-150",
      "en12-151",
      "en12-152",
      "en12-153",
      "en12-154",
      "en12-155",
      "en12-156",
      "en12-157",
      "en12-158",
      "en12-159",
      "en12-160",
      "en12-161",
      "en12-162",
      "en12-163",
      "en12-164",
      "en12-165",
      "en12-166",
      "en12-167",
      "en12-168",
      "en12-169",
      "en12-170",
      "en12-171",
      "en12-172",
      "en12-173",
      "en12-174",
      "en12-175",
      "en12-176",
      "en12-177",
      "en12-178",
      "en12-179",
      "en12-180",
      "en12-181",
      "en12-182",
      "en12-183",
      "en12-184",
      "en12-185",
      "en12-186",
      "en12-187",
      "en12-188",
      "en12-189",
      "en12-190",
      "en12-191",
      "en12-192",
      "en12-193",
      "en12-194",
      "en12-195",
      "en12-196",
      "en12-197",
      "en12-198",
      "en12-199",
      "en12-200",
      "en12-201",
      "en12-202",
      "en12-203",
      "en12-204",
      "en12-205",
      "en12-206",
      "en12-207",
      "en12-208",
      "en12-209",
      "en12-210",
      "en12-211",
      "en12-212",
      "en12-213",
      "en12-214",
      "en12-215",
      "en12-216",
      "en12-217",
      "en12-218",
      "en12-219",
      "en12-220",
      "en12-221",
      "en12-222",
      "en12-223",
      "en12-224",
      "en12-225",
      "en12-226",
      "en12-227",
      "en12-228",
      "en12-229",
      "en12-230",
      "en12-231",
      "en12-232",
      "en12-233",
      "en12-234",
      "en12-235",
      "en12-236",
      "en12-237",
      "en12-238",
      "en12-239",
      "en12-240",
      "en12-241",
      "en12-242",
      "en12-243",
      "en12-244",
      "en12-245",
      "en12-246",
      "en12-247",
      "en12-248",
      "en12-249",
      "en12-250",
      "en12-251",
      "en12-252",
      "en12-253",
      "en12-254",
      "en12-255",
      "en12-256",
      "en12-257",
      "en12-258",
      "en12-259",
      "en12-260",
      "en12-261",
      "en12-262",
      "en12-263",
      "en12-264",
      "en12-265",
      "en12-266",
      "en12-267",
      "en12-268",
      "en12-269",
      "en12-270",
      "en12-271",
      "en12-272",
      "en12-273",
      "en12-274",
      "en12-275",
      "en12-276",
      "en12-277",
      "en12-278",
      "en12-279",
      "en12-280",
      "en12-281",
      "en12-282",
      "en12-283",
      "en12-284",
      "en12-285",
      "en12-286",
      "en12-287",
      "en12-288",
      "en12-289",
      "en12-290",
      "en12-291",
      "en12-292",
      "en12-293",
      "en12-294",
      "en12-295",
      "en12-296",
      "en12-297",
      "en12-298",
      "en12-299",
      "en12-300"
    ],
    "description": "Toàn bộ 300 từ vựng C1/C2 phân loại theo 7 chủ đề tư duy và biểu đạt cao cấp của đề thi THPT Quốc Gia.",
    "subPatches": [
      "patch-thptqg-12-s1",
      "patch-thptqg-12-s2",
      "patch-thptqg-12-s3",
      "patch-thptqg-12-s4",
      "patch-thptqg-12-s5",
      "patch-thptqg-12-s6",
      "patch-thptqg-12-s7"
    ],
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-thptqg-12-s1": {
    "id": "patch-thptqg-12-s1",
    "name": "Chuyên đề 1: Đánh giá & Thái độ (Judgment / Attitude)",
    "parentId": "patch-thptqg-12",
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-1",
      "en12-2",
      "en12-3",
      "en12-4",
      "en12-6",
      "en12-9",
      "en12-10",
      "en12-13",
      "en12-14",
      "en12-15",
      "en12-16",
      "en12-18",
      "en12-29",
      "en12-30",
      "en12-32",
      "en12-36",
      "en12-37",
      "en12-38",
      "en12-40",
      "en12-41",
      "en12-46",
      "en12-47",
      "en12-48",
      "en12-51",
      "en12-52",
      "en12-53",
      "en12-54",
      "en12-55",
      "en12-59",
      "en12-61",
      "en12-73",
      "en12-86",
      "en12-91",
      "en12-108",
      "en12-142",
      "en12-146",
      "en12-156",
      "en12-163",
      "en12-173",
      "en12-176",
      "en12-195",
      "en12-211",
      "en12-224",
      "en12-252",
      "en12-261",
      "en12-271",
      "en12-272",
      "en12-280",
      "en12-282",
      "en12-299",
      "en12-300"
    ],
    "description": "Các từ vựng biểu đạt thái độ, đánh giá mức độ nghiêm trọng và tính hợp lý (alleviate, adverse, advocate, ambiguous, credible, detrimental...).",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-thptqg-12-s2": {
    "id": "patch-thptqg-12-s2",
    "name": "Chuyên đề 2: Thay đổi & Ảnh hưởng (Change / Impact / Environment)",
    "parentId": "patch-thptqg-12",
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-19",
      "en12-20",
      "en12-28",
      "en12-56",
      "en12-60",
      "en12-65",
      "en12-76",
      "en12-78",
      "en12-79",
      "en12-83",
      "en12-87",
      "en12-97",
      "en12-98",
      "en12-99",
      "en12-100",
      "en12-106",
      "en12-107",
      "en12-112",
      "en12-117",
      "en12-132",
      "en12-148",
      "en12-153",
      "en12-157",
      "en12-159",
      "en12-161",
      "en12-165",
      "en12-171",
      "en12-186",
      "en12-197",
      "en12-203",
      "en12-205",
      "en12-208",
      "en12-210",
      "en12-214",
      "en12-217",
      "en12-218",
      "en12-222",
      "en12-223",
      "en12-231",
      "en12-233",
      "en12-245",
      "en12-249",
      "en12-267",
      "en12-273",
      "en12-290",
      "en12-295",
      "en12-296"
    ],
    "description": "Các từ biểu đạt sự biến đổi, tác động môi trường và xã hội (undermine, mitigate, deplete, diminish, eradicate, accelerate, amplify...).",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-thptqg-12-s3": {
    "id": "patch-thptqg-12-s3",
    "name": "Chuyên đề 3: Tư duy & Nhận thức (Cognition / Mind / Reasoning)",
    "parentId": "patch-thptqg-12",
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-11",
      "en12-12",
      "en12-21",
      "en12-22",
      "en12-23",
      "en12-72",
      "en12-77",
      "en12-80",
      "en12-82",
      "en12-88",
      "en12-93",
      "en12-105",
      "en12-110",
      "en12-111",
      "en12-115",
      "en12-119",
      "en12-122",
      "en12-130",
      "en12-133",
      "en12-143",
      "en12-145",
      "en12-154",
      "en12-174",
      "en12-185",
      "en12-191",
      "en12-192",
      "en12-193",
      "en12-194",
      "en12-198",
      "en12-201",
      "en12-212",
      "en12-215",
      "en12-225",
      "en12-229",
      "en12-243",
      "en12-250",
      "en12-255",
      "en12-265",
      "en12-266",
      "en12-277",
      "en12-278",
      "en12-283",
      "en12-287",
      "en12-289",
      "en12-294"
    ],
    "description": "Từ vựng diễn giải tư duy logic, nghiên cứu khoa học và triết luận (contemplate, elaborate, exemplify, perceive, discern, rational, refute...).",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-thptqg-12-s4": {
    "id": "patch-thptqg-12-s4",
    "name": "Chuyên đề 4: Xã hội & Kinh tế (Society / Economy / Policy)",
    "parentId": "patch-thptqg-12",
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-26",
      "en12-27",
      "en12-31",
      "en12-44",
      "en12-58",
      "en12-75",
      "en12-89",
      "en12-90",
      "en12-103",
      "en12-104",
      "en12-114",
      "en12-120",
      "en12-121",
      "en12-123",
      "en12-126",
      "en12-129",
      "en12-149",
      "en12-150",
      "en12-151",
      "en12-152",
      "en12-160",
      "en12-164",
      "en12-167",
      "en12-169",
      "en12-170",
      "en12-175",
      "en12-179",
      "en12-184",
      "en12-187",
      "en12-188",
      "en12-196",
      "en12-219",
      "en12-221",
      "en12-230",
      "en12-232",
      "en12-236",
      "en12-246",
      "en12-247",
      "en12-248",
      "en12-253",
      "en12-254",
      "en12-256",
      "en12-262",
      "en12-264",
      "en12-268",
      "en12-281",
      "en12-288",
      "en12-291",
      "en12-292"
    ],
    "description": "Từ vựng kinh tế học, thị trường lao động và chính sách phát triển (affluent, lucrative, deficit, feasible, viable, prosperous, allocate...).",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-thptqg-12-s5": {
    "id": "patch-thptqg-12-s5",
    "name": "Chuyên đề 5: Cảm xúc & Quan hệ (Emotion / Interpersonal Relations)",
    "parentId": "patch-thptqg-12",
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-5",
      "en12-25",
      "en12-34",
      "en12-35",
      "en12-50",
      "en12-62",
      "en12-63",
      "en12-64",
      "en12-71",
      "en12-85",
      "en12-116",
      "en12-118",
      "en12-127",
      "en12-131",
      "en12-136",
      "en12-138",
      "en12-139",
      "en12-155",
      "en12-166",
      "en12-172",
      "en12-177",
      "en12-178",
      "en12-181",
      "en12-182",
      "en12-189",
      "en12-220",
      "en12-237",
      "en12-238",
      "en12-240",
      "en12-258",
      "en12-260",
      "en12-274",
      "en12-275",
      "en12-276",
      "en12-279",
      "en12-285",
      "en12-293",
      "en12-297",
      "en12-298"
    ],
    "description": "Từ vựng tâm lý học, tương tác xã hội và giao tiếp đa văn hóa (hostile, appease, resilient, conspicuous, plight, reconcile, turbulent...).",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-thptqg-12-s6": {
    "id": "patch-thptqg-12-s6",
    "name": "Chuyên đề 6: Hành vi & Quy trình (Behavior / Process / Conduct)",
    "parentId": "patch-thptqg-12",
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-24",
      "en12-39",
      "en12-43",
      "en12-66",
      "en12-67",
      "en12-69",
      "en12-70",
      "en12-74",
      "en12-81",
      "en12-84",
      "en12-92",
      "en12-94",
      "en12-96",
      "en12-101",
      "en12-102",
      "en12-109",
      "en12-113",
      "en12-124",
      "en12-125",
      "en12-134",
      "en12-135",
      "en12-140",
      "en12-144",
      "en12-147",
      "en12-158",
      "en12-162",
      "en12-168",
      "en12-190",
      "en12-199",
      "en12-200",
      "en12-202",
      "en12-204",
      "en12-206",
      "en12-209",
      "en12-213",
      "en12-216",
      "en12-226",
      "en12-228",
      "en12-234",
      "en12-235",
      "en12-239",
      "en12-241",
      "en12-242",
      "en12-244",
      "en12-259",
      "en12-270",
      "en12-284",
      "en12-286"
    ],
    "description": "Các động từ và danh từ chỉ hành động tuân thủ, nỗ lực và quy chuẩn (endeavor, facilitate, hinder, illicit, inadvertent, adhere to, abide by...).",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-thptqg-12-s7": {
    "id": "patch-thptqg-12-s7",
    "name": "Chuyên đề 7: Con người & Phẩm chất (Character / Human Traits)",
    "parentId": "patch-thptqg-12",
    "category": "thptqg",
    "examTag": "thptqg",
    "wordIds": [
      "en12-7",
      "en12-8",
      "en12-17",
      "en12-33",
      "en12-42",
      "en12-45",
      "en12-49",
      "en12-57",
      "en12-68",
      "en12-95",
      "en12-128",
      "en12-137",
      "en12-141",
      "en12-180",
      "en12-183",
      "en12-207",
      "en12-227",
      "en12-251",
      "en12-257",
      "en12-263",
      "en12-269"
    ],
    "description": "Từ vựng phẩm chất đạo đức, phong cách lãnh đạo và bản lĩnh (pragmatic, assertive, benevolent, diligent, meticulous, resolute, scrupulous...).",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-vact-collocations": {
    "id": "patch-vact-collocations",
    "name": "V-ACT: 200 Cấu trúc & Cụm từ Bẫy Trắc nghiệm (ĐHQG-HCM)",
    "parentId": null,
    "category": "vact",
    "examTag": "vact",
    "wordIds": [
      "struct-1",
      "struct-2",
      "struct-3",
      "struct-4",
      "struct-5",
      "struct-6",
      "struct-7",
      "struct-8",
      "struct-9",
      "struct-10",
      "struct-11",
      "struct-12",
      "struct-13",
      "struct-14",
      "struct-15",
      "struct-16",
      "struct-17",
      "struct-18",
      "struct-19",
      "struct-20",
      "struct-21",
      "struct-22",
      "struct-23",
      "struct-24",
      "struct-25",
      "struct-26",
      "struct-27",
      "struct-28",
      "struct-29",
      "struct-30",
      "struct-31",
      "struct-32",
      "struct-33",
      "struct-34",
      "struct-35",
      "struct-36",
      "struct-37",
      "struct-38",
      "struct-39",
      "struct-40",
      "struct-41",
      "struct-42",
      "struct-43",
      "struct-44",
      "struct-45",
      "struct-46",
      "struct-47",
      "struct-48",
      "struct-49",
      "struct-50",
      "struct-51",
      "struct-52",
      "struct-53",
      "struct-54",
      "struct-55",
      "struct-56",
      "struct-57",
      "struct-58",
      "struct-59",
      "struct-60",
      "struct-61",
      "struct-62",
      "struct-63",
      "struct-64",
      "struct-65",
      "struct-66",
      "struct-67",
      "struct-68",
      "struct-69",
      "struct-70",
      "struct-71",
      "struct-72",
      "struct-73",
      "struct-74",
      "struct-75",
      "struct-76",
      "struct-77",
      "struct-78",
      "struct-79",
      "struct-80",
      "struct-81",
      "struct-82",
      "struct-83",
      "struct-84",
      "struct-85",
      "struct-86",
      "struct-87",
      "struct-88",
      "struct-89",
      "struct-90",
      "struct-91",
      "struct-92",
      "struct-93",
      "struct-94",
      "struct-95",
      "struct-96",
      "struct-97",
      "struct-98",
      "struct-99",
      "struct-100",
      "struct-101",
      "struct-102",
      "struct-103",
      "struct-104",
      "struct-105",
      "struct-106",
      "struct-107",
      "struct-108",
      "struct-109",
      "struct-110",
      "struct-111",
      "struct-112",
      "struct-149",
      "struct-150",
      "struct-151",
      "struct-152",
      "struct-153",
      "struct-154",
      "struct-155",
      "struct-156",
      "struct-157",
      "struct-158",
      "struct-159",
      "struct-160",
      "struct-161",
      "struct-162",
      "struct-163",
      "struct-164",
      "struct-165",
      "struct-166",
      "struct-167",
      "struct-168",
      "struct-169",
      "struct-170",
      "struct-171",
      "struct-172",
      "struct-173",
      "struct-174",
      "struct-175",
      "struct-176",
      "struct-177",
      "struct-178",
      "struct-179",
      "struct-180",
      "struct-181",
      "struct-182",
      "struct-183",
      "struct-184",
      "struct-185",
      "struct-186",
      "struct-187",
      "struct-188",
      "struct-189",
      "struct-190",
      "struct-191",
      "struct-192",
      "struct-193",
      "struct-194",
      "struct-195",
      "struct-196",
      "struct-197",
      "struct-198",
      "struct-199",
      "struct-200",
      "struct-1",
      "struct-2",
      "struct-3",
      "struct-4",
      "struct-5",
      "struct-6",
      "struct-7",
      "struct-8",
      "struct-9",
      "struct-10",
      "struct-11",
      "struct-12",
      "struct-13",
      "struct-14",
      "struct-15",
      "struct-16",
      "struct-17",
      "struct-18",
      "struct-19",
      "struct-20",
      "struct-21",
      "struct-22",
      "struct-23",
      "struct-24",
      "struct-25",
      "struct-26",
      "struct-27",
      "struct-28",
      "struct-29",
      "struct-30",
      "struct-31",
      "struct-32",
      "struct-33",
      "struct-34",
      "struct-35",
      "struct-36"
    ],
    "description": "Tổng hợp 200 collocations, giới từ phụ thuộc và phrasal verbs thường xuyên gài bẫy trong kỳ thi Đánh giá năng lực.",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  },
  "patch-ielts-topics": {
    "id": "patch-ielts-topics",
    "name": "IELTS Academic: Collocations Môi trường, Kinh tế Xanh & Trí tuệ Nhân tạo",
    "parentId": null,
    "category": "ielts",
    "examTag": "ielts",
    "wordIds": [
      "ielts-colloc-1",
      "ielts-colloc-2",
      "ielts-colloc-3",
      "ielts-colloc-4",
      "ielts-colloc-5",
      "ielts-colloc-6"
    ],
    "description": "Các cụm từ vựng Band 7.5 - 8.5 chuyên sâu cho chủ đề Environment, Net Zero, Generative AI và Smart Urbanisation.",
    "createdAt": 1720000000000,
    "updatedAt": 1720000000000
  }
};

const VN_DIAGNOSTIC_TEST = {
  "id": "diagnostic-placement-10m",
  "title": "Bài Kiểm tra Đoán định Năng lực 10 Phút (Diagnostic Placement Test)",
  "durationSeconds": 600,
  "description": "Khảo sát nhanh 10 câu hỏi bao quát từ vựng học thuật, ngữ pháp bẫy, suy luận diễn ngôn và logic bài đọc nhằm xác định vị trí xuất phát cho IELTS, THPTQG và V-ACT.",
  "questions": [
    {
      "id": "diag-1",
      "type": "multiple_choice",
      "category": "Vocabulary & Collocation",
      "prompt": "Environmental scientists emphasize that adopting renewable energy alone cannot completely ______ the severe consequences of global climate anomalies.",
      "options": [
        "A. elevate",
        "B. mitigate",
        "C. deteriorate",
        "D. stimulate"
      ],
      "answer": "B",
      "explanation": "'mitigate' nghĩa là giảm nhẹ mức độ nghiêm trọng, kết hợp chuẩn xác với 'the severe consequences' (hậu quả nghiêm trọng). 'elevate' (nâng cao), 'deteriorate' (làm xấu đi), 'stimulate' (kích thích).",
      "skill": "Collocation B2-C1",
      "difficulty": "intermediate"
    },
    {
      "id": "diag-2",
      "type": "multiple_choice",
      "category": "Advanced Syntax (Cleft Sentence)",
      "prompt": "______ by participating in community volunteer programs that young people cultivate a strong sense of social responsibility.",
      "options": [
        "A. It is",
        "B. What is",
        "C. There is",
        "D. That is"
      ],
      "answer": "A",
      "explanation": "Cấu trúc câu chẻ nhấn mạnh trạng ngữ chỉ cách thức: 'It is + [cụm trạng ngữ/giới từ] + that + S + V'.",
      "skill": "Cleft Sentences",
      "difficulty": "starter"
    },
    {
      "id": "diag-3",
      "type": "multiple_choice",
      "category": "Grammar (Participle Clause)",
      "prompt": "______ the experimental data multiple times, the research team finally submitted their breakthrough findings to the peer-reviewed journal.",
      "options": [
        "A. Having verified",
        "B. To verify",
        "C. Verified",
        "D. Being verified"
      ],
      "answer": "A",
      "explanation": "Mệnh đề phân từ hoàn thành 'Having + V3/ed' dùng để rút gọn mệnh đề trạng ngữ chỉ hành động chủ động đã hoàn tất trước hành động chính ('submitted').",
      "skill": "Perfect Participles",
      "difficulty": "intermediate"
    },
    {
      "id": "diag-4",
      "type": "multiple_choice",
      "category": "Confusing Words & Register",
      "prompt": "Because the witness was completely ______ in the outcome of the lawsuit, her testimony was deemed exceptionally trustworthy by the jury.",
      "options": [
        "A. uninterested",
        "B. disinterested",
        "C. unconcerned",
        "D. disillusioned"
      ],
      "answer": "B",
      "explanation": "Cặp từ dễ nhầm lẫn kinh điển: 'disinterested' nghĩa là vô tư, công tâm, không có lợi ích cá nhân liên quan (impartial/unbiased); trong khi 'uninterested' nghĩa là thờ ơ, không hứng thú.",
      "skill": "Lexical Nuance",
      "difficulty": "advanced"
    },
    {
      "id": "diag-5",
      "type": "sentence_sequencing",
      "category": "Discourse Cohesion (THPTQG Dạng 3)",
      "prompt": "Sắp xếp 3 câu sau theo trật tự logic hoàn chỉnh của một đoạn văn nghị luận về đô thị hóa:\n(a) Consequently, civic authorities are increasingly compelled to implement low-emission zones and expand public transit.\n(b) Over the past decade, rapid urban sprawl has placed unprecedented strain on existing municipal infrastructure.\n(c) This acute pressure frequently manifests in crippling traffic gridlocks and hazardous particulate air pollution.",
      "options": [
        "A. b – c – a",
        "B. a – c – b",
        "C. c – b – a",
        "D. b – a – c"
      ],
      "answer": "A",
      "explanation": "(b) Giới thiệu bối cảnh nguyên nhân: đô thị hóa gây áp lực lên hạ tầng -> (c) 'This acute pressure' liên kết trực tiếp quy chiếu câu (b), nêu biểu hiện kẹt xe và ô nhiễm -> (a) 'Consequently' nêu giải pháp kết luận: chính quyền phải lập vùng phát thải thấp.",
      "skill": "Cohesion & Coherence",
      "difficulty": "advanced"
    },
    {
      "id": "diag-6",
      "type": "multiple_choice",
      "category": "Three-Word Phrasal Verbs",
      "prompt": "In an era of relentless technological disruption, software engineers must continually upskill to ______ the accelerating pace of algorithmic automation.",
      "options": [
        "A. look down on",
        "B. cut down on",
        "C. keep up with",
        "D. run out of"
      ],
      "answer": "C",
      "explanation": "'keep up with' nghĩa là theo kịp, bắt kịp tốc độ thay đổi. 'look down on' (coi thường), 'cut down on' (cắt giảm), 'run out of' (hết cạn kiệt).",
      "skill": "Phrasal Verbs B2",
      "difficulty": "starter"
    },
    {
      "id": "diag-7",
      "type": "multiple_choice",
      "category": "Reading Comprehension (Main Idea)",
      "passageContext": "Artificial intelligence tools have transcended routine computation, venturing into cognitive tasks once considered uniquely human, such as legal drafting and creative synthesis. However, organizational economists caution that generative models do not automatically translate into aggregate productivity leaps. Without substantial institutional restructuring, workplace upskilling, and ethical safeguards against algorithmic bias, companies risk generating vast volumes of superficial output while eroding critical human judgment.",
      "prompt": "Which of the following best summarizes the author's primary thesis in the passage?",
      "options": [
        "A. Generative AI will inevitably render human expertise completely obsolete within the current decade.",
        "B. The productivity benefits of AI cannot be realized without structural adaptation and ethical oversight.",
        "C. Corporate institutions should outright prohibit automated tools to safeguard creative jobs.",
        "D. Generative algorithms have already demonstrated superior judgment compared to seasoned human professionals."
      ],
      "answer": "B",
      "explanation": "Câu thứ hai và thứ ba nêu rõ thông điệp cốt lõi: lợi ích năng suất của AI đòi hỏi phải đi kèm với tái cơ cấu tổ chức, đào tạo nhân sự và kiểm soát đạo đức.",
      "skill": "Main Idea Scanning",
      "difficulty": "intermediate"
    },
    {
      "id": "diag-8",
      "type": "multiple_choice",
      "category": "Reading Comprehension (Detail)",
      "passageContext": "Artificial intelligence tools have transcended routine computation, venturing into cognitive tasks once considered uniquely human, such as legal drafting and creative synthesis. However, organizational economists caution that generative models do not automatically translate into aggregate productivity leaps. Without substantial institutional restructuring, workplace upskilling, and ethical safeguards against algorithmic bias, companies risk generating vast volumes of superficial output while eroding critical human judgment.",
      "prompt": "According to the passage, failure to implement ethical safeguards and upskilling might result in ______.",
      "options": [
        "A. the immediate collapse of legal and financial institutions",
        "B. a total stagnation of software engineering research",
        "C. prolific shallow output coupled with degraded human discernment",
        "D. a rapid decline in corporate computational storage capabilities"
      ],
      "answer": "C",
      "explanation": "Paraphrase câu cuối: 'generating vast volumes of superficial output while eroding critical human judgment' tương đương với 'prolific shallow output coupled with degraded human discernment'.",
      "skill": "Paraphrase Matching",
      "difficulty": "intermediate"
    },
    {
      "id": "diag-9",
      "type": "multiple_choice",
      "category": "Reading Comprehension (Inference)",
      "passageContext": "Artificial intelligence tools have transcended routine computation, venturing into cognitive tasks once considered uniquely human, such as legal drafting and creative synthesis. However, organizational economists caution that generative models do not automatically translate into aggregate productivity leaps. Without substantial institutional restructuring, workplace upskilling, and ethical safeguards against algorithmic bias, companies risk generating vast volumes of superficial output while eroding critical human judgment.",
      "prompt": "What can be inferred about the economic impact of technological innovation from the economists' stance?",
      "options": [
        "A. Technological adoption alone is insufficient to guarantee meaningful macroeconomic progress.",
        "B. Economists generally resist the integration of automation into creative sectors.",
        "C. Algorithmic bias is primarily caused by employees lacking software literacy.",
        "D. Legal drafting is the most economically vulnerable profession to robotic automation."
      ],
      "answer": "A",
      "explanation": "Suy luận logic từ câu: 'generative models do not automatically translate into aggregate productivity leaps' mà cần tái cơ cấu tổ chức -> Công nghệ thuần túy không tự động đảm bảo tiến bộ kinh tế.",
      "skill": "Deep Inference",
      "difficulty": "advanced"
    },
    {
      "id": "diag-10",
      "type": "multiple_choice",
      "category": "Reading Comprehension (Author's Tone)",
      "passageContext": "Artificial intelligence tools have transcended routine computation, venturing into cognitive tasks once considered uniquely human, such as legal drafting and creative synthesis. However, organizational economists caution that generative models do not automatically translate into aggregate productivity leaps. Without substantial institutional restructuring, workplace upskilling, and ethical safeguards against algorithmic bias, companies risk generating vast volumes of superficial output while eroding critical human judgment.",
      "prompt": "The author's tone toward the immediate deployment of generative AI tools can best be described as ______.",
      "options": [
        "A. dismissive and cynical",
        "B. cautiously analytical",
        "C. unreservedly enthusiastic",
        "D. indifferent and neutral"
      ],
      "answer": "B",
      "explanation": "Tác giả thừa nhận bước tiến của AI ('transcended routine computation') nhưng phân tích sâu sắc các điều kiện cần để thành công ('However, economists caution...', 'Without... risk...'). Giọng điệu là phân tích thận trọng (cautiously analytical).",
      "skill": "Author's Tone",
      "difficulty": "advanced"
    }
  ]
};

const VN_EXAM_TESTS = [
  {
    "id": "thptqg-2026-m1101",
    "title": "Đề thi Chính thức THPT Quốc Gia 2026 - Mã đề 1101 (Đợt 1)",
    "examType": "thptqg",
    "year": 2026,
    "mode": "thptqg_full",
    "durationSeconds": 3000,
    "questionCount": 40,
    "sourcePolicy": "Bộ Giáo dục và Đào tạo - Kỳ thi Tốt nghiệp THPT 2026",
    "sections": [
      {
        "passage": {
          "title": "Stoneville Low Emission Transit & Behavioral Economics",
          "topic": "urban development",
          "level": "THPTQG Chuẩn GDPT 2018 (Phân hóa 9+)",
          "paragraphs": [
            "For decades, the market town of Stoneville struggled with traffic bottlenecks in its historic centre. Like many secondary cities, its narrow roads were never designed to accommodate modern vehicular traffic. In 2024, the municipal council enacted a pilot Low Emission Zone (LEZ), levying a flat daily fee on combustion-engine vehicles entering the central grid between 7 AM and 6 PM, while offering complimentary charging stations and subsidized bus fares.",
            "Initial public reception was polarized. Small shopkeepers voiced legitimate anxieties that the fee would deter suburban shoppers, diverting retail revenue toward peripheral shopping malls. However, subsequent economic monitoring revealed an unexpected demographic shift: pedestrian footfall surged by 34%, and outdoor hospitality venues experienced record patronage. The calmer urban atmosphere appeared to incentivize leisurely shopping rather than rapid motor-based errands.",
            "Urban economists point out that the Stoneville experiment reflects a broader shift toward pricing negative externalities. When drivers bear the genuine societal cost of their emissions and spatial footprint, commuting habits evolve. As congestion pricing expands to regional transport networks, the critical lesson from Stoneville is that mobility restrictions must be paired with attractive, high-frequency public alternatives."
          ]
        },
        "questions": [
          {
            "id": "t26-1",
            "number": 1,
            "type": "multiple_choice",
            "prompt": "If everyone ______ responsibly during the campaign, the school's carbon footprint will drop dramatically.",
            "options": [
              "A. work",
              "B. worked",
              "C. have worked",
              "D. works"
            ],
            "answer": "D",
            "explanation": "Câu điều kiện loại 1: If + S + V(hiện tại đơn). Đại từ bất định 'everyone' luôn đi với động từ số ít 'works'.",
            "skill": "Subject-Verb Agreement"
          },
          {
            "id": "t26-2",
            "number": 2,
            "type": "multiple_choice",
            "prompt": "The community seminar aimed to expand students' ______ of plastic pollution and its catastrophic impact on marine biodiversity.",
            "options": [
              "A. focus",
              "B. attention",
              "C. emphasis",
              "D. knowledge"
            ],
            "answer": "D",
            "explanation": "Collocation tự nhiên: 'expand one's knowledge of something' (mở rộng hiểu biết về điều gì).",
            "skill": "Collocation B2"
          },
          {
            "id": "t26-3",
            "number": 3,
            "type": "multiple_choice",
            "prompt": "The school management had colour-coded recycling receptacles ______ across all classroom corridors last week.",
            "options": [
              "A. install",
              "B. being installed",
              "C. installed",
              "D. installing"
            ],
            "answer": "C",
            "explanation": "Cấu trúc nhờ vả/sai khiến bị động: have + sth + V3/ed ('had receptacles installed').",
            "skill": "Causative Structure"
          },
          {
            "id": "t26-4",
            "number": 4,
            "type": "multiple_choice",
            "prompt": "Volunteers helped to ______ plastic containers before sending them to the central municipal recycling facility.",
            "options": [
              "A. catch out",
              "B. check out",
              "C. fill out",
              "D. sort out"
            ],
            "answer": "D",
            "explanation": "'sort out' mang nghĩa phân loại, xử lý rác thải.",
            "skill": "Phrasal Verbs"
          },
          {
            "id": "t26-5",
            "number": 5,
            "type": "multiple_choice",
            "prompt": "The green living initiative is designed to ______ sustainable habits among secondary school students.",
            "options": [
              "A. promote",
              "B. protect",
              "C. provide",
              "D. produce"
            ],
            "answer": "A",
            "explanation": "'promote sustainable habits' mang nghĩa thúc đẩy, nuôi dưỡng thói quen bền vững.",
            "skill": "Collocation B2"
          },
          {
            "id": "t26-6",
            "number": 6,
            "type": "multiple_choice",
            "prompt": "Your active ______ is considered vital to the overall triumph of the green campus project.",
            "options": [
              "A. cooperate",
              "B. cooperation",
              "C. cooperatively",
              "D. cooperative"
            ],
            "answer": "B",
            "explanation": "Sau tính từ sở hữu 'Your' và tính từ 'active' cần một danh từ 'cooperation'.",
            "skill": "Word Formation"
          },
          {
            "id": "t26-7",
            "number": 7,
            "type": "sentence_sequencing",
            "prompt": "Sắp xếp các câu sau thành một lá thư thông báo học bổng chính thức hoàn chỉnh:\n(a) Please review, sign and return the enclosed scholar agreement prior to July 15th.\n(b) Your academic diligence and interview performance demonstrated exceptional promise.\n(c) The award provides a full tuition waiver alongside a monthly stipend of $500.\n(d) We are delighted to inform you that you have been selected for the Pinnacle Scholarship.\n(e) Should you have any inquiries, please contact our Admissions Office.",
            "options": [
              "A. d – c – b – a – e",
              "B. d – b – a – c – e",
              "C. d – b – c – a – e",
              "D. b – d – c – a – e"
            ],
            "answer": "C",
            "explanation": "(d) Báo tin vui mở đầu thư -> (b) Nhận xét phẩm chất xứng đáng -> (c) Chi tiết quyền lợi học bổng -> (a) Hướng dẫn thủ tục nhận -> (e) Lời mời liên hệ kết thúc thư.",
            "skill": "Discourse Ordering"
          },
          {
            "id": "t26-8",
            "number": 8,
            "type": "sentence_sequencing",
            "prompt": "Sắp xếp đoạn hội thoại dịch vụ khách hàng sau:\n(a) Certainly. Let me verify your transaction reference on our ticketing system right away.\n(b) Good morning, I reserved two concert tickets online yesterday but have not received an email confirmation.\n(c) I apologise for the inconvenience. Could you please provide your booking telephone number?",
            "options": [
              "A. a – b – c",
              "B. b – a – c",
              "C. b – c – a",
              "D. c – b – a"
            ],
            "answer": "C",
            "explanation": "(b) Khách hàng trình bày vấn đề -> (c) Nhân viên xin lỗi và xin số điện thoại tra cứu -> (a) Khách hàng đưa số điện thoại và nhân viên xác nhận kiểm tra.",
            "skill": "Conversational Sequencing"
          },
          {
            "id": "t26-9",
            "number": 9,
            "type": "multiple_choice",
            "prompt": "According to paragraph 1, the municipal council enacted the LEZ primarily because ______.",
            "options": [
              "A. all combustion cars were causing catastrophic road damage",
              "B. historic roads were unsuited for modern traffic volumes",
              "C. retail shopkeepers requested a ban on tourist vehicles",
              "D. peripheral shopping malls had completely replaced town shops"
            ],
            "answer": "B",
            "explanation": "Đoạn 1 nêu rõ: 'its narrow roads were never designed to accommodate modern vehicular traffic'.",
            "skill": "Detail Scanning"
          },
          {
            "id": "t26-10",
            "number": 10,
            "type": "multiple_choice",
            "prompt": "The demographic and commercial monitoring in Stoneville showed that pedestrian footfall ______.",
            "options": [
              "A. experienced an unexpected increase of over thirty percent",
              "B. diverted completely toward out-of-town retail centers",
              "C. caused severe decline in restaurant and cafe patronage",
              "D. dropped precipitously during weekend evening hours"
            ],
            "answer": "A",
            "explanation": "Đoạn 2 nêu: 'pedestrian footfall surged by 34%, and outdoor hospitality venues experienced record patronage'.",
            "skill": "Factual Verification"
          }
        ]
      }
    ]
  },
  {
    "id": "thptqg-2026-tuyen-quang",
    "title": "Đề thi Lại THPT Quốc Gia 2026 - THPT Chuyên Tuyên Quang (Mã đề 1101 Lần 2)",
    "examType": "thptqg",
    "year": 2026,
    "mode": "thptqg_full",
    "durationSeconds": 3000,
    "questionCount": 40,
    "sourcePolicy": "Bộ Giáo dục và Đào tạo - Hội đồng thi Chuyên Tuyên Quang tháng 8/2026",
    "sections": [
      {
        "passage": {
          "title": "Australia's Under-16 Social Media Prohibition & Digital Governance",
          "topic": "culture and society",
          "level": "THPTQG Nâng cao (Brookings Institution)",
          "paragraphs": [
            "In late 2024, the Australian Parliament passed groundbreaking legislation establishing a blanket ban on social media accounts for individuals under sixteen years of age. Under the new statute, tech platforms bear direct legal liability, facing fines up to fifty million dollars for systematic failures to prevent underage registration.",
            "Advocates of the measure emphasize mounting clinical evidence linking compulsive scrolling and algorithmic engagement loops to elevated rates of anxiety, body dysmorphia, and sleep deprivation among adolescents. Proponents argue that individual parental controls have proved insufficient against multi-billion-dollar recommendation engines engineered for psychological addiction.",
            "Conversely, digital rights organizations and civil liberties groups express profound reservations. Critics question the technical feasibility of robust age verification, warning that mandatory biometrics or national ID scanning jeopardize user anonymity. Furthermore, child psychologists note that vulnerable adolescents who rely on online communities for mutual solidarity may find themselves abruptly disenfranchised."
          ]
        },
        "questions": [
          {
            "id": "tqt-1",
            "number": 1,
            "type": "multiple_choice",
            "prompt": "Our certified fitness mentors ensure that (1) ______ registered user receives a tailor-made nutrition regimen.",
            "options": [
              "A. every",
              "B. all",
              "C. neither",
              "D. both"
            ],
            "answer": "A",
            "explanation": "'every + N đếm được số ít' ('registered user') đi kèm động từ số ít 'receives'.",
            "skill": "Quantifiers"
          },
          {
            "id": "tqt-2",
            "number": 2,
            "type": "multiple_choice",
            "prompt": "Dynamic cardiovascular training makes the routine far (2) ______ than generic generic regimens.",
            "options": [
              "A. as effective",
              "B. effective",
              "C. most effective",
              "D. more effective"
            ],
            "answer": "D",
            "explanation": "Có liên từ 'than' nên dùng so sánh hơn của tính từ dài: 'more effective than'.",
            "skill": "Comparatives"
          },
          {
            "id": "tqt-3",
            "number": 3,
            "type": "multiple_choice",
            "prompt": "(3) ______, premium subscribers will unlock round-the-clock consults with sports physiologists.",
            "options": [
              "A. Consequently",
              "B. Conversely",
              "C. Otherwise",
              "D. Moreover"
            ],
            "answer": "D",
            "explanation": "Liên từ bổ sung thêm thông tin/quyền lợi: 'Moreover' (Hơn nữa, Thêm vào đó).",
            "skill": "Logical Connectors"
          },
          {
            "id": "tqt-4",
            "number": 4,
            "type": "multiple_choice",
            "prompt": "A gym membership will cut no (4) ______ unless you cultivate unwavering personal discipline.",
            "options": [
              "A. wood",
              "B. ice",
              "C. stone",
              "D. wire"
            ],
            "answer": "B",
            "explanation": "Thành ngữ cố định: 'cut no ice (with somebody)' = không có tác dụng, không mang lại hiệu quả.",
            "skill": "Idioms C1"
          },
          {
            "id": "tqt-5",
            "number": 5,
            "type": "multiple_choice",
            "prompt": "Join thousands of driven individuals who aspire to elevate their stamina, just (5) ______ you.",
            "options": [
              "A. as",
              "B. same",
              "C. like",
              "D. identical"
            ],
            "answer": "C",
            "explanation": "Cụm giới từ so sánh 'just like you' (giống như bạn).",
            "skill": "Prepositions"
          },
          {
            "id": "tqt-6",
            "number": 6,
            "type": "multiple_choice",
            "prompt": "We guarantee you will never feel isolated on your personal (6) ______ toward holistic wellness.",
            "options": [
              "A. voyage",
              "B. journey",
              "C. commute",
              "D. trek"
            ],
            "answer": "B",
            "explanation": "Collocation cố định: 'personal journey toward wellness' (hành trình cá nhân rèn luyện sức khỏe).",
            "skill": "Collocations"
          },
          {
            "id": "tqt-7",
            "number": 7,
            "type": "sentence_sequencing",
            "prompt": "Sắp xếp câu chuyện phục hồi Nhà hát Lịch sử Regal:\n(a) The restorative refurbishment progressed smoothly, dramatically rejuvenating the historic auditorium.\n(b) The majestic structure had remained abandoned for decades following a devastating blaze until conservationists intervened.\n(c) Its triumph stimulated an analogous civic drive to preserve an art deco cinema two streets away.\n(d) The triumphant re-inauguration gala captivated an immense, enthusiastic audience.\n(e) The municipality approved the restoration manifesto and granted emergency preservation subsidies.",
            "options": [
              "A. b – a – e – d – c",
              "B. b – e – d – a – c",
              "C. e – b – a – d – c",
              "D. b – e – a – d – c"
            ],
            "answer": "D",
            "explanation": "(b) Bối cảnh hoang phế -> (e) Chính quyền phê duyệt dự án và trợ cấp -> (a) Quá trình trùng tu thành công -> (d) Đêm khai trương tưng bừng -> (c) Truyền cảm hứng cho rạp chiếu phim kế bên.",
            "skill": "Narrative Ordering"
          },
          {
            "id": "tqt-8",
            "number": 8,
            "type": "multiple_choice",
            "prompt": "According to the passage, the Australian social media legislation places direct legal liability on ______.",
            "options": [
              "A. technology platforms operating the networks",
              "B. parents of underage adolescents",
              "C. school headmasters and educational authorities",
              "D. regional telecommunication internet service providers"
            ],
            "answer": "A",
            "explanation": "Đoạn 1 nêu rõ: 'tech platforms bear direct legal liability, facing fines up to fifty million dollars'.",
            "skill": "Detail Scanning"
          }
        ]
      }
    ]
  },
  {
    "id": "vact-2026-dot2",
    "title": "Phần thi Tiếng Anh - Đánh giá Năng lực ĐHQG-HCM 2026 (Đợt 2)",
    "examType": "vact",
    "year": 2026,
    "mode": "vact_full",
    "durationSeconds": 1800,
    "questionCount": 30,
    "sourcePolicy": "Đại học Quốc gia TP.HCM - Kỳ thi V-ACT 2026",
    "sections": [
      {
        "passage": {
          "title": "Cognitive Flexibility in Multilingual Contexts",
          "topic": "education and learning",
          "level": "V-ACT ĐGNL Chuẩn hóa",
          "paragraphs": [
            "Cognitive neuroscientists have increasingly substantiated the view that bilingualism confers measurable neuroplastic benefits across the human lifespan. Rather than inducing language delay, early dual-language exposure reinforces executive function, the cognitive suite responsible for selective attention, task switching, and inhibitory control.",
            "In standardized sorting experiments, bilingual participants consistently outperform monolingual counterparts when rule parameters change unexpectedly. Researchers hypothesize that continuously managing two competing linguistic systems exercises the prefrontal cortex, generating what geriatricians term 'cognitive reserve'—a neurological buffer that can delay clinical manifestations of dementia by up to four years."
          ]
        },
        "questions": [
          {
            "id": "v26-1",
            "number": 1,
            "type": "multiple_choice",
            "prompt": "Identify the incorrect underlined word: 'The company has decided (A) to lay off (B) several hundreds (C) workers due to (D) financial constraints.'",
            "options": [
              "A. to lay off",
              "B. several hundreds",
              "C. workers",
              "D. due to"
            ],
            "answer": "B",
            "explanation": "Quy tắc ngữ pháp về từ chỉ số lượng: khi đi kèm với từ chỉ số lượng xác định hoặc 'several/a few', ta dùng 'hundred/thousand' không có 's' ('several hundred workers'). 'Hundreds of' chỉ dùng khi đi với giới từ 'of'.",
            "skill": "Error Identification"
          },
          {
            "id": "v26-2",
            "number": 2,
            "type": "multiple_choice",
            "prompt": "Choose the closest meaning to the underlined word: 'The judge remained impartial throughout the prolonged dispute.'",
            "options": [
              "A. passionate",
              "B. prejudiced",
              "C. unbiased",
              "D. skeptical"
            ],
            "answer": "C",
            "explanation": "'impartial' nghĩa là vô tư, công bằng, không thiên vị = 'unbiased'.",
            "skill": "Synonym in Context"
          },
          {
            "id": "v26-3",
            "number": 3,
            "type": "multiple_choice",
            "prompt": "Which word best completes the sentence: 'Despite their differences, the committee members managed to ______ a compromise.'",
            "options": [
              "A. reach",
              "B. do",
              "C. commit",
              "D. take"
            ],
            "answer": "A",
            "explanation": "Collocation cố định: 'reach a compromise' (đạt được một thỏa hiệp).",
            "skill": "Collocations"
          },
          {
            "id": "v26-4",
            "number": 4,
            "type": "multiple_choice",
            "prompt": "According to the passage on bilingualism, 'cognitive reserve' refers to ______.",
            "options": [
              "A. a complete immunity to linguistic confusion",
              "B. a neurological buffer that delays cognitive decline",
              "C. the capacity to memorize vocabulary at double the standard speed",
              "D. the linguistic mechanism exclusively reserved for simultaneous translators"
            ],
            "answer": "B",
            "explanation": "Đoạn 2 định nghĩa: 'what geriatricians term cognitive reserve—a neurological buffer that can delay clinical manifestations of dementia'.",
            "skill": "Reading Comprehension"
          }
        ]
      }
    ]
  }
];

const VN_EXAM_ROADMAPS = {
  "thptqg-sprint-60d": {
    "id": "thptqg-sprint-60d",
    "title": "Chiến Dịch Bứt Phá Điểm 9+ THPT Quốc Gia (60 Ngày)",
    "examType": "thptqg",
    "totalDays": 60,
    "targetScore": "9.0 - 10.0",
    "phases": [
      {
        "phase": 1,
        "name": "Nền Tảng Từ Vựng & Cấu Trúc C1/C2 (Ngày 1 - 25)",
        "goal": "Quét sạch 300 từ vựng C1/C2 và 200 collocations SGK 10-11-12 qua hệ thống Flashcard FSRS.",
        "dailyQuota": {
          "newCards": 12,
          "reviews": 25,
          "drills": 1
        }
      },
      {
        "phase": 2,
        "name": "Làm Chủ Thông Báo, Tờ Rơi & Sắp Xếp Câu (Ngày 26 - 45)",
        "goal": "Tập trung giải quyết 17 câu điền văn bản và 5 câu sắp xếp logic mạch lạc (Dạng 1, 2, 3).",
        "dailyQuota": {
          "newCards": 8,
          "reviews": 35,
          "drills": 2
        }
      },
      {
        "phase": 3,
        "name": "Thực Chiến Đọc Hiểu Phân Hóa & Đề Thi Thật (Ngày 46 - 60)",
        "goal": "Luyện giải trọn vẹn 40 câu trong 50 phút; mổ xẻ bẫy phương án nhiễu (Distractor Diagnosis).",
        "dailyQuota": {
          "newCards": 5,
          "reviews": 40,
          "drills": 1
        }
      }
    ]
  },
  "vact-sprint-45d": {
    "id": "vact-sprint-45d",
    "title": "Chinh Phục 280+ Điểm Tiếng Anh ĐGNL V-ACT (45 Ngày)",
    "examType": "vact",
    "totalDays": 45,
    "targetScore": "260 - 300",
    "phases": [
      {
        "phase": 1,
        "name": "Xử Lý Triệt Để Bẫy Ngữ Pháp & Cặp Từ Dễ Nhầm (Ngày 1 - 20)",
        "goal": "Luyện nhận diện lỗi sai câu (Error Identification) và 100 cặp từ dễ nhầm lẫn.",
        "dailyQuota": {
          "newCards": 10,
          "reviews": 20,
          "drills": 2
        }
      },
      {
        "phase": 2,
        "name": "Phản Xạ Đọc Nhanh & Logic Văn Bản (Ngày 21 - 45)",
        "goal": "Luyện 30 câu trong 30 phút, tối ưu hóa tốc độ đọc quét (scanning) và tư duy logic.",
        "dailyQuota": {
          "newCards": 5,
          "reviews": 30,
          "drills": 1
        }
      }
    ]
  },
  "ielts-escalator-60d": {
    "id": "ielts-escalator-60d",
    "title": "IELTS Academic Band Escalator (Band 6.0 ➔ 7.5+)",
    "examType": "ielts",
    "totalDays": 60,
    "targetScore": "7.5+",
    "phases": [
      {
        "phase": 1,
        "name": "Master AWL 570 & Academic Collocations (Ngày 1 - 30)",
        "goal": "Tự động hóa 570 từ AWL qua flashcards và rewrite drills cho Writing Task 2.",
        "dailyQuota": {
          "newCards": 15,
          "reviews": 30,
          "drills": 1
        }
      },
      {
        "phase": 2,
        "name": "Full Mock Series & Time Management (Ngày 31 - 60)",
        "goal": "Luyện 3 Passages Reading (60 phút) kết hợp rèn luyện Task 1 & Task 2 có AI chấm điểm.",
        "dailyQuota": {
          "newCards": 5,
          "reviews": 40,
          "drills": 1
        }
      }
    ]
  }
};

// Aliases for track lookups
VN_EXAM_ROADMAPS["thptqg"] = VN_EXAM_ROADMAPS["thptqg-sprint-60d"];
VN_EXAM_ROADMAPS["vact"] = VN_EXAM_ROADMAPS["vact-sprint-45d"];
VN_EXAM_ROADMAPS["ielts"] = VN_EXAM_ROADMAPS["ielts-escalator-60d"];
VN_EXAM_ROADMAPS["all"] = VN_EXAM_ROADMAPS["thptqg-sprint-60d"];
Object.values(VN_EXAM_ROADMAPS).forEach(r => {
  if (r && r.phases && !r.milestones) r.milestones = r.phases;
});

// Helper functions for exam tracks and vocab patches
function getVocabPatchList(patches) {
  if (!patches || typeof patches !== 'object') return [];
  return Object.values(patches);
}

function getRootPatches(patches) {
  return getVocabPatchList(patches).filter(p => !p.parentId);
}

function getSubPatches(patches, parentId) {
  return getVocabPatchList(patches).filter(p => p.parentId === parentId);
}

function findWordById(wordId) {
  if (!wordId) return null;
  if (wordId.startsWith('en12-')) {
    const id = parseInt(wordId.replace('en12-', ''), 10);
    return VN_EXAM_VOCAB.find(w => w.id === id) || null;
  }
  if (wordId.startsWith('struct-')) {
    return VN_EXAM_STRUCTURES.find(s => s.id === wordId) || null;
  }
  return null;
}
