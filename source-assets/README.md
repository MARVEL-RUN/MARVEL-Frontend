# 원본 에셋 (웹에 배포되지 않음)

디즈니 전달 원본은 용량이 크고 브라우저에서 바로 쓸 수 없습니다.
웹용 PNG만 `public/images/` 로 내보내고, 원본은 이 폴더에서 관리합니다.

이 폴더는 `README.md` 와 `manifest.json` 을 빼고 git에서 제외됩니다.

```
source-assets/
  manifest.json          # 파일 코드 ↔ 캐릭터/심볼 매핑
  disney/
    characters/live-action/  # 실사 컷아웃 (.psd)
    symbols/             # 팀/캐릭터 아이콘
    key-visuals/         # 포스터·키비주얼
    lockups/             # 캐릭터 스트립·콜라주
    _duplicates/         # 전달본 안 동일 파일 복사본
  key-visuals/           # 키비주얼 작업본 (SVG/PNG)
```

파일명 규칙: `{의미있는-이름}__{디즈니코드}.{확장자}`

## AI 원본에 대해

코믹 캐릭터와 심볼의 `.ai` 원본은 삭제했습니다.
해당 아트워크는 이미 `public/images/characters/`, `public/images/symbols/` 에
투명 PNG로 내보내져 있고, 어떤 디즈니 코드에서 나왔는지는
`manifest.json` 의 `deleted_ai_sources` 에 남겨 두었습니다.
원본이 다시 필요하면 그 코드로 재요청하면 됩니다.
