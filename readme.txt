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
- Node.js 18+ 설치

설치 방법:
1. GitHub에서 직접 실행 (권장):
   Claude 데스크톱 설정 파일에 다음을 추가합니다:

   "svg-to-html": {
     "command": "npx",
     "args": ["-y", "github:zayedalmaqha/svg-to-html-mcp"]
   }

2. 로컬 설치:
   a. 저장소를 클론합니다:
      git clone https://github.com/zayedalmaqha/svg-to-html-mcp.git
      cd svg-to-html-mcp

   b. 의존성을 설치하고 빌드합니다:
      npm install
      npm run build

   c. 설치 스크립트를 실행합니다:
      npm run install-tool

3. Claude 데스크톱 앱을 재시작합니다.

■ 사용 방법

설치가 완료되면 Claude에서 다음과 같은 방식으로 SVG to HTML 도구를 직접 사용할 수 있습니다:

- "이 아티팩트의 코드를 HTML로 변환해줘"
- "이 TypeScript 코드를 HTML 페이지로 만들어줘"
- "방금 생성한 SVG 아티팩트를 HTML로 변환해서 보여줘"

■ 주의사항

- 도구를 사용하기 전에 아티팩트가 생성되어 있어야 합니다.
- 아티팩트 버전을 지정해야 합니다.
- 현재는 TypeScript 코드를 HTML로 표시만 하며, 코드 실행은 지원하지 않습니다.

■ 프로젝트 구조

- dist/: 컴파일된 JavaScript 파일
- src/: TypeScript 소스 코드
- package.json: 프로젝트 정보 및 의존성 정의
- tsconfig.json: TypeScript 컴파일러 설정

■ 문제해결

도구가 제대로 작동하지 않는 경우:

1. Claude 데스크톱 앱이 설치되어 있고 로그인되어 있는지 확인하세요.
2. Node.js가 제대로 설치되어 있는지 확인하세요 (v18 이상).
3. GitHub 저장소 방식을 사용하는 경우 인터넷 연결을 확인하세요.
4. 로컬 설치를 사용하는 경우 npm install 및 npm run build가 오류 없이 실행되었는지 확인하세요.
5. Claude 앱을 재시작해보세요.

■ 라이선스

MIT