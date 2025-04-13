SVG to HTML MCP Tool

이 도구는 Model Context Protocol (MCP)을 사용하여 Claude가 생성한 TypeScript 아티팩트를 HTML 페이지로 변환합니다.

■ 기능

- Claude가 생성한 아티팩트의 TypeScript 코드를 HTML 페이지로 변환
- 버전 관리 지원
- 아티팩트 내용 표시 및 포맷팅
- 크로스 플랫폼 지원 (Windows, macOS)

■ 설치 방법

사전 요구사항:
- Windows 또는 macOS
- Node.js 18+ 또는 Bun(macOS)
- Claude 데스크톱 앱 설치

설치 단계:

1. 이 저장소를 클론합니다:
git clone https://github.com/yourusername/svg-to-html-mcp.git
cd svg-to-html-mcp

2. 의존성을 설치합니다:
# Windows 또는 macOS 공통
npm install

# 또는 macOS에서 Bun 사용시
bun install

3. Claude 데스크톱 구성을 업데이트합니다:

macOS:
`claude_desktop_config.json` 파일(일반적으로 `~/Library/Application Support/Claude/claude_desktop_config.json`에 위치)을 편집합니다:

"svg-to-html": {
  "command": "node",
  "args": ["--loader", "ts-node/esm", "/path/to/svg-to-html-mcp/index.ts"]
}

또는 Bun을 사용하는 경우:
"svg-to-html": {
  "command": "/path/to/bun",
  "args": ["run", "/path/to/svg-to-html-mcp/index.ts"]
}

Windows:
`claude_desktop_config.json` 파일(일반적으로 `%APPDATA%\Claude\claude_desktop_config.json`에 위치)을 편집합니다:

"svg-to-html": {
  "command": "node",
  "args": ["--loader", "ts-node/esm", "C:\\path\\to\\svg-to-html-mcp\\index.ts"]
}

4. Claude 데스크톱 앱을 재시작합니다.

■ 빌드 방법 (선택 사항)

TypeScript 코드를 JavaScript로 컴파일하려면:

npm run build

이후 생성된 `dist/index.js` 파일을 실행에 사용할 수 있습니다.

■ 사용 방법

설치가 완료되면 Claude에서 다음과 같은 방식으로 SVG to HTML 도구를 직접 사용할 수 있습니다:

- "이 아티팩트의 코드를 HTML로 변환해줘"
- "이 TypeScript 코드를 HTML 페이지로 만들어줘"
- "방금 생성한 SVG 아티팩트를 HTML로 변환해서 보여줘"

■ 주의사항

- 도구를 사용하기 전에 아티팩트가 생성되어 있어야 합니다.
- 아티팩트 버전을 지정해야 합니다.
- 현재는 TypeScript 코드를 HTML로 표시만 하며, 코드 실행은 지원하지 않습니다.

■ 문제해결

도구가 제대로 작동하지 않는 경우:

1. Claude 데스크톱 앱이 설치되어 있고 로그인되어 있는지 확인하세요.
2. claude_desktop_config.json에서 경로가 올바른지 확인하세요:
   - Windows에서는 경로 구분자로 `\\`를 사용해야 합니다 (예: `C:\\Users\\사용자이름\\...`)
   - macOS에서는 경로 구분자로 `/`를 사용해야 합니다 (예: `/Users/사용자이름/...`)
3. Node.js가 제대로 설치되어 있는지 확인하세요 (Windows) 또는 Bun이 제대로 설치되어 있는지 확인하세요 (macOS).
4. Claude 앱을 재시작해보세요.

■ 라이선스

MIT