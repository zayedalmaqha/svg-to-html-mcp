#!/usr/bin/env node
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ts-node 등록
require('ts-node/register');

// 현재 디렉토리 출력 (디버깅용)
console.error(`Current directory: ${process.cwd()}`);
console.error(`Script directory: ${__dirname}`);

// index.ts 실행
try {
  require(join(__dirname, 'index.ts'));
} catch (error) {
  console.error('Error executing index.ts:', error);
}
