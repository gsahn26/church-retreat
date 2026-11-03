<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 문서 규칙 (항상 적용)

- 코드·설정·SQL·배포를 바꾸면 `PRD.md`의 **"수정 이력"** 표 맨 위에 한 줄을 추가한다.
  형식과 규칙은 같은 문서의 **"기록 규칙"**을 따른다.
- 동작·데이터 구조·범위가 바뀌면 표만이 아니라 `PRD.md` **본문도 같이** 고친다.
- `검증` 칸에는 실제로 돌려본 결과만 적는다. 안 해봤으면 `—`.

