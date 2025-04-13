# SVG to HTML MCP Tool

이 도구는 Claude의 TypeScript/SVG 아티팩트를 Chart.js를 사용한 HTML 페이지로 변환해주는 Model Context Protocol (MCP) 도구입니다.

## 기능

- Claude가 생성한 React/TypeScript 시각화 코드를 Chart.js 기반 HTML로 변환
- SVG 그래픽을 독립형 HTML 페이지로 변환
- 다크 모드 지원 및 인쇄 최적화
- 차트 데이터 레이블 자동 표시

## 설치 방법

### 사전 요구사항

- macOS 또는 Windows
- [Claude 데스크톱 앱](https://claude.ai/desktop) 설치
- Node.js 18 이상 설치

### 자동 설치 (권장)

1. 저장소 복제:

```bash
git clone https://github.com/zayedalmaqha/svg-to-html-mcp.git
cd svg-to-html-mcp
```

2. 설치 스크립트 실행:

```bash
node install.js
```

3. Claude 데스크톱 앱 재시작

### 수동 설치

1. Claude 데스크톱 구성 파일을 찾습니다:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. 파일에 다음 항목을 추가합니다:

```json
"svg-to-html": {
  "command": "npx",
  "args": ["-y", "github:zayedalmaqha/svg-to-html-mcp"]
}
```

3. Claude 데스크톱 앱 재시작

## 사용 방법

1. Claude에서 시각화 코드가 담긴 아티팩트를 생성하세요
2. Claude에게 다음과 같이 요청하세요:
   - "이 시각화 코드를 HTML로 변환해 줄래요?"
   - "이 TypeScript 아티팩트를 실행 가능한 HTML로 만들어 줄래요?"
   - "이 SVG를 웹페이지로 변환해 주세요."

## HTML 보고서 명세

생성된 HTML 페이지는 다음과 같은 특징을 가집니다:

- Chart.js 및 chartjs-plugin-datalabels을 사용한 시각화
- 고정된 상단 헤더 및 다크 모드 토글 지원
- 각 차트는 최대 너비 720px의 반응형 레이아웃
- 데이터 레이블 표시 (막대 차트에서 값 표시, 파이 차트에서 레이블과 백분율 표시)
- 다크 모드에서 모든 텍스트 요소가 자동으로 업데이트
- 인쇄 최적화 (페이지 나누기 방지, 인쇄 시 헤더 위치 및 다크모드 스위치 처리)

## 문제 해결

도구가 제대로 작동하지 않을 경우:

1. Claude 데스크톱 앱이 최신 버전인지 확인하세요
2. claude_desktop_config.json 파일에 도구가 올바르게 구성되었는지 확인하세요
3. 아티팩트 코드가 유효한 TypeScript/React 또는 SVG 형식인지 확인하세요

## 예시 출력

이 도구는 Chart.js를 사용하여 다음과 같은 시각화를 생성합니다:

- 막대 차트, 선 차트, 파이 차트 등
- 데이터 레이블이 있는 차트
- 다크 모드 지원
- 인쇄 최적화

## 라이선스

MIT