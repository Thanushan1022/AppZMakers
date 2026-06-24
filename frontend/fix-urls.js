import fs from 'fs';

const files = [
  'src/views/components/Layout.jsx',
  'src/controllers/useCalendarController.js',
  'src/controllers/useEmployeeController.js',
  'src/controllers/useHRController.js',
  'src/controllers/useCompanyController.js',
  'src/controllers/useAdminController.js'
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  const level = f.includes('components') ? '../../config' : '../config';
  content = content.replace(/const BACKEND_URL = 'http:\/\/localhost:5001\/api';/, `import { BACKEND_URL } from '${level}';`);
  fs.writeFileSync(f, content);
}

// Handle useAuthController separately
const authFile = 'src/controllers/useAuthController.js';
let authContent = fs.readFileSync(authFile, 'utf8');
authContent = authContent.replace(/const BACKEND_URL = 'http:\/\/localhost:5001\/api\/auth';/, `import { BACKEND_URL } from '../config';\nconst AUTH_URL = \`\${BACKEND_URL}/auth\`;`);
authContent = authContent.replace(/\$\{BACKEND_URL\}/g, '${AUTH_URL}');
fs.writeFileSync(authFile, authContent);

// Handle App.jsx separately
const appFile = 'src/App.jsx';
let appContent = fs.readFileSync(appFile, 'utf8');
appContent = appContent.replace(
  /const IS_LOCAL = window\.location\.hostname === 'localhost' \|\| window\.location\.hostname === '127\.0\.0\.1';\s+const SOCKET_URL = IS_LOCAL \? 'http:\/\/localhost:5001' : 'https:\/\/app-z-makers\.vercel\.app';/,
  `import { SOCKET_URL } from './config';`
);
fs.writeFileSync(appFile, appContent);

console.log('URLs updated successfully');
