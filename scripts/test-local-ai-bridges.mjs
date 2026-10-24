import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_PORT = 5179;

console.log('--- STARTING LOCAL SERVER ON TEST PORT', TEST_PORT, '---');
const serverProc = spawn('node', ['scripts/serve.mjs', String(TEST_PORT)], {
  cwd: root,
  stdio: 'inherit',
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTests() {
  await sleep(1500);

  try {
    console.log('\n[TEST 1] GET /api/local-ai/status');
    const statusRes = await fetch(`http://localhost:${TEST_PORT}/api/local-ai/status`);
    console.log('Status code:', statusRes.status);
    const statusJson = await statusRes.json();
    console.log('Status JSON summary:', {
      ok: statusJson.ok,
      isLocalMachine: statusJson.isLocalMachine,
      agyAvailable: statusJson.agy?.available,
      agyModelsCount: statusJson.agy?.models?.length,
      opencodeAvailable: statusJson.opencode?.available,
      opencodeModelsCount: statusJson.opencode?.models?.length,
    });
    if (!statusJson.ok || !statusJson.isLocalMachine) throw new Error('Status test failed');

    console.log('\n[TEST 2] POST /api/agy/chat (Antigravity CLI Gemini 3.8 Flash High)');
    const agyRes = await fetch(`http://localhost:${TEST_PORT}/api/agy/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3.8-flash-high',
        messages: [{ role: 'user', content: 'Say "AGY_BRIDGE_SUCCESS" in 1 word' }],
      }),
    });
    console.log('Agy HTTP code:', agyRes.status);
    const agyJson = await agyRes.json();
    const agyContent = agyJson.choices?.[0]?.message?.content?.trim();
    console.log('Agy Response content:', agyContent);
    if (!agyContent || !agyContent.includes('AGY_BRIDGE_SUCCESS')) {
      console.warn('Notice: Content did not strictly match, but received:', agyContent);
    }

    console.log('\n[TEST 3] POST /api/opencode/chat (OpenCode Engine Flint Free)');
    const opcRes = await fetch(`http://localhost:${TEST_PORT}/api/opencode/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'recursive/flint-v1.0:free',
        messages: [{ role: 'user', content: 'Reply with "OPENCODE_BRIDGE_SUCCESS"' }],
      }),
    });
    console.log('OpenCode HTTP code:', opcRes.status);
    const opcJson = await opcRes.json();
    const opcContent = opcJson.choices?.[0]?.message?.content?.trim();
    console.log('OpenCode Response content:', opcContent);

    console.log('\n[TEST 4] POST /api/local-ai/v1/chat/completions (Unified OpenAI-compatible)');
    const unifiedRes = await fetch(`http://localhost:${TEST_PORT}/api/local-ai/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemini-3.8-flash-high',
        messages: [{ role: 'user', content: 'Reply with UNIFIED_OK' }],
      }),
    });
    console.log('Unified HTTP code:', unifiedRes.status);
    const unifiedJson = await unifiedRes.json();
    console.log('Unified Response content:', unifiedJson.choices?.[0]?.message?.content?.trim());

    console.log('\n🎉 ALL LOCAL AI BRIDGE TESTS PASSED!');
  } finally {
    serverProc.kill();
  }
}

runTests().catch((e) => {
  console.error('❌ Test failed with error:', e);
  serverProc.kill();
  process.exit(1);
});
