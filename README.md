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
npm run dev:main             # 본사이트 + 신청 화면 미리보기
```

`npm run dev:main`은 `NEXT_PUBLIC_REGISTER_PREVIEW=1`을 켠다. 배포 빌드에는 넣지 않는다.

관리자는 모드와 관계없이 `/admin` (로그인 `/admin/login`).

## 환경 변수

`.env.example` 기준. 값을 바꾼 뒤에는 dev 서버를 다시 켠다.

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_APP_MODE` | `coming-soon` \| `main` |
| `NEXT_PUBLIC_REGISTER_PREVIEW` | `1`이면 접수 오픈 전에도 `/register` UI를 연다 |
| `NEXT_PUBLIC_API_BASE_URL` | 공개 신청·결제 API |
| `NEXT_PUBLIC_TOSS_CLIENT_KEY` | 토스 결제위젯 (`test_gck_…`) |
| `NEXT_PUBLIC_API_BASE_URL_ADMIN` | 관리자 API |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 오시는길 지도 |

## 폴더

영역은 **커밍순 / 메인 / 관리자** 세 곳. 파일이 어느 사이트인지 경로만 봐도 알게 둔다.

```
src/
  app/
    page.tsx                 # 모드에 따라 coming-soon | main home
    (main)/                  # 공개 본사이트 (URL에 그룹명 없음)
      guide/                 # 대회안내
      directions/            # 오시는길
      precautions/           # 대회유의사항
      lookup/                # 신청조회
      register/              # 참가신청
      payment/               # 토스 결제 (모바일 풀페이지 · success/fail)
      virtual/               # 버추얼런
      notices/ faq/ inquiry/ # 게시판
      terms/ privacy/        # 약관
    admin/
      login/
      applications/          # 마블런 · 버추얼런 신청
      boards/                # notice / inquiry / faq
      legal/                 # terms / privacy
      content/sponsors/
      admins/
  components/
    coming-soon/
    main/                    # 공개 UI + main.css
      register/              # 약관 · 개인/단체 신청
      payment/               # 결제 위젯 · 완료/실패
      guide/ lookup/ …
    admin/
  layouts/admin/
  lib/
    event.ts legal.ts mode.ts register.ts
    main/                    # 공개 API base · fetch
    payment/                 # 토스 · 세션 · 종목 매핑
    admin/
  services/
    main/                    # 공개 신청·결제
    admin/                   # 관리자 API 스텁
  types/

public/images/
  coming-soon/
  main/
```

- 공통 상수·타입만 `src/lib/` 루트. 공개 API는 `lib/main` + `services/main`, 결제는 `lib/payment`.
- 관리자 전용은 `lib/admin`, `services/admin`. 게시판은 `boards/{notice,inquiry,faq}`, 약관은 `admin/legal`.
- 메인 UI를 관리자에 복사하지 않는다. 반대도 같다.

## 일정에 맞춘 사용

- **9/10** 커밍순 오픈 → `coming-soon` 모드로 빌드·배포
- **9/17** 본페이지 오픈 → `main` 모드. 접수는 `registrationOpen` / preview로 조절
- **9/22** 접수 오픈 → `registrationOpen` true + API·토스 키로 `/register` 결제 연동

## 실행

```bash
npm install
npm run dev
npm run build   # 결과는 out/ (build.sh → output/)
```
