SVG to HTML MCP 도구 설치 및 사용 가이드

이 문서는 GitHub에서 SVG to HTML MCP 도구를 설치하고 사용하는 방법을 안내합니다.

■ 설치 방법

1. 저장소 클론하기

먼저 GitHub에서 저장소를 클론합니다:

git clone https://github.com/[사용자명]/svg-to-html-mcp.git
cd svg-to-html-mcp

2. 의존성 설치하기

필요한 패키지를 설치합니다:

# Windows 또는 macOS에서
npm install

# 또는 macOS에서 Bun 사용 시
bun install

3. 자동 설치 스크립트 실행하기

Claude 데스크톱 앱 설정을 자동으로 업데이트하는 스크립트를 실행합니다:

npm run install-tool

이 스크립트는 운영체제를 감지하고 Claude 데스크톱 앱 설정 파일을 자동으로 업데이트합니다.

4. 수동 설정 (자동 설치 실패 시)

자동 설치가 실패할 경우, 다음과 같이 수동으로 설정할 수 있습니다:

Windows:
1. %APPDATA%\Claude\claude_desktop_config.json 파일을 텍스트 편집기로 엽니다.
2. 다음 내용을 JSON 객체에 추가합니다:
"svg-to-html": {
  "command": "node",
  "args": ["--loader", "ts-node/esm", "C:\\path\\to\\svg-to-html-mcp\\index.ts"]
}
3. C:\\path\\to\\svg-to-html-mcp 부분을 실제 경로로 변경합니다.

macOS:
1. ~/Library/Application Support/Claude/claude_desktop_config.json 파일을 텍스트 편집기로 엽니다.
2. 다음 내용을 JSON 객체에 추가합니다:
"svg-to-html": {
  "command": "node",
  "args": ["--loader", "ts-node/esm", "/path/to/svg-to-html-mcp/index.ts"]
}
3. /path/to/svg-to-html-mcp 부분을 실제 경로로 변경합니다.

5. Claude 데스크톱 앱 재시작

변경사항을 적용하기 위해 Claude 데스크톱 앱을 재시작합니다.

■ 사용 방법

Claude 데스크톱 앱에서 다음과 같은 요청을 사용할 수 있습니다:

1. "이 아티팩트의 코드를 HTML로 변환해줘"
2. "이 TypeScript 코드를 HTML 페이지로 만들어줘"
3. "방금 생성한 SVG 아티팩트를 HTML로 변환해서 보여줘"

■ 파일 설명

이 프로젝트에 포함된 파일들의 역할:

- index.ts: MCP 서버의 메인 코드로, 도구 정의와 변환 로직이 포함되어 있습니다.
- package.json: 프로젝트 의존성과 스크립트 정의가 포함된 파일입니다.
- tsconfig.json: TypeScript 컴파일러 설정이 포함된 파일입니다.
- install.js: Claude 데스크톱 앱 설정을 자동으로 업데이트하는 스크립트입니다.
- run.bat: Windows에서 도구를 실행하기 위한 배치 스크립트입니다.
- run.sh: macOS에서 도구를 실행하기 위한 셸 스크립트입니다.
- README.txt: 프로젝트 문서입니다.

■ GitHub 저장소에 올리기

이 프로젝트를 자신의 GitHub 저장소에 올리려면:

1. GitHub에서 새 저장소를 생성합니다.
2. 로컬 저장소를 초기화하고 GitHub에 푸시합니다:

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[사용자명]/svg-to-html-mcp.git
git push -u origin main

■ 문제해결

1. 설치 스크립트가 실패할 경우: 수동 설정 단계를 참조하세요.
2. 도구가 작동하지 않을 경우: Node.js가 설치되어 있는지 확인하고, 경로 설정이 올바른지 확인하세요.
3. 권한 오류: macOS에서 run.sh에 실행 권한을 부여했는지 확인하세요 (chmod +x run.sh).