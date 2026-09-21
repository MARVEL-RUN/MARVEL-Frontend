# 관리자 #137 · #138 체크리스트

브랜치: `dev/#137-138-admin-followup`

---

## #137 design: 관리자 참가신청 UI/UX 구성 변경

### 완료

- [x] 신청자관리·정원 현황·운영 홈 대회 선택 흐름 통일 (`GET /v1/admin/events`, `AdminEventsPicker`, `eventLinks`)
- [x] 신청 목록 진입 경로 1차 정리 (`individual`/`group` 제거, `list` slug redirect)

### 남음

- [ ] 신청 목록 URL을 `eventId` query만 사용 (`/admin/applications/list?eventId=...`)
  - [ ] `/admin/applications/marvel`, `/virtual` slug 라우트 제거 또는 redirect
  - [ ] `eventLinks`·운영 홈·대시보드 링크를 API `eventId` 기준으로 통일
  - [ ] `ApplicationsListPage` slug 분기 정리 (`eventId` 중심)
- [ ] 목록 주문번호 등 빠진 표시 값 맞춤
- [ ] 운영 홈 접수 현황·환불 대기 진입과 신청 목록 맞춤
- [ ] 신청 상세 개인·단체 필드 구분 표시
- [ ] 상세 헤더(이름·주문번호·상태) 추가
- [ ] 상세 빈 항목·결제 정보 중복 표기 정리
- [ ] 테스트·메인에서 신청 상세 열림 최종 확인

### 보류

- [ ] 마블런/버추얼별 목록 필터·컬럼 구성 (유형·차수·코스) — `eventCategoryId`·차수 매핑 확인 후
- [ ] 정원 현황 대회 목록 API 통일 (관리자 편의, 급하지 않음)

---

## #138 fix: 미리보기·신청조회·정원 현황 잔여 처리

### 완료

- [x] 신청조회 재결제·수정 후 결제 이동 미리보기 prefix 맞춤 (`LookupPage`, `useAppHref`)
- [x] 공개 URL vs `/entry-preview` 역할 정리 (같은 컴포넌트, 게이트만 다름)
- [x] 사이트맵·공개 내비 노출 범위 확인 (`main` + `REGISTRATION_OPEN=3` 기준)
- [x] 신청조회 대회 id 범위 (마블런 고정, `DEFAULT_EVENT_ID` 유지)

### 남음 (운영)

- [ ] `PROD_FRONTEND_REGISTRATION_OPEN=3` 설정 후 운영 재배포
- [ ] 운영에서 개인·단체 조회·수정·취소·재결제 최종 확인
- [ ] 정식 오픈 전 `/entry-preview` 제거·비활성화 방법 정리 (README 등)
- [ ] 관리자 접근 범위(숨은 경로 여부) 확정

### 취소

- ~~정원 현황 최대 수용량 열 단위(명/개)~~ — 유저·운영 표기 불필요
- ~~운영 정원 API 확인~~ — 필요 시 수동

---

## 참고

- 대회 우선 IA: `docs/superpowers/specs/2026-09-10-admin-applications-event-first-design.md`
- #128 신청자 목록 API, #132 상세 API 연동 완료 (UI 정리는 #137)
