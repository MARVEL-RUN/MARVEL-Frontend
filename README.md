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
npm run dev:main             # 본사이트 골격
```

## 폴더

```
src/
  app/
    page.tsx                 # 모드에 따라 coming-soon | main home
    (main)/                  # 본사이트 라우트 (URL에 그룹명 없음)
      guide/                 # 대회안내
      directions/            # 오시는길
      precautions/           # 대회유의사항
      lookup/                # 신청조회
      notices/               # 공지사항
      register/              # 티켓 예매
  components/
    coming-soon/             # 커밍순 UI + CSS
    main/
      layout/                # Header / Footer / MainShell (스텁)
      home/ guide/ …         # 페이지별 컴포넌트 (스텁)
  lib/
    mode.ts                  # APP_MODE, NAV_ITEMS, registrationOpen
    event.ts                 # 대회 공통 카피
    assets.ts                # 커밍순 이미지 경로

public/images/
  coming-soon/               # 커밍순 전용 에셋
  main/                      # 본사이트 에셋 (추후)
```

## 일정에 맞춘 사용

- **9/10** 커밍순 오픈 → `coming-soon` 모드로 빌드·배포
- **9/17** 본페이지 오픈 → `main` 모드, `registrationOpen`은 false 유지
- **9/22** 접수 오픈 → `registrationOpen` true + `/register` 연동

## 실행

```bash
npm install
npm run dev
npm run build   # 결과는 out/ (build.sh → output/)
```
