/**
 * 회계팀 챗봇 - Cloudflare Worker (백엔드 프록시)
 *
 * 환경변수 설정 필요:
 *   CLAUDE_API_KEY  : Anthropic API 키 (sk-ant-...)
 *   ADMIN_PASSWORD  : 관리자 패스워드 (admin1234)
 *
 * KV 네임스페이스:
 *   USAGE_KV        : 사용량 추적용 (wrangler.toml에 바인딩 필요)
 */

const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
const ALLOWED_ORIGIN = '*'; // 특정 도메인으로 변경 가능: 'https://jaeyong-debug.github.io'

// CORS 헤더
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
};

function corsJson(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function corsText(text, status = 200) {
  return new Response(text, {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' },
  });
}

// 현재 년월 (YYYY-MM)
function ym() {
  return new Date().toISOString().slice(0, 7);
}

// ─────────────────────────────────────
// 관리자 인증
// ─────────────────────────────────────
async function isAdmin(request, env) {
  const pw = request.headers.get('x-admin-password');
  return pw === env.ADMIN_PASSWORD;
}

// ─────────────────────────────────────
// 채팅 핸들러
// ─────────────────────────────────────
async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return corsJson({ error: '요청 형식 오류' }, 400);
  }

  const { messages, system, dept = 'unknown' } = body;

  if (!messages || !Array.isArray(messages)) {
    return corsJson({ error: 'messages 필드가 필요합니다' }, 400);
  }

  // 쿼터 확인
  if (env.USAGE_KV) {
    const quotaKey = `quota:${dept}`;
    const usageKey = `usage:${dept}:${ym()}`;
    const quotaStr = await env.USAGE_KV.get(quotaKey);
    const usageStr = await env.USAGE_KV.get(usageKey);

    if (quotaStr) {
      const quota = parseInt(quotaStr);
      const usage = JSON.parse(usageStr || '{"requests":0}');
      if (usage.requests >= quota) {
        return corsJson({
          error: `이번 달 사용량 한도(${quota}건)에 도달했습니다. 관리자에게 문의하세요.`,
          quota_exceeded: true,
        }, 429);
      }
    }
  }

  // Claude API 호출
  let claudeRes;
  try {
    claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: system || '',
        messages,
      }),
    });
  } catch (e) {
    return corsJson({ error: 'Claude API 연결 실패: ' + e.message }, 502);
  }

  let data;
  try {
    data = await claudeRes.json();
  } catch (e) {
    return corsJson({ error: 'Claude API 응답 파싱 실패' }, 502);
  }

  if (!claudeRes.ok) {
    return corsJson({ error: data?.error?.message || 'Claude API 오류', status: claudeRes.status }, claudeRes.status);
  }

  // 사용량 기록
  if (env.USAGE_KV) {
    const usageKey = `usage:${dept}:${ym()}`;
    const current = JSON.parse(await env.USAGE_KV.get(usageKey) || '{"tokens":0,"requests":0}');
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    current.tokens += tokensUsed;
    current.requests += 1;
    await env.USAGE_KV.put(usageKey, JSON.stringify(current), { expirationTtl: 60 * 60 * 24 * 90 }); // 90일 보관

    // 전체 합계도 기록
    const totalKey = `usage:_total:${ym()}`;
    const total = JSON.parse(await env.USAGE_KV.get(totalKey) || '{"tokens":0,"requests":0}');
    total.tokens += tokensUsed;
    total.requests += 1;
    await env.USAGE_KV.put(totalKey, JSON.stringify(total), { expirationTtl: 60 * 60 * 24 * 90 });
  }

  return corsJson(data);
}

// ─────────────────────────────────────
// 관리자: 통계 조회
// ─────────────────────────────────────
async function handleAdminStats(request, env) {
  if (!await isAdmin(request, env)) return corsText('Unauthorized', 401);

  if (!env.USAGE_KV) return corsJson({ error: 'KV 스토리지가 설정되지 않았습니다' }, 503);

  const month = new URL(request.url).searchParams.get('month') || ym();

  // 이번 달 전체 부서 사용량 조회
  const list = await env.USAGE_KV.list({ prefix: `usage:` });
  const stats = { month, depts: {}, total: { tokens: 0, requests: 0 } };

  for (const key of list.keys) {
    if (!key.name.includes(`:${month}`)) continue;
    const parts = key.name.split(':'); // usage:{dept}:{YYYY-MM}
    const dept = parts[1];
    if (dept === '_total') continue;
    const val = JSON.parse(await env.USAGE_KV.get(key.name) || '{"tokens":0,"requests":0}');
    stats.depts[dept] = val;
    stats.total.tokens += val.tokens;
    stats.total.requests += val.requests;
  }

  // 비용 계산 (Claude Haiku: input $0.80/MTok, output $4.00/MTok - 약 평균 $1.5/MTok)
  stats.total.estimated_cost_usd = ((stats.total.tokens / 1_000_000) * 1.5).toFixed(4);
  stats.total.estimated_cost_krw = Math.round(stats.total.tokens / 1_000_000 * 1.5 * 1380);

  // 할당량 조회
  const quotaList = await env.USAGE_KV.list({ prefix: 'quota:' });
  stats.quotas = {};
  for (const key of quotaList.keys) {
    const dept = key.name.replace('quota:', '');
    stats.quotas[dept] = parseInt(await env.USAGE_KV.get(key.name));
  }

  return corsJson(stats);
}

// ─────────────────────────────────────
// 관리자: 쿼터 설정
// ─────────────────────────────────────
async function handleAdminSetQuota(request, env) {
  if (!await isAdmin(request, env)) return corsText('Unauthorized', 401);

  let body;
  try { body = await request.json(); } catch (e) { return corsJson({ error: '형식 오류' }, 400); }

  const { dept, limit } = body;
  if (!dept || typeof limit !== 'number') return corsJson({ error: 'dept, limit 필드 필요' }, 400);

  await env.USAGE_KV.put(`quota:${dept}`, String(limit));
  return corsJson({ ok: true, dept, limit });
}

// ─────────────────────────────────────
// 관리자: 시스템 프롬프트 업데이트
// ─────────────────────────────────────
async function handleAdminUpdateKnowledge(request, env) {
  if (!await isAdmin(request, env)) return corsText('Unauthorized', 401);

  let body;
  try { body = await request.json(); } catch (e) { return corsJson({ error: '형식 오류' }, 400); }

  if (!body.system_prompt) return corsJson({ error: 'system_prompt 필드 필요' }, 400);

  await env.USAGE_KV.put('system_prompt', body.system_prompt);
  return corsJson({ ok: true, length: body.system_prompt.length });
}

// ─────────────────────────────────────
// 관리자: 시스템 프롬프트 조회
// ─────────────────────────────────────
async function handleAdminGetKnowledge(request, env) {
  if (!await isAdmin(request, env)) return corsText('Unauthorized', 401);

  const prompt = await env.USAGE_KV.get('system_prompt');
  return corsJson({ system_prompt: prompt || null });
}

// ─────────────────────────────────────
// 메인 라우터
// ─────────────────────────────────────
export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === '/chat' && method === 'POST') return handleChat(request, env);
    if (path === '/admin/stats' && method === 'GET') return handleAdminStats(request, env);
    if (path === '/admin/quota' && method === 'POST') return handleAdminSetQuota(request, env);
    if (path === '/admin/knowledge' && method === 'GET') return handleAdminGetKnowledge(request, env);
    if (path === '/admin/knowledge' && method === 'POST') return handleAdminUpdateKnowledge(request, env);
    if (path === '/health') return corsJson({ ok: true, model: CLAUDE_MODEL });

    return corsText('회계팀 챗봇 API\nEndpoints: POST /chat, GET /admin/stats, POST /admin/quota', 200);
  },
};
