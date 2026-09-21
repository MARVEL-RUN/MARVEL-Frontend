# MARVEL RUN 2026 KOREA

공식 프론트엔드 (Next.js, `output: "export"` → Nginx 정적 배포).

## 모드 전환

| 모드 | env | `/` |
|------|-----|-----|
| 커밍순 (기본) | `NEXT_PUBLIC_APP_MODE=coming-soon` | Coming Soon |
| 본사이트 | `NEXT_PUBLIC_APP_MODE=main` | 본 홈 + 헤더 셸 |

```bash
cp .env.example .env.local   # 필요 시
npm run dev                  # 커밍순
npm run dev:main             # 본사이트
```

## 환경 변수


`.env.example` 기준. 값을 바꾼 뒤에는 dev 서버를 다시 켠다.

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_APP_MODE` | `coming-soon` \| `main` |
| `NEXT_PUBLIC_REGISTRATION_OPEN` | `0` 닫기, `1` 열기, `3` 접수 시각 자동 |
| `NEXT_PUBLIC_API_BASE_URL` | 공개 신청·결제·게시판 API |
| `NEXT_PUBLIC_API_BASE_URL_ADMIN` | 관리자 API |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 결제위젯 (로컬·운영 빌드) |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 오시는길 지도 |
| `NEXT_PUBLIC_BGM` | `off` 끄기, `on` 기본 음원 |
| `GOOGLE_SITE_VERIFICATION` | 구글 사이트 인증 |
| `NAVER_SITE_VERIFICATION` | 네이버 사이트 인증 |
| `GA_MEASUREMENT_ID` | Google Analytics |
| `NAVER_ANALYTICS_ID` | 네이버 애널리틱스 |

배포 시 토스 클라이언트 키는 GitHub Secret으로 나눈다.

| Secret | 용도 |
|--------|------|
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 운영(`main`) |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY_TEST` | 테스트(`develop`) |

## 폴더

영역은 **커밍순 / 메인 / 관리자** 세 곳. 파일이 어느 사이트인지 경로만 봐도 알게 둔다.

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
      virtual/               # 버추얼런
      notices/ faq/ inquiry/ # 커뮤니티
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
    admin/
  layouts/admin/
  lib/
    event.ts legal.ts privacy.ts mode.ts register.ts
    main/                    # 공개 API base · fetch
    payment/                 # 토스 · 세션 · 종목 매핑
    admin/
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

## 실행

```bash
npm install
npm run dev          # 커밍순
npm run dev:main     # 본사이트
npm run build        # 결과는 out/ (build.sh → output/)
npm run build:main   # 본사이트로 빌드
```
