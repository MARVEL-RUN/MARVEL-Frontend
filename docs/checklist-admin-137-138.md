# 관리자 #137 · #138 체크리스트

브랜치: `dev/#137-138-admin-followup`

---

## #137 design: 관리자 참가신청 UI/UX 구성 변경

> design: 관리자 참가신청 UI/UX 구성 변경

### 기능 설명

- #128 #132 API 연동은 끝났고, 관리자 화면 구성·표시만 정리
- 대회 선택 → 목록 → 상세 흐름을 한 IA로 맞추고, 마블런/버추얼에 맞게 필터·컬럼·상세 필드를 나눔

### 세부 작업 항목 (남음)

- [ ] 목록 주문번호 등 빠진 표시 값 맞춤

### 잔여 (후속)

- [ ] 결제·환불 요약「대표자」단체 섹션과 중복 표시 제거
- [ ] 환불 대기 다대회일 때 목록 eventId·필터 진입 (현재 첫 건 eventId만)
- [ ] 신청 목록 URL `eventId` query만 사용 (`marvel`/`virtual` slug 정리)

### 참고

- #128 관리자 신청자 목록 조회 연동
- #132 관리자 신청자 상세보기 미오픈
- 대회 우선 IA: 참가신청 → 대회 선택 → 해당 대회 신청만 조회
- IA 상세: `docs/superpowers/specs/2026-09-10-admin-applications-event-first-design.md`

---

## #138 fix: 미리보기·신청조회·정원 현황 잔여 처리

### 남음 (운영)

- [ ] `PROD_FRONTEND_REGISTRATION_OPEN=3` 설정 후 운영 재배포
- [ ] 운영에서 개인·단체 조회·수정·취소·재결제 최종 확인
- [ ] 정식 오픈 전 `/entry-preview` 제거·비활성화 방법 정리 (README 등)
- [ ] 관리자 접근 범위(숨은 경로 여부) 확정

---

## eventId·다대회 (후속)

배포 DB에 테스트 대회 유지 + 실오픈용 `eventId` 별도 추가 예정 (백엔드 수기 개설).

### 공개 사이트

- [ ] `NEXT_PUBLIC_EVENT_ID` env → `DEFAULT_EVENT_ID` 연결 (현재 `test-marvelrun` 하드코딩)
- [ ] 실오픈 직전 배포 env eventId를 운영 대회 id로 변경
- [ ] `.env.example`·README에 `NEXT_PUBLIC_EVENT_ID` 문서화

### 관리자

- [ ] 테스트·실오픈 마블런 동시 존재 시 slug(`marvel`) 중복 — 대회 선택·목록·운영 홈 집계 섞임 확인
- [ ] 정원 `/capacities/marvel` API eventId `DEFAULT_EVENT_ID` 고정 → 실제 대회 id 사용
- [ ] 관리자 문의 목록 `DEFAULT_EVENT_ID` 고정 호출 구간 실오픈 id 맞춤
