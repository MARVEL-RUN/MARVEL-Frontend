# 이슈 초안 — GitHub에 붙여넣기

**제목:** `feat: 관리자 단체 회원 관리`

**라벨:** `🛠️: feature` (또는 `feat`)

---

## 📌 이슈 제목
> feat: 관리자 단체 회원 관리

## ✨ 기능 설명

- 관리자 **참가신청 → 회원 관리** 메뉴에서 단체(organization) 계정을 조회한다.
- 흐름은 신청자관리와 같이 **대회 선택 → 목록 → 상세**이다.
- 단체 목록·상세는 아래 Admin API를 사용한다.

| API | 용도 |
|-----|------|
| `GET /v1/admin/organizations` | 단체 목록 (`eventId` 필수, `keyword`·`page`·`size` 선택) |
| `GET /v1/admin/organizations/{organizationId}` | 단체 상세 + 소속 멤버 목록 |

### 목록 응답 (`content[]`)

- `listNumber`, `organizationId`, `groupName`, `eventName`, `leaderName`, `loginId`, `memberCount`, `createdAt`

### 상세 응답

- 단체: `organizationId`, `groupName`, `eventName`, `leaderName`, `loginId`, `createdAt`
- 멤버: `registrationId`, `name`, `courseName`, `souvenirName`, `souvenirSize`, `birth`, `amount`

## ✅ 세부 작업 항목

- [ ] 라우트: `/admin/members` 대회 선택, `/admin/members/list?eventId=` (또는 slug) 단체 목록
- [ ] `eventLinks`에 `adminMembersHref`·`adminMembersHrefFromEvent` 추가
- [ ] 단체 목록 페이지 — 키워드 검색, 페이지네이션, 테이블 컬럼(단체명·대표자·로그인ID·인원·가입일 등)
- [ ] 단체 상세 — 드로어 또는 별도 영역에 단체 정보 + 멤버 테이블
- [ ] API 클라이언트 `services/admin/organizations.ts` 연동 확인·필드 매핑 보완
- [ ] `MembersEventsPage`와 네비 `/admin/members` 활성화·빈 상태·에러 처리
- [ ] 관리자 CSS — 신청자관리 목록·드로어 패턴과 톤 맞춤

## 🧩 참고 자료

- Admin Swagger: `GET /v1/admin/organizations`, `GET /v1/admin/organizations/{organizationId}`
- IA 참고: `docs/superpowers/specs/2026-09-10-admin-applications-event-first-design.md` (대회 우선 흐름)
- 기존 스캐폴드: `MembersEventsPage`, `services/admin/organizations.ts`, `nav.ts` 회원 관리 항목
- #137 신청자관리 UI 패턴 (대회 선택·목록·드로어)
