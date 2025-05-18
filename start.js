const fs = require("fs");
const { execSync } = require("child_process");

const distPath = './dist/index.js';

if (!fs.existsSync(distPath)) {
  console.log('dist/index.js が見つかりません。ビルドを実行します...');
  execSync('npm run build', { stdio: 'inherit' });
}

console.log('アプリを起動します...');
try {
  execSync('node dist/index.js', { stdio: 'inherit' });
} catch (e) {
  console.error("dist/index.jsの実行に失敗しました。ビルドし直します:", e.message);
  try {
    fs.rmSync(distPath, { force: true });
    console.log("dist/index.js を削除しました");
  } catch (rmError) {
    console.warn("dist/index.js の削除に失敗しました:", rmError.message);
  }

  try {
    console.log("再ビルドを実行します...");
    execSync("npm run build", { stdio: "inherit" });
    execSync('node dist/index.js', { stdio: 'inherit' });
  } catch (finalError) {
    console.error("再ビルドまたは再実行に失敗しました:", finalError.message);
    process.exit(1);
  }
}
