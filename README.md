# MARVEL RUN 2026 KOREA

MARVEL RUN 공식 프론트엔드입니다. 지금은 커밍순만 열려 있고, 폴더는 본 홈 작업까지 이어서 쓸 수 있게 나눠 두었습니다.

## 폴더를 나눈 방식

크게 세 층입니다.

1. **`source-assets/`** — 디즈니 원본 PSD/AI. 용량이 크고 브라우저에서 못 씁니다. git에도 올리지 않습니다.
2. **`public/images/`** — 사이트에서 실제로 불러오는 PNG/SVG. 커밍순과 본 홈이 같은 파일을 재사용합니다.
3. **`src/`** — 화면과 로직. Next.js App Router 기준으로 라우트 / 도메인 컴포넌트 / 공통 값을 분리했습니다.

```
src/
  app/                      라우트만 둡니다. 지금은 page.tsx = 커밍순
  components/
    coming-soon/            오픈 전에만 쓰는 화면
    layout/                 헤더·푸터. 본 홈에서도 그대로 사용
    ui/                     섹션 제목처럼 여러 페이지에서 쓰는 조각
    home/                   본 홈 섹션이 생기면 여기로
  lib/
    constants/event.ts      일시·장소·접수일 한곳만 수정
    assets.ts               public 이미지 경로

public/images/
  characters/               코믹·실사 캐릭터 (본 홈 갤러리에도 사용)
  symbols/                  팀/캐릭터 심볼
  logos/                    MARVEL 워드마크 등 브랜드 로고
  partners/                 주최·주관 로고가 오면 여기

source-assets/disney/
  characters/comic|live-action
  symbols / key-visuals / lockups
  _duplicates               전달본 안 동일 복사본
```

본 홈을 붙일 때는 `app/page.tsx`를 홈으로 바꾸고, `register/`, `guide/` 같은 라우트를 `app/` 아래에 추가하면 됩니다. 대회 정보와 에셋 경로는 `lib/`를 그대로 쓰면 됩니다.

## 실행

```bash
npm install
npm run dev
```

정적 빌드 결과는 `out/` 이고, 기존 `build.sh`가 이 폴더를 배포합니다.
