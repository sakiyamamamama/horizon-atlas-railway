// start.js
const fs = require("fs");
const { execSync } = require("child_process");

const distPath = './dist/index.js';

if (!fs.existsSync(distPath)) {
  console.log('dist/index.js が見つかりません。ビルドを実行します...');
  execSync('npm run build', { stdio: 'inherit' });
}

console.log('アプリを起動します...');
execSync('node dist/index.js', { stdio: 'inherit' });
