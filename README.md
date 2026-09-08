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

관리자는 모드와 관계없이 `/admin` (로그인 `/admin/login`).

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
      register/              # 티켓 예매
      virtual/               # 버추얼런
      notices/ faq/ inquiry/ # 게시판
      terms/ privacy/        # 약관
    admin/                   # 관리자
      login/
      applications/          # 개인·단체 신청
      boards/                # notice / inquiry / faq
      legal/                 # terms / privacy
      content/sponsors/
      admins/
  components/
    coming-soon/             # 커밍순 UI + CSS
    main/                    # 공개 페이지 UI + main.css
      layout/                # Header / Footer / MainShell
      home/ guide/ …         # 페이지별 컴포넌트
    admin/                   # 관리자 UI + admin.css
  layouts/admin/             # 관리자 셸 (사이드바·헤더)
  lib/
    event.ts legal.ts mode.ts register.ts
    admin/                   # 관리자 내비·스토어
  services/admin/            # 관리자 API 스텁
  types/

public/images/
  coming-soon/               # 커밍순 전용 에셋
  main/                      # 본사이트 에셋
```

- 공통 상수·타입만 `src/lib/` 루트. 관리자 전용은 `lib/admin`, `services/admin`.
- 메인 UI를 관리자에 복사하지 않는다. 반대도 같다.

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
