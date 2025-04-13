#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// 설치 절차 시작
console.log('SVG to HTML MCP 도구 설치를 시작합니다...');

// OS 감지
const isWindows = os.platform() === 'win32';
const isMac = os.platform() === 'darwin';

if (!isWindows && !isMac) {
    console.error('지원되지 않는 운영체제입니다. Windows 또는 macOS가 필요합니다.');
    process.exit(1);
}

// 현재 스크립트의 경로
const scriptDir = __dirname;
console.log(`설치 디렉토리: ${scriptDir}`);

// 실행 권한 부여 (macOS)
if (isMac) {
    try {
        console.log('macOS 환경 설정 중...');
        if (fs.existsSync(path.join(scriptDir, 'dist', 'index.js'))) {
            execSync(`chmod +x "${path.join(scriptDir, 'dist', 'index.js')}"`);
            console.log('dist/index.js에 실행 권한이 부여되었습니다.');
        }
    } catch (error) {
        console.error('실행 권한 부여 실패:', error.message);
    }
}

// 빌드가 필요한지 확인
if (!fs.existsSync(path.join(scriptDir, 'dist', 'index.js'))) {
    console.log('빌드된 JavaScript 파일이 없습니다. TypeScript 컴파일을 실행합니다...');
    try {
        execSync('npm run build', { cwd: scriptDir, stdio: 'inherit' });
        console.log('빌드가 완료되었습니다.');
    } catch (error) {
        console.error('빌드 실패:', error.message);
        console.error('프로젝트를 설치하기 전에 npm install 명령어를 실행한 후 다시 시도하세요.');
        process.exit(1);
    }
}

// Claude 설정 파일 경로
let claudeConfigPath;
if (isWindows) {
    claudeConfigPath = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
} else if (isMac) {
    claudeConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
}

// 설정 파일 처리
if (claudeConfigPath && fs.existsSync(claudeConfigPath)) {
    console.log(`Claude 설정 파일을 찾았습니다: ${claudeConfigPath}`);
    
    try {
        // 설정 파일 읽기
        const configContent = fs.readFileSync(claudeConfigPath, 'utf8');
        const config = JSON.parse(configContent);
        
        // 도구 명령 설정 - GitHub 저장소 방식
        config['svg-to-html'] = {
            command: 'npx',
            args: ['-y', 'github:zayedalmaqha/svg-to-html-mcp']
        };
        
        // 수정된 설정 파일 저장
        fs.writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2), 'utf8');
        console.log('Claude 설정 파일이 업데이트되었습니다.');
        console.log('도구가 성공적으로 설치되었습니다. Claude 데스크톱 앱을 재시작하세요.');
    } catch (error) {
        console.error('설정 파일 업데이트 실패:', error.message);
        console.log('\n수동 설정 방법:');
        console.log(`Claude 설정 파일(${claudeConfigPath})에 다음을 추가하세요:`);
        console.log(`"svg-to-html": {
  "command": "npx",
  "args": ["-y", "github:zayedalmaqha/svg-to-html-mcp"]
}`);
    }
} else {
    console.log('Claude 설정 파일을 찾을 수 없습니다.');
    console.log('Claude 데스크톱 앱이 설치되어 있는지 확인하세요.');
    console.log('\n수동 설정 방법:');
    console.log(`Claude 설정 파일에 다음을 추가하세요:`);
    console.log(`"svg-to-html": {
  "command": "npx",
  "args": ["-y", "github:zayedalmaqha/svg-to-html-mcp"]
}`);
}