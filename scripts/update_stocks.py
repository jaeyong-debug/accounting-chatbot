import yfinance as yf
from datetime import datetime
import pytz
import json, sys

KST = pytz.timezone('Asia/Seoul')

STOCKS = [
    {'symbol': '005930.KS', 'name': '삼성전자',      'sector': '반도체·IT',  'emoji': '📱'},
    {'symbol': '000660.KS', 'name': 'SK하이닉스',     'sector': '반도체·IT',  'emoji': '💾'},
    {'symbol': '035420.KS', 'name': 'NAVER',          'sector': '플랫폼·AI', 'emoji': '🟢'},
    {'symbol': '035720.KS', 'name': '카카오',          'sector': '플랫폼·AI', 'emoji': '💛'},
    {'symbol': '373220.KS', 'name': 'LG에너지솔루션',  'sector': '2차전지',   'emoji': '🔋'},
    {'symbol': '247540.KS', 'name': '에코프로비엠',    'sector': '2차전지',   'emoji': '⚡'},
    {'symbol': '005380.KS', 'name': '현대차',          'sector': '자동차',    'emoji': '🚗'},
    {'symbol': '000270.KS', 'name': '기아',            'sector': '자동차',    'emoji': '🚙'},
    {'symbol': '105560.KS', 'name': 'KB금융',          'sector': '금융',      'emoji': '🏦'},
    {'symbol': '055550.KS', 'name': '신한지주',        'sector': '금융',      'emoji': '🏛️'},
    {'symbol': '005490.KS', 'name': 'POSCO홀딩스',     'sector': '철강·소재', 'emoji': '🏗️'},
    {'symbol': '068270.KS', 'name': '셀트리온',        'sector': '바이오',    'emoji': '💊'},
]

def fmt_price(v):
    if v is None: return '-'
    return f"{int(v):,}원"

def fmt_pct(v):
    if v is None: return '-'
    sign = '+' if v >= 0 else ''
    return f"{sign}{v:.2f}%"

def color(v):
    if v is None: return '#888'
    return '#d32f2f' if v >= 0 else '#1565c0'

def arrow(v):
    if v is None: return '—'
    return '▲' if v >= 0 else '▼'

def fetch():
    all_syms = ['^KS11', '^KQ11'] + [s['symbol'] for s in STOCKS]
    results = {}
    print("Fetching data from Yahoo Finance...", flush=True)
    try:
        tickers = yf.Tickers(' '.join(all_syms))
        for sym in all_syms:
            try:
                t = tickers.tickers[sym]
                fi = t.fast_info
                price = fi.last_price
                prev  = fi.previous_close
                if price and prev:
                    chg = price - prev
                    pct = chg / prev * 100
                    results[sym] = {'price': price, 'change': chg, 'pct': pct,
                                    'volume': getattr(fi, 'three_month_average_volume', None)}
                else:
                    results[sym] = None
            except Exception as e:
                print(f"  {sym} error: {e}", flush=True)
                results[sym] = None
    except Exception as e:
        print(f"Fetch error: {e}", flush=True)
    return results

def build_html(data, now_kst):
    kospi = data.get('^KS11')
    kosdaq = data.get('^KQ11')
    date_str = now_kst.strftime('%Y년 %m월 %d일 %H:%M')
    wday = ['월', '화', '수', '목', '금', '토', '일'][now_kst.weekday()]

    # ── index cards ──────────────────────────────────────────
    def idx_card(title, d, flag):
        p = fmt_price(d['price']) if d else '-'
        pct = fmt_pct(d['pct']) if d else '-'
        chg_str = f"{arrow(d['pct'] if d else None)} {pct}"
        clr = color(d['pct'] if d else None)
        bg = '#fff3f3' if (d and d['pct'] >= 0) else '#f0f4ff'
        return f"""
        <div class="idx-card" style="background:{bg}">
          <div class="idx-flag">{flag}</div>
          <div class="idx-title">{title}</div>
          <div class="idx-price">{p}</div>
          <div class="idx-chg" style="color:{clr}">{chg_str}</div>
        </div>"""

    idx_html = idx_card('KOSPI', kospi, '🇰🇷') + idx_card('KOSDAQ', kosdaq, '📊')

    # ── stock rows grouped by sector ─────────────────────────
    sectors = {}
    for s in STOCKS:
        sec = s['sector']
        sectors.setdefault(sec, []).append(s)

    sec_html = ''
    for sec, items in sectors.items():
        rows = ''
        for s in items:
            d = data.get(s['symbol'])
            p    = fmt_price(d['price']) if d else '-'
            pct  = fmt_pct(d['pct']) if d else '-'
            chg  = f"{arrow(d['pct'] if d else None)} {pct}"
            clr  = color(d['pct'] if d else None)
            rows += f"""
            <tr>
              <td class="s-name">{s['emoji']} {s['name']}</td>
              <td class="s-price">{p}</td>
              <td class="s-chg" style="color:{clr}">{chg}</td>
            </tr>"""
        sec_html += f"""
        <div class="sec-block">
          <div class="sec-title">{sec}</div>
          <table class="s-table"><tbody>{rows}</tbody></table>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>장모님을 위한 주식투자 정보 - {date_str}</title>
<style>
:root{{--red:#d32f2f;--blue:#1565c0;--bg:#f5f7fa;--card:#fff;--border:#e0e0e0;--text:#212121}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Apple SD Gothic Neo','Malgun Gothic','맑은 고딕',sans-serif;
      background:var(--bg);color:var(--text);line-height:1.6;font-size:16px}}
.container{{max-width:880px;margin:0 auto;padding:16px}}
header{{background:linear-gradient(135deg,#1565c0,#0d47a1);color:#fff;
        padding:28px 20px;text-align:center;border-radius:16px;margin-bottom:20px;
        box-shadow:0 4px 20px rgba(21,101,192,.3)}}
header h1{{font-size:26px;margin-bottom:6px}}
header .sub{{font-size:14px;opacity:.85}}
.update-bar{{background:#fff;border:1px solid var(--border);border-radius:10px;
             padding:10px 16px;margin-bottom:20px;display:flex;align-items:center;
             justify-content:space-between;font-size:14px;color:#555}}
.update-bar .live{{display:flex;align-items:center;gap:6px;color:#1565c0;font-weight:600}}
.dot{{width:8px;height:8px;background:#4caf50;border-radius:50%;
      animation:pulse 1.5s infinite}}
@keyframes pulse{{0%,100%{{opacity:1}}50%{{opacity:.3}}}}
.idx-row{{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}}
.idx-card{{border-radius:12px;padding:18px;text-align:center;border:1px solid var(--border)}}
.idx-flag{{font-size:28px;margin-bottom:4px}}
.idx-title{{font-size:13px;color:#666;margin-bottom:4px}}
.idx-price{{font-size:22px;font-weight:700;margin-bottom:4px}}
.idx-chg{{font-size:15px;font-weight:600}}
.sec-block{{background:var(--card);border:1px solid var(--border);border-radius:12px;
            margin-bottom:14px;overflow:hidden}}
.sec-title{{background:#f0f4ff;padding:10px 16px;font-weight:700;font-size:15px;
            color:#1565c0;border-bottom:1px solid #dde4f5}}
.s-table{{width:100%;border-collapse:collapse}}
.s-table tr{{border-bottom:1px solid #f0f0f0}}
.s-table tr:last-child{{border-bottom:none}}
.s-table td{{padding:11px 16px}}
.s-name{{font-size:15px}}
.s-price{{text-align:right;font-weight:700;font-size:15px}}
.s-chg{{text-align:right;font-weight:600;font-size:14px;width:100px}}
.notice{{background:#fff8e1;border:1px solid #ffe082;border-radius:10px;
         padding:14px 16px;margin-top:20px;font-size:14px;color:#5d4037;line-height:1.7}}
footer{{text-align:center;color:#999;font-size:13px;margin-top:20px;padding:16px}}
@media(max-width:480px){{
  header h1{{font-size:20px}}
  .idx-price{{font-size:18px}}
  .s-name,.s-price{{font-size:14px}}
}}
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>📈 장모님을 위한 주식투자 정보</h1>
    <div class="sub">{date_str} ({wday}요일) · Yahoo Finance 실시간 연동</div>
  </header>

  <div class="update-bar">
    <span class="live"><span class="dot"></span> 자동 업데이트 중 (30분마다)</span>
    <span>최종: {date_str}</span>
  </div>

  <div class="idx-row">{idx_html}</div>

  {sec_html}

  <div class="notice">
    💡 <strong>투자 유의사항</strong><br>
    본 페이지는 Yahoo Finance 데이터를 30분마다 자동 갱신합니다. 주식 거래는 본인 판단 하에 신중하게 결정하세요.
    표시 가격은 전 거래일 종가 또는 장중 최근 데이터 기준이며, 실제 거래 가격과 차이가 있을 수 있습니다.
    <br><br>💝 재용 드림
  </div>

  <footer>
    자동 업데이트 · 데이터 출처: Yahoo Finance · GitHub Actions<br>
    {date_str} 생성
  </footer>
</div>
</body>
</html>"""
    return html

if __name__ == '__main__':
    now = datetime.now(KST)
    print(f"Update time: {now.strftime('%Y-%m-%d %H:%M:%S KST')}", flush=True)
    data = fetch()
    html = build_html(data, now)
    with open('stock-picks.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Written stock-picks.html ({len(html)} bytes)", flush=True)
