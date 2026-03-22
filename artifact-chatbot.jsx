import { useState, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════
   지식 베이스
═══════════════════════════════════════════════════════ */
const KB = {
  managers: [
    { keys: ['봄툰'], name: '고수희 매니저', area: '봄툰사업본부' },
    { keys: ['레진사업본부','레진사업부','레진기획','레진ui','레진cr','레진마케팅','레진미주'], name: '민지영 매니저', area: '레진사업본부' },
    { keys: ['일본사업본부','일본사업부','jp제작','jp기획'], name: '고수희 매니저', area: '일본사업본부' },
    { keys: ['shinano','시나노'], name: '민지영 매니저', area: 'Shinano KR' },
    { keys: ['브랜드콘텐츠','미디어제작','콘텐츠디자인'], name: '오민지 매니저', area: '브랜드콘텐츠부' },
    { keys: ['글로벌콘텐츠','아시아콘텐츠','유럽콘텐츠','미주콘텐츠','현지화'], name: '최은아 매니저', area: '글로벌콘텐츠부' },
    { keys: ['유럽태국','유럽/태국'], name: '김민정(B) 매니저', area: '유럽/태국사업본부' },
    { keys: ['delitoon','델리툰'], name: '김민정(B) 매니저', area: 'DELITOON SAS' },
    { keys: ['기술부문','플랫폼기술','레봄개발','발코니','백오피스'], name: '유지수 매니저', area: '기술부문' },
    { keys: ['커머스','md사업','굿즈'], name: '남우영 매니저', area: '커머스사업본부(MD사업부)' },
    { keys: ['소설사업','소설편집'], name: '최은아 매니저', area: '소설사업부' },
    { keys: ['웹툰사업','국내사업'], name: '고수희 매니저', area: '웹툰사업부' },
    { keys: ['영상콘텐츠','영상사업'], name: '유지수 매니저', area: '영상콘텐츠사업본부' },
    { keys: ['스튜디오m','am센터'], name: '박찬민 매니저', area: '스튜디오M/AM센터' },
    { keys: ['소싱1팀','플랫폼소싱'], name: '박찬민 매니저', area: '콘텐츠소싱본부(소싱1팀)' },
    { keys: ['소싱2팀','편집부','편집팀'], name: '송선아 매니저', area: '콘텐츠소싱본부(편집부)' },
    { keys: ['경영지원','경영관리','재무기획','경영기획'], name: '유지수 매니저', area: '경영지원본부' },
    { keys: ['lezhin jp','레진jp','일본 법인'], name: '최은아 매니저', area: 'Lezhin JP' },
    { keys: ['lezhin us','레진us','미국 법인'], name: '오민지 매니저', area: 'Lezhin US' },
    { keys: ['kidari th','태국법인'], name: '김재용 팀장', area: 'Kidari TH' },
    { keys: ['급여','원천세','연말정산'], name: '최은아 매니저', area: '급여/원천세' },
    { keys: ['정산 레진','레진 정산'], name: '김민정(B) 매니저', area: '정산(레진)' },
    { keys: ['정산 키다리','키다리 정산'], name: '남우영 매니저', area: '정산(키다리/DELITOON)' },
    { keys: ['세무조정','부가가치세'], name: '김재용 팀장', area: '세무조정/부가세' },
  ],
  allManagers: [
    { area: '봄툰사업본부', name: '고수희 매니저' },
    { area: '레진사업본부(플랫폼사업부문)', name: '민지영 매니저' },
    { area: '일본사업본부', name: '고수희 매니저' },
    { area: 'Shinano KR', name: '민지영 매니저' },
    { area: '브랜드콘텐츠부', name: '오민지 매니저' },
    { area: '글로벌콘텐츠부', name: '최은아 매니저' },
    { area: '유럽/태국사업본부', name: '김민정(B) 매니저' },
    { area: 'DELITOON SAS', name: '김민정(B) 매니저' },
    { area: '기술부문', name: '유지수 매니저' },
    { area: '커머스사업본부(MD사업부)', name: '남우영 매니저' },
    { area: '소설사업부', name: '최은아 매니저' },
    { area: '웹툰사업부', name: '고수희 매니저' },
    { area: '영상콘텐츠사업본부', name: '유지수 매니저' },
    { area: '스튜디오M/AM센터', name: '박찬민 매니저' },
    { area: '콘텐츠소싱본부', name: '박찬민/송선아 매니저' },
    { area: '경영지원본부', name: '유지수 매니저' },
    { area: '법인카드(키다리법인)', name: '유지수 매니저' },
    { area: '법인카드(레진법인)', name: '김민정(B) 매니저' },
    { area: 'Lezhin JP', name: '최은아 매니저' },
    { area: 'Lezhin US', name: '오민지 매니저' },
    { area: 'Kidari TH', name: '김재용 팀장' },
    { area: '급여/원천세', name: '최은아 매니저' },
    { area: '세무조정/부가세', name: '김재용 팀장' },
  ],
  qa: [
    {
      keys: ['erp10 전표','법인카드 전표 입력','전표 입력 방법','법인카드거래내역','카드 전표','법인카드 전표'],
      cat: 'card',
      answer: `💳 ERP10 법인카드 전표 입력 방법

① 화면 접속
ERP10 로그인 → '법인카드거래내역' 검색 후 접속

② 사용자 검색
돋보기 클릭 → 사용자이관여부 체크 ✓ 필수(카카오T 내역 반영) → 사원명 입력 → 선택 → 적용

③ 카드번호 검색
돋보기 → 카드번호 선택 → 적용

④ 이용 내역 조회
조회 조건 입력 → 조회 버튼

⑤ 전표 입력 (건별)
상대계정처리유형 선택 → 적요 / 회계일자(카드사용월 말일) / 비용센터 입력

⑥ 전표 입력 (일괄)
여러 건 선택 → 회계일자·상대계정·부가세구분(부가세미처리/봉사료미처리)·비용센터·적요 입력

⑦ 부가세 처리
불공제여부 선택 ✓ / 공통매입여부 선택 ✗

⑧ 전표 처리
내역 선택 → 저장 → 전표 버튼 → 전표처리 → 일괄 전표처리 권장

⑨ 분할 처리
건 선택 → 추가기능 → 분할처리 → 추가 → 금액 분할 → 차이 '0원' 확인

⑩ 전자결재 상신
전표조회승인 메뉴 → 전표 선택 → 결재 버튼

⑪ 전표 취소
전표처리 YES 조회 → 전표버튼 → 전표취소

📋 결재라인
기안자 → 팀장 → 수신: 회계팀 담당자 → 회계팀장`
    },
    {
      keys: ['카카오t','카카오 택시','택시'],
      cat: 'card',
      answer: `🚕 카카오T 택시 처리

전표 입력 시 사용자이관여부 체크 ✓ 필수!

① ERP10 → 법인카드거래내역 접속
② 사용자 검색 돋보기 클릭
③ 사용자이관여부 체크 ✓ (미체크 시 카카오T 내역 조회 불가)
④ 사원명 입력 → 선택 → 적용
⑤ 이후 일반 전표 입력과 동일`
    },
    {
      keys: ['재발급','분실신고','카드 분실','법인카드 분실'],
      cat: 'card',
      answer: `🔒 법인카드 재발급/분실신고

재발급 소요 기간
• 신한카드: 재무기획팀 접수 후 약 7영업일
• 삼성카드: 삼성카드 홈페이지에서 직접 신청(개인 기명식)

담당자
• 키다리법인: 유지수 매니저
• 레진법인: 김민정(B) 매니저

⚠️ 레진 카드 재발급 시
반드시 김성준 매니저에게 알려주세요 (수기 ERP 등록 필요)

분실 시 먼저 카드사에 분실신고 후 재무기획팀 연락`
    },
    {
      keys: ['한도','한도 상향','한도초과'],
      cat: 'card',
      answer: `💳 법인카드 한도 안내

한도 조회
• 신한카드: 재무기획팀 문의
• 삼성카드: 앱에서 직접 확인

한도 상향 신청
그룹웨어 기안 → '법인카드 한도 상향 신청' 작성
신청 사유·금액·근거 명확히 기재

담당: 키다리 - 김나영M / 레진 - 김성준M`
    },
    {
      keys: ['미수금'],
      cat: 'card',
      answer: `💳 법인카드 미수금

전표 입력 시 거래처명을 본인 성명으로 입력

예산 배정·잔액 관련 문의는 경영기획팀으로 문의`
    },
    {
      keys: ['결산','마감 일정','결산마감','마감 공지'],
      cat: 'voucher',
      answer: `📅 결산 마감 일정 (전사 공통)

구분 | 마감 기한
법인카드 전표 | 영업일 기준 3일차
매출·매입 전표 | 영업일 기준 4일차

마감 지연 시
• '지연 건'으로 집계 → 해당 사업부장 책임으로 경영진 보고
• '몰랐다', '늦게 전달받았다' 등 사유는 면책 불인정
• 상신 후 반려·재상신은 지연 미집계

해외 법인(레진US, 레진JP, 델리툰)
업무기안 후 회계팀 담당자가 별도 전표 처리

⚠️ 인사발령 대상자는 발령 전 법인카드 처리 필수`
    },
    {
      keys: ['위임전결','전결규정','결재기준','100만원','대표이사 결재','플랫폼 총괄'],
      cat: 'voucher',
      answer: `📋 위임전결규정 (2026년 기준)

▶ 플랫폼 총괄 각자대표 산하
(플랫폼사업부문, 유럽/태국사업본부, 글로벌콘텐츠본부, 기술부문)
→ 100만원 이상: 대표이사 결재 필수
• MG/RS 지급: 기존 업무기안 완료 시 전표는 본부장까지
• 작가 선지급: 업무기안 대표이사 결재 후 전표도 대표이사 결재 필

▶ 커머스/사업지원 총괄 산하
(커머스사업본부, 스토리웨어사업본부, 영상콘텐츠, 콘텐츠본부, 경영지원)
→ 기존 결재라인 유지

전표 결재라인
100만원 이상: 현업→팀장→본부장→부문장→대표이사
100만원 미만: 현업→팀장
수신(공통): 회계팀 담당자 → 회계팀장

⚠️ 수신자에 회계팀 담당자 누락 시 전표 확인 및 지급처리 불가`
    },
    {
      keys: ['결재선 설정','결재선 즐겨찾기','그룹웨어 결재'],
      cat: 'voucher',
      answer: `⚙️ 그룹웨어 결재선 즐겨찾기 설정

경로: 전자결재 → 결재정보(상단) → 결재선 설정 팝업

① 전결규정에 맞는 결재선 작성
② 즐겨찾기 등록 버튼 클릭
③ 이후 기안 작성 시 즐겨찾기에서 불러오기

결재 단계 정의
• 합의: 적정성·리스크 검토 (의사결정 권한 보유)
• 수신: 실제 처리·집행 단계
• 참조: 결과를 사후 인지

합의는 최종 전결권자 이전 단계에 배치`
    },
    {
      keys: ['전표처리','전표 처리','전표입력','전표 작성'],
      cat: 'voucher',
      answer: `📄 전표 처리 기본 방법

원칙: 내부회계관리규정에 따라 각 사업부에서 손익 발생 전표를 직접 입력

필수 확인사항
• 작성일자 정확히 입력
• 관리항목(비용센터 등) 누락 없이
• 부가세 항목 확인
• 위임전결규정에 따른 업무기안 사전 결재 완료 여부

매출 전표: 매출정산시스템 사용 필수
매입 전표: 해당 사업부에서 직접 입력

익숙하지 않은 전표는 상신 전 저장 후 회계팀에 검토 요청`
    },
    {
      keys: ['반려','반려 사유','전표 반려'],
      cat: 'voucher',
      answer: `↩️ 전표/기안 반려 주요 사유

• 작성일자 오류
• 관리항목(비용센터 등) 누락
• 부가세 항목 미처리
• 위임전결규정 미준수
• 업무기안 없이 전표만 단독 작성
• 결재라인 수신자에 회계팀 담당자 누락

반려 사유 확인 후 수정 → 재상신
(재상신은 지연으로 집계되지 않음)`
    },
    {
      keys: ['회계일자','전표 일자'],
      cat: 'voucher',
      answer: `📅 회계일자 입력 기준

법인카드 전표: 카드 사용 월의 말일자
예) 1월 사용 → 1/31, 2월 사용 → 2/28

매출/매입 전표: 해당 거래 발생일 기준

불공제여부: 선택 ✓ / 공통매입여부: 선택 ✗`
    },
    {
      keys: ['거래처등록','거래처 등록','신규 거래처','통합거래처'],
      cat: 'vendor',
      answer: `🏢 거래처 등록 방법 (신규)

STEP 1. 중복 확인 (필수)
ERP → '거래처정보조회' → 거래처구분 '전체'로 변경 후 검색

STEP 2. 거래처 구분 선택
• 주요(사업자번호O): 법인, 개인사업자
• 개인(내/외국인): 주민번호 있는 개인(작가 등)
• 외국법인 / 기타

STEP 3. 등록 (주요)
'통합거래처등록요청' → 추가 → 사업자정보 입력
→ 거래조건 '통합' → 계좌정보(주요사용:YES) → 저장 → 전자결재 상신

첨부 필수
• 사업자등록증 + 계좌사본
• 최초 등록: 계약기안 링크 첨부 필수

결재라인
본인 → 팀장 → 재무기획팀(키다리:김나영M / 레진:김성준M) → 심우성 팀장

⚠️ 거래처구분 잘못 설정 시 전자결재 완료 후에도 미등록됨!`
    },
    {
      keys: ['개인 거래처','작가 등록','개인 등록'],
      cat: 'vendor',
      answer: `👤 개인 거래처 등록 (작가 등)

• 거래처명 = 신분증 상 성명
• 내/외국인 구분 선택
• 주민번호 입력 (외국인 공란 → 자동 생성)

원천세정보 (필수)
• 업종구분 선택 필수
  - 작가: 화가관련 (940200)
  - 번역 등 외주자: 기타자영업 (940909)
• 작가 필명은 비고란에 입력

결재라인: 본인 → 팀장 → 재무기획팀 → 심우성 팀장`
    },
    {
      keys: ['계좌등록','계좌 등록','계좌 추가'],
      cat: 'vendor',
      answer: `🏦 계좌 등록 방법

ERP → '거래처계좌정보신청' 메뉴

국내 계좌
돋보기로 거래처 검색 → 추가 → 계좌 입력(주요사용:YES) → 통장사본 첨부

해외 계좌 (영문 필수)
• SWIFT CODE: 반드시 11자리 (8자리면 뒤에 'XXX' 추가)
  예) WFBIUS6S → WFBIUS6SXXX
• 수취인명/수취은행명/계좌/주소 영문 입력

미작성 항목 있으면 송금 불가

결재라인: 본인 → 팀장 → 재무기획팀 → 심우성 팀장`
    },
    {
      keys: ['사업자번호 중복','중복 오류','거래처 중복'],
      cat: 'vendor',
      answer: `⚠️ 중복된 사업자번호/주민번호 오류

원인: 키레델ERP 키다리·레진 통합거래처 사용으로 발생

해결 방법
재무기획팀에 이메일로 등록거래처 변경 요청
• 키다리 담당: 이홍주 매니저
• 레진 담당: 서보미 매니저`
    },
    {
      keys: ['기등록 거래처','거래처 수정','거래처 변경'],
      cat: 'vendor',
      answer: `✏️ 기등록 거래처 정보 수정

① '거래처정보조회'에서 해당 거래처 확인
② 그룹웨어 → "거래처 및 계좌 정보 등록(변경)" 기안 작성
③ 비고란에 거래처코드 기입
④ 변경 증빙 첨부 (사업자등록증/변경요청공문)

결재라인: 본인 → 팀장 → 재무기획팀 → 심우성 팀장`
    },
    {
      keys: ['세금계산서','계산서 발행'],
      cat: 'tax',
      answer: `🧾 세금계산서 발행/수정

• 매출 전표 시 매출정산시스템 사용 필수
• 거래처와 수수 사전 조율 필수
• 마감: 영업일 4일차

수정세금계산서: 담당 회계팀원에게 문의`
    },
    {
      keys: ['부가세','부가가치세','vat'],
      cat: 'tax',
      answer: `💰 부가세(VAT) 신고 일정

• 1기 예정: 4월 25일
• 1기 확정: 7월 25일
• 2기 예정: 10월 25일
• 2기 확정: 다음해 1월 25일

담당: 김재용 팀장 (세무조정/부가세)`
    },
    {
      keys: ['원천징수','지급명세서','원천세'],
      cat: 'tax',
      answer: `📑 원천징수/지급명세서

• 원천징수영수증: 매년 2월 발급
• 근로소득 지급명세서: 3월 10일
• 사업소득 지급명세서: 2월 말일

담당: 최은아 매니저 (급여/원천세)`
    },
    {
      keys: ['경비정산','비용정산','지출결의'],
      cat: 'expense',
      answer: `💸 경비정산 방법

① 영수증/증빙 수집
② 업무기안 결재 완료
③ ERP에서 전표 직접 입력
④ 결재 상신

담당: 본인 사업부 담당 회계팀원`
    },
    {
      keys: ['해외출장','출장비'],
      cat: 'expense',
      answer: `✈️ 해외출장비 처리

① 출장 업무기안 결재 완료(사전)
② 출장 후 영수증 수집
③ 전표 처리: 계정과목 여비교통비
④ 해외법인(레진US/JP, 델리툰): 업무기안 후 회계팀 담당자 별도 처리`
    },
    {
      keys: ['급여','지급일'],
      cat: 'expense',
      answer: `📆 정기 지급 일정

• 급여: 매월 25일
• 정산 지급: 매월 마감 공지에 따라 안내

담당: 본인 사업부 담당 회계팀원`
    },
    {
      keys: ['급여명세서'],
      cat: 'etc',
      answer: `💴 급여명세서

매월 급여 지급일에 그룹웨어를 통해 발송됩니다.

담당: 최은아 매니저 (급여/원천세)`
    },
    {
      keys: ['해촉증명서','연재증명서','증명서 발급'],
      cat: 'etc',
      answer: `📜 해촉/연재 증명서 발급

① 담당 회계팀원에게 발급 요청
② 필요 정보: 성명, 연재 기간, 용도`
    },
    {
      keys: ['예산단위','예산 초과','예산 오류'],
      cat: 'etc',
      answer: `📊 예산단위/예산 관련

예산 배정·잔액 관련 문의는 경영기획팀으로 사전 협의 후 집행

• 회계팀은 전표 승인만 담당
• 사전 협의 없이 마감 후 제출된 건은 가기표 처리될 수 있음`
    },
  ]
};

/* ═══════════════════════════════════════════════════════
   퀵버튼 데이터
═══════════════════════════════════════════════════════ */
const QUICK_BTNS = {
  home:    ['법인카드 전표 입력 방법','결산 마감 일정','거래처 등록 방법','위임전결규정','담당자 찾기','세금계산서 발행'],
  card:    ['ERP10 전표 입력 방법','재발급/분실신고','한도 문의','카카오T 택시','미수금 처리','결제취소','식대 처리'],
  voucher: ['전표 처리 방법','결산 마감 일정','위임전결규정','결재라인 설정','회계일자 기준','전표 반려 처리'],
  vendor:  ['거래처 등록 방법','개인 거래처 등록','계좌 등록 방법','중복 오류 처리','기등록 거래처 수정'],
  tax:     ['세금계산서 발행','부가세 신고 일정','원천징수/지급명세서'],
  expense: ['경비정산 방법','해외출장비 처리','정기 지급 일정'],
  manager: ['담당자 전체 목록','봄툰 담당자','기술부문 담당자','법인카드 담당자'],
  etc:     ['급여명세서 문의','해촉 증명서 발급','예산단위 오류'],
};

const MENUS = [
  { id: 'home',    label: '처음으로',     icon: '🏠' },
  { id: 'card',    label: '법인카드',     icon: '💳' },
  { id: 'voucher', label: '전표 / 결산',  icon: '📄' },
  { id: 'vendor',  label: '거래처 / 계좌', icon: '🏢' },
  { id: 'tax',     label: '세금 / 세무',  icon: '🧾' },
  { id: 'expense', label: '경비 / 정산',  icon: '✈️' },
  { id: 'manager', label: '담당자 찾기',  icon: '👤' },
  { id: 'etc',     label: '기타',        icon: '❓' },
];

/* ═══════════════════════════════════════════════════════
   응답 처리 함수
═══════════════════════════════════════════════════════ */
function processQuery(text) {
  const lq = text.toLowerCase().replace(/\s+/g, ' ');

  // 전체 담당자 목록
  if (lq.includes('전체 담당자') || lq.includes('담당자 목록') || lq.includes('담당자 전체')) {
    return { type: 'managers' };
  }

  // 담당자 검색
  if (lq.includes('담당자') || lq.includes('누구') || lq.includes('담당')) {
    for (const m of KB.managers) {
      if (m.keys.some(k => lq.includes(k.toLowerCase()))) {
        return { type: 'text', text: `📌 **${m.area}** 담당자는\n➡️ **${m.name}** 입니다.` };
      }
    }
  }

  // Q&A 매칭
  for (const rule of KB.qa) {
    if (rule.keys.some(k => lq.includes(k.toLowerCase()))) {
      return { type: 'text', text: rule.answer };
    }
  }

  // 담당자 재시도
  for (const m of KB.managers) {
    if (m.keys.some(k => lq.includes(k.toLowerCase()))) {
      return { type: 'text', text: `📌 **${m.area}** 담당자는\n➡️ **${m.name}** 입니다.` };
    }
  }

  return {
    type: 'text',
    text: `죄송합니다, 해당 내용을 찾지 못했습니다. 😔\n\n왼쪽 메뉴에서 카테고리를 선택하거나 회계팀으로 직접 문의해 주세요.\n📧 accounting_fi@kidaristudio.com`
  };
}

/* ═══════════════════════════════════════════════════════
   컴포넌트
═══════════════════════════════════════════════════════ */
export default function AccountingChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'bot',
      text: '안녕하세요! 👋 **키다리스튜디오 회계팀 챗봇**입니다.\n\n왼쪽 메뉴에서 카테고리를 선택하거나, 자주 묻는 질문 버튼을 눌러주세요.\n직접 질문을 입력하셔도 됩니다.'
    }
  ]);
  const [input, setInput] = useState('');
  const [cat, setCat] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  function addMessage(role, text, extra) {
    setMessages(prev => [...prev, { id: Date.now(), role, text, ...extra }]);
  }

  function handleSend(text) {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    addMessage('user', q);

    setTimeout(() => {
      const result = processQuery(q);
      if (result.type === 'managers') {
        addMessage('bot', '', { managers: KB.allManagers });
      } else {
        addMessage('bot', result.text);
      }
    }, 300);
  }

  function selectCat(id) {
    setCat(id);
    setSidebarOpen(false);
    if (id === 'manager') {
      addMessage('bot', '👤 **담당자 찾기**\n\n사업부명을 입력하거나 아래 버튼을 눌러주세요.', {
        extra: [{ label: '📋 전체 담당자 보기', action: () => addMessage('bot', '', { managers: KB.allManagers }) }]
      });
    }
  }

  // 텍스트 포매팅 (bold, 줄바꿈)
  function formatText(text) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  }

  const quicks = QUICK_BTNS[cat] || QUICK_BTNS.home;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", background: '#f0f2f5', overflow: 'hidden' }}>

      {/* 오버레이 */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 90 }}
        />
      )}

      {/* 사이드바 */}
      <nav style={{
        width: 220, minWidth: 220, background: '#1a2236', display: 'flex', flexDirection: 'column',
        position: window.innerWidth <= 700 ? 'fixed' : 'relative',
        left: 0, top: 0, bottom: 0, zIndex: 100,
        transform: window.innerWidth <= 700 && !sidebarOpen ? 'translateX(-100%)' : 'none',
        transition: 'transform 0.3s',
      }}>
        <div style={{ padding: '18px 16px 14px', background: '#111827', borderBottom: '1px solid #2d3a50' }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>💼 회계팀 챗봇</div>
          <div style={{ color: '#8b9ab5', fontSize: 11, marginTop: 3 }}>키다리스튜디오 재무회계</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          {MENUS.map(m => (
            <div
              key={m.id}
              onClick={() => selectCat(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px',
                color: cat === m.id ? '#5ba8ff' : '#b0bdd0', fontSize: 13.5, cursor: 'pointer',
                borderLeft: `3px solid ${cat === m.id ? '#5ba8ff' : 'transparent'}`,
                background: cat === m.id ? '#1e3a5f' : 'transparent',
                fontWeight: cat === m.id ? 600 : 400,
                transition: 'all 0.18s',
              }}
            >
              <span style={{ fontSize: 17, width: 22, textAlign: 'center' }}>{m.icon}</span>
              {m.label}
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 16px', borderTop: '1px solid #2d3a50' }}>
          <div style={{ color: '#6b7a94', fontSize: 11, marginBottom: 6 }}>📧 이외 문의사항</div>
          <a href="mailto:accounting_fi@kidaristudio.com" style={{ color: '#8b9ab5', fontSize: 11.5, textDecoration: 'none', wordBreak: 'break-all' }}>
            accounting_fi@kidaristudio.com
          </a>
        </div>
      </nav>

      {/* 메인 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* 상단바 */}
        <div style={{ background: '#fff', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e8ed', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: window.innerWidth <= 700 ? 'flex' : 'none', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#374151' }}
            >☰</button>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>회계팀 챗봇</span>
            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>무엇이든 물어보세요</span>
          </div>
          <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, border: '1px solid #bfdbfe' }}>
            {MENUS.find(m => m.id === cat)?.label || '전체'}
          </span>
        </div>

        {/* 채팅 영역 */}
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex', gap: 10, maxWidth: '84%',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: msg.role === 'user' ? '#6b7280' : '#2563eb',
                color: '#fff', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2
              }}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>

              <div>
                <div style={{
                  padding: '11px 15px',
                  borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  background: msg.role === 'user' ? '#2563eb' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1f2937',
                  fontSize: 13.5, lineHeight: 1.7,
                  boxShadow: msg.role === 'bot' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {formatText(msg.text)}

                  {/* 전체 담당자 테이블 */}
                  {msg.managers && (
                    <div style={{ marginTop: 8, overflowX: 'auto' }}>
                      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12.5 }}>
                        <thead>
                          <tr style={{ background: '#eff6ff' }}>
                            <th style={{ padding: '6px 10px', border: '1px solid #dbeafe', textAlign: 'left' }}>사업부/담당업무</th>
                            <th style={{ padding: '6px 10px', border: '1px solid #dbeafe', textAlign: 'left' }}>담당자</th>
                          </tr>
                        </thead>
                        <tbody>
                          {msg.managers.map((r, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                              <td style={{ padding: '5px 10px', border: '1px solid #e5e7eb' }}>{r.area}</td>
                              <td style={{ padding: '5px 10px', border: '1px solid #e5e7eb', fontWeight: 600, color: '#1d4ed8' }}>{r.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 추가 액션 버튼 */}
                  {msg.extra && msg.extra.map((e, i) => (
                    <button
                      key={i}
                      onClick={e.action}
                      style={{ marginTop: 8, background: '#fff', border: '1px solid #d1d5db', color: '#374151', fontSize: 12.5, padding: '6px 13px', borderRadius: 20, cursor: 'pointer' }}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 퀵버튼 */}
        <div style={{ padding: '10px 20px 0', flexShrink: 0 }}>
          <div style={{ fontSize: 11.5, color: '#9ca3af', marginBottom: 6 }}>자주 묻는 질문</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {quicks.map(q => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                style={{ background: '#fff', border: '1px solid #d1d5db', color: '#374151', fontSize: 12.5, padding: '6px 13px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                ✦ {q}
              </button>
            ))}
          </div>
        </div>

        {/* 입력 영역 */}
        <div style={{ padding: '12px 20px 16px', background: '#fff', borderTop: '1px solid #e5e8ed', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="궁금한 내용을 입력하세요..."
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: 24, fontSize: 13.5, outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={() => handleSend()}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '50%', width: 40, height: 40, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
