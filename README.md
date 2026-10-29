# MARVEL RUN 2026 KOREA

공식 프론트엔드 (Next.js, `output: "export"` → Nginx 정적 배포).

## 모드 전환

| 모드 | env | `/` |
|------|-----|-----|
| 커밍순 (기본) | `NEXT_PUBLIC_APP_MODE=coming-soon` | Coming Soon |
| 본사이트 | `NEXT_PUBLIC_APP_MODE=main` | 본 홈 + 헤더 셸 |

```bash
cp .env.example .env.local   # 필요 시
pnpm dev                     # 커밍순
pnpm dev:main                # 본사이트
pnpm dev:virtual             # 버추얼런 (아래 URL)
```

| 명령 | 로컬 URL |
|------|----------|
| `pnpm dev:virtual` | `http://localhost:3000/` — 서브도메인과 같이 `/event`, `/tickets` 등 (미들웨어 rewrite) |
| `pnpm dev` / `pnpm dev:main` | `http://localhost:3000/virtual-run` — 경로 prefix로만 접근 |

`dev:virtual`은 `NEXT_PUBLIC_VIRTUAL_RUN_HOST=localhost`를 켠다. 같은 포트에서 마블런 본사이트(`/`)와 동시에 쓰지 않는다.

`output: "export"` 정적 배포에서는 Next 미들웨어가 실행되지 않는다. 서브도메인 루트(`/event` 등)는 Nginx 등에서 `/virtual-run`으로 넘기면 된다.

```nginx
# 예: virtual.example.com → out/virtual-run/*
location / {
  try_files $uri $uri/ /virtual-run/index.html;
}
# 또는 rewrite ^/(.*)$ /virtual-run/$1 last;
```

`next dev` + `NEXT_PUBLIC_VIRTUAL_RUN_HOST` 설정 시에는 `src/middleware.ts`가 동일 rewrite를 한다.

## 환경 변수


`.env.example` 기준. 값을 바꾼 뒤에는 dev 서버를 다시 켠다.

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_APP_MODE` | `coming-soon` \| `main` |
| `NEXT_PUBLIC_VIRTUAL_RUN_HOST` | 버추얼런 호스트(쉼표 구분). `dev:virtual`은 `localhost` |
| `NEXT_PUBLIC_VIRTUAL_RUN_SPOTS` | `1` 거점 이벤트 페이지 노출, 그 외 404 |
| `NEXT_PUBLIC_REGISTRATION_OPEN` | `0` 닫기, `1` 열기, `3` 접수 시각 자동 |
| `NEXT_PUBLIC_API_BASE_URL` | 공개 신청·결제·게시판 API |
| `NEXT_PUBLIC_API_BASE_URL_ADMIN` | 관리자 API |
| `NEXT_PUBLIC_EVENT_ID` | 공개 접수·조회·문의 대회 ID |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 결제위젯 (로컬·운영 빌드) |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 오시는길 지도 |
| `NEXT_PUBLIC_BGM` | `off` 끄기, `on` 기본 음원 |
| `NEXT_PUBLIC_START_GROUP` | `1` 출발 그룹 선택·표기·수정 UI, 그 외 끔 |
| `NEXT_PUBLIC_DISCOUNT_LINK` | `1` 할인 링크 path(`/discount/*`), 그 외 끔 |
| `GOOGLE_SITE_VERIFICATION` | 구글 사이트 인증 |
| `NAVER_SITE_VERIFICATION` | 네이버 사이트 인증 |
| `GA_MEASUREMENT_ID` | Google Analytics |
| `NAVER_ANALYTICS_ID` | 네이버 애널리틱스 |

배포 시 토스 클라이언트 키는 GitHub Secret으로 나눈다. 대회 ID는 Secret이 아니라 Variable이다.

| Secret | 용도 |
|--------|------|
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 운영(`main`) |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY_TEST` | 테스트(`develop`) |

| Variable | 용도 |
|----------|------|
| `TEST_FRONTEND_EVENT_ID` | 테스트 대회 ID (`test-marvelrun`) |
| `PROD_FRONTEND_EVENT_ID` | 운영 대회 ID (`marvelrun2026`) |

| Secret | 용도 |
|--------|------|
| `NEXT_PUBLIC_START_GROUP` | `1` 출발 그룹 UI, `0` 또는 미등록 끔 (테스트·운영 공통) |
| `NEXT_PUBLIC_DISCOUNT_LINK` | `1` 할인 링크 UI, `0` 또는 미등록 끔 (테스트·운영 공통) |

## 폴더

영역은 **커밍순 / 메인 / 버추얼런 / 관리자** 네 곳. 파일이 어느 사이트인지 경로만 봐도 알게 둔다.

```
src/
  app/
    page.tsx                 # 모드에 따라 coming-soon | main home
    (main)/                  # 공개 본사이트 (URL에 그룹명 없음)
      guide/                 # 대회안내
      kit/                   # 기념품
      directions/            # 오시는길
      precautions/           # 참가자 유의사항
      lookup/                # 신청조회
      register/              # 참가신청
      payment/               # 토스 결제 (success/fail)
      virtual/               # 본사이트 내 버추얼런 커밍순 안내
      notices/ faq/ inquiry/ # 커뮤니티
    virtual-run/             # 버추얼런 전용 사이트 (서브도메인 rewrite)
      terms/ privacy/        # 약관
    admin/
      login/
      applications/          # 신청자 관리
      boards/                # notice / inquiry / faq
      legal/                 # terms / privacy
      content/popups/
      admins/
  components/
    coming-soon/
    main/                    # 공개 UI + main.css
    virtual-run/             # 버추얼런 UI (theme.css + main.css 재사용)
    admin/
  layouts/admin/
  lib/
    event.ts legal.ts privacy.ts mode.ts register.ts
    registration-status.ts   # 신청상태(RegistrationStatus) 라벨
    payment-log.ts           # 결제 처리 로그 processType·source 라벨
    main/                    # 공개 API base · fetch
    payment/                 # 토스 · 세션 · 종목 매핑
    admin/
    virtual-run/             # 버추얼런 상수·내비
  services/
    main/                    # 공개 신청·결제·게시판
    admin/                   # 관리자 API
  types/

public/images/
  coming-soon/
  main/
  virtual/
```

- 공통 상수·타입만 `src/lib/` 루트. 공개 API는 `lib/main` + `services/main`, 결제는 `lib/payment`.
- 관리자 전용은 `lib/admin`, `services/admin`. 게시판은 `boards/{notice,inquiry,faq}`, 약관은 `admin/legal`.
- 메인 UI를 관리자에 복사하지 않는다. 반대도 같다.

## 상태 표기

백엔드 enum을 화면에 그대로 노출하지 않는다. 라벨은 아래 두 파일에서만 관리한다.

| 파일 | API 값 | 쓰는 곳 |
|------|--------|---------|
| `src/lib/registration-status.ts` | `RegistrationStatus` | 신청 목록·상세, 신청조회 |
| `src/lib/payment-log.ts` | 처리 로그 `processType`, `source` | 관리자 결제 처리 로그 |

표기를 바꿀 때는 해당 파일의 `*_LABEL`만 수정한다.

### RegistrationStatus (신청상태)

백엔드 `RegistrationStatus` 기준. 관리자·신청조회 공통.

| API | 화면 |
|-----|------|
| `PENDING` | 편입·결제 대기 |
| `PAYMENT_PENDING` | 결제 대기 |
| `CONFIRMED` | 참가 확정 |
| `ADDITIONAL_PAYMENT_REQUIRED` | 추가 결제 필요 |
| `PARTIAL_REFUND_REQUIRED` | 부분 환불 필요 |
| `CANCELLATION_PENDING` | 취소·환불 처리 중 |
| `CANCELED` | 취소 완료 |
| `EXPIRED` | 결제 만료 |
| `UNKNOWN` | 확인 불가 |
| (없음·미매핑) | 로그 확인 필요 |

헬퍼: `registrationStatusLabel()`, `registrationStatusBadge()`, `canPrepareRegistrationPayment()`.

### 결제 처리 로그 (processType · source)

토스 `payment.status`나 웹훅 `eventType`이 아니라, **백엔드가 토스 연동 단계마다 남기는 처리 로그**다. 토스 [결제 흐름](https://docs.tosspayments.com/guides/v2/get-started/llms-quick-reference)(준비 → 승인 API → 취소)과 대응한다.

**processType**

| API | 화면 |
|-----|------|
| `PAYMENT_PREPARED` | 결제 준비 |
| `CONFIRM_REQUESTED` | 승인 요청 |
| `CONFIRM_SUCCEEDED` | 승인 완료 |
| `CONFIRM_FAILED` | 승인 실패 |
| `CANCEL_PREPARED` | 취소 준비 |
| `CANCEL_REQUESTED` | 취소 요청 |
| `CANCEL_SUCCEEDED` | 취소 완료 |
| `CANCEL_FAILED` | 취소 실패 |
| `CANCEL_UNKNOWN` | 취소 확인 불가 |
| `WEBHOOK_RECEIVED` | 웹훅 수신 |
| `WEBHOOK_CONFIRM` | 웹훅 승인 처리 |
| `WEBHOOK_CANCEL` | 웹훅 취소 처리 |
| `RETRY_REQUESTED` | 재시도 요청 |
| `STATUS_SYNC` | 상태 동기화 |
| `EXPIRED` | 결제 만료 |

**source**

| API | 화면 |
|-----|------|
| `API` | API |
| `WEBHOOK` | 웹훅 |
| `SCHEDULER`, `CRON` | 배치 |
| `ADMIN` | 관리자 |
| `SYSTEM`, `INTERNAL` | 시스템 |

헬퍼: `paymentLogProcessLabel()`, `paymentLogSourceLabel()`. 매핑에 없는 값은 API 원문 그대로 표시한다. 백엔드 enum이 늘면 `payment-log.ts`에 추가한다.

## 실행

```bash
npm install
npm run dev          # 커밍순
npm run dev:main     # 본사이트
npm run build        # 결과는 out/ (build.sh → output/)
npm run build:main   # 본사이트로 빌드
```
