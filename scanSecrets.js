const fs = require('fs');
const path = require('path');

const SENSITIVE_KEYWORDS = ['SUPABASE_', 'API_KEY', 'SECRET', 'PRIVATE_KEY', 'ACCESS_TOKEN', 'JWT'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const keyword of SENSITIVE_KEYWORDS) {
    if (content.includes(keyword)) {
      console.log(`🚨 Possible sensitive data found in: ${filePath}`);
      return;
    }
  }
}

console.log('🔎 Scanning your project for secrets...');
walkDir('./', file => {
  if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.json') || file.endsWith('.env')) {
    scanFile(file);
  }
});
console.log('✅ Scan complete.');
