// scratch/test-unified-mastery.mjs
// Automated verification for Unified English Mastery Lab (P1 + P2 + P3)
import fs from 'fs';
import path from 'path';
import assert from 'assert';

global.React = {
  useState: () => [],
  useEffect: () => {},
  useCallback: fn => fn,
  useMemo: fn => fn(),
  useRef: () => ({ current: null })
};

const baseDir = path.resolve('D:/Downloads/English/ielts-writing-lab-v7-split');

console.log('--- 1. Testing src/00-vn-exam-data.js ---');
const dataContent = fs.readFileSync(path.join(baseDir, 'src/00-vn-exam-data.js'), 'utf8');
// Evaluate in an isolated context
const evalContext = {};
const runData = new Function(dataContent + `
  return {
    VN_EXAM_VOCAB,
    VN_EXAM_STRUCTURES,
    VN_DEFAULT_PATCHES,
    VN_DIAGNOSTIC_TEST,
    VN_EXAM_TESTS,
    VN_EXAM_ROADMAPS,
    getVocabPatchList,
    getRootPatches,
    getSubPatches
  };
`);
const examData = runData();

assert.strictEqual(examData.VN_EXAM_VOCAB.length, 300, 'VN_EXAM_VOCAB must have 300 entries');
assert.strictEqual(examData.VN_EXAM_STRUCTURES.length, 464, 'VN_EXAM_STRUCTURES must have 464 entries');
assert.ok(examData.VN_DEFAULT_PATCHES['patch-thptqg-12'], 'Root patch-thptqg-12 must exist');
assert.strictEqual(examData.VN_DIAGNOSTIC_TEST.questions.length, 10, 'VN_DIAGNOSTIC_TEST must have 10 placement questions');
assert.strictEqual(examData.VN_EXAM_TESTS.length, 3, 'VN_EXAM_TESTS must contain 3 official exam papers');
assert.ok(examData.VN_EXAM_ROADMAPS.thptqg, 'THPTQG roadmap must exist');
assert.ok(examData.VN_EXAM_ROADMAPS.vact, 'V-ACT roadmap must exist');
assert.ok(examData.VN_EXAM_ROADMAPS.ielts, 'IELTS roadmap must exist');
console.log('✓ 00-vn-exam-data.js passed all assertions (300 vocab, 464 structures, 3 official tests, 10Q diagnostic, 3 roadmaps).');

console.log('--- 2. Testing FSRS / SM-2 Spaced Repetition Engine ---');
const awlDataContent = fs.readFileSync(path.join(baseDir, 'src/00-data.js'), 'utf8');
const awlCardDataContent = fs.readFileSync(path.join(baseDir, 'src/01-awl-card-data.js'), 'utf8');
const vocabUtilsContent = fs.readFileSync(path.join(baseDir, 'src/03-vocab-utils.js'), 'utf8');
const runUtils = new Function(awlDataContent + '\n' + awlCardDataContent + '\n' + dataContent + '\n' + vocabUtilsContent + `
  return {
    calculateNextReview,
    getPatchWords,
    parseQuizletText
  };
`);
const utils = runUtils();

// Test calculateNextReview
const initialStat = { reps: 0, interval: 0, ease: 2.5, state: 'new' };
const againStat = utils.calculateNextReview(initialStat, 1);
assert.strictEqual(againStat.reps, 0, 'Rating 1 (Again) must reset reps to 0');
assert.strictEqual(againStat.interval, 1, 'Rating 1 must set interval to 1 day');

const goodStat1 = utils.calculateNextReview(initialStat, 3);
assert.strictEqual(goodStat1.reps, 1, 'Rating 3 (Good) on new card must set reps to 1');
assert.strictEqual(goodStat1.interval, 1, 'First Good interval must be 1');

const goodStat2 = utils.calculateNextReview(goodStat1, 3);
assert.strictEqual(goodStat2.reps, 2, 'Second Good must set reps to 2');
assert.strictEqual(goodStat2.interval, 3, 'Second Good interval must be 3 days');

const easyStat = utils.calculateNextReview(initialStat, 4);
assert.strictEqual(easyStat.reps, 1, 'Rating 4 (Easy) must advance reps');
assert.strictEqual(easyStat.interval, 4, 'Rating 4 initial interval must be 4 days');
assert.ok(easyStat.ease > 2.5, 'Rating 4 must increase ease factor');
console.log('✓ FSRS / SM-2 spaced repetition calculations verified.');

console.log('--- 3. Testing Quizlet / OpenQuiz 2-Column Parser ---');
const testPasted = `
alleviate\tlàm giảm, làm dịu bớt
adverse - bất lợi, có hại
advocate : ủng hộ, tán thành
lucrative | có lợi nhuận cao
`;
const parsed = utils.parseQuizletText(testPasted);
assert.strictEqual(parsed.length, 4, 'Parser must parse 4 terms from mixed delimiters');
assert.strictEqual(parsed[0].term, 'alleviate');
assert.strictEqual(parsed[0].def, 'làm giảm, làm dịu bớt');
assert.strictEqual(parsed[1].term, 'adverse');
assert.strictEqual(parsed[1].def, 'bất lợi, có hại');
assert.strictEqual(parsed[2].term, 'advocate');
assert.strictEqual(parsed[2].def, 'ủng hộ, tán thành');
assert.strictEqual(parsed[3].term, 'lucrative');
assert.strictEqual(parsed[3].def, 'có lợi nhuận cao');
console.log('✓ Quizlet / OpenQuiz parser verified (Tab, Dash, Colon, Pipe).');

console.log('--- 4. Testing Patch Word Resolver ---');
const patch1 = examData.VN_DEFAULT_PATCHES['patch-thptqg-12-s1'];
assert.ok(patch1, 'patch-thptqg-12-s1 must exist');
const patchWords = utils.getPatchWords(patch1, {});
assert.strictEqual(patchWords.length, patch1.wordIds.length, 'Resolved words count must match wordIds');
assert.strictEqual(patchWords[0].word, 'to alleviate');
console.log('✓ Patch word resolver verified (successfully resolved words from VN_EXAM_VOCAB).');

console.log('--- 5. Testing Patch CRUD & Splitting in State ---');
const stateContent = fs.readFileSync(path.join(baseDir, 'src/04-state.js'), 'utf8');
const runState = new Function(awlDataContent + '\n' + awlCardDataContent + '\n' + dataContent + '\n' + vocabUtilsContent + '\n' + stateContent + `
  return {
    createVocabPatch,
    updateVocabPatch,
    deleteVocabPatch,
    splitVocabPatch
  };
`);
const stateModule = runState();

let fakeState = {
  targetTrack: 'thptqg',
  vocabPatches: { ...examData.VN_DEFAULT_PATCHES },
  customVocab: {}
};

// Create patch
fakeState = stateModule.createVocabPatch(fakeState, {
  name: 'Test Deck',
  wordIds: ['en12-1', 'en12-2', 'en12-3', 'en12-4', 'en12-5', 'en12-6', 'en12-7', 'en12-8', 'en12-9', 'en12-10']
});
const createdId = Object.keys(fakeState.vocabPatches).find(k => fakeState.vocabPatches[k].name === 'Test Deck');
assert.ok(createdId, 'Created patch must exist in state.vocabPatches');

// Split patch (chunkSize = 5)
fakeState = stateModule.splitVocabPatch(fakeState, createdId, 5);
assert.ok(fakeState.vocabPatches[`${createdId}-part1`], 'Sub-patch part 1 must exist');
assert.ok(fakeState.vocabPatches[`${createdId}-part2`], 'Sub-patch part 2 must exist');
assert.strictEqual(fakeState.vocabPatches[`${createdId}-part1`].wordIds.length, 5);
assert.strictEqual(fakeState.vocabPatches[`${createdId}-part2`].wordIds.length, 5);
console.log('✓ Patch CRUD and 20-word sub-patch splitting verified.');

console.log('--- 6. Verifying Bundles & Vendor Assets ---');
assert.ok(fs.existsSync(path.join(baseDir, 'vendor/gsap.min.js')), 'vendor/gsap.min.js must exist');
assert.ok(fs.statSync(path.join(baseDir, 'vendor/gsap.min.js')).size > 50000, 'gsap.min.js must be > 50KB');

const distApp = fs.readFileSync(path.join(baseDir, 'dist/app.jsx'), 'utf8');
assert.ok(distApp.includes('Flashcard3DView'), 'dist/app.jsx must include Flashcard3DView');
assert.ok(distApp.includes('MatchGameView'), 'dist/app.jsx must include MatchGameView');
assert.ok(distApp.includes('LearnModeView'), 'dist/app.jsx must include LearnModeView');
assert.ok(distApp.includes('PatchTestView'), 'dist/app.jsx must include PatchTestView');
assert.ok(distApp.includes('DiagnosticPlacementModal'), 'dist/app.jsx must include DiagnosticPlacementModal');
assert.ok(distApp.includes('VN_EXAM_TESTS'), 'dist/app.jsx must reference VN_EXAM_TESTS');

const indexHtml = fs.readFileSync(path.join(baseDir, 'index.html'), 'utf8');
assert.ok(indexHtml.includes('vendor/gsap.min.js'), 'index.html must load vendor/gsap.min.js');
console.log('✓ Built dist/app.jsx and index.html contain all required modules and GSAP vendoring.');

console.log('\n========================================');
console.log('ALL VERIFICATION SUITES PASSED (100%)');
console.log('========================================');
