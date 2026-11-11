// Build the user app + admin and assemble them into ./public for the Worker's
// static-assets binding: app at /, admin at /admin. Run before `wrangler deploy`.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');
const run = (cmd, cwd, env) => execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });

console.log('• building user app (VITE_API_BASE=/api)…');
run('npm ci && npm run build', path.join(root, 'app'), { VITE_API_BASE: '/api' });

console.log('• building admin (VITE_ADMIN_API=/admin/api)…');
run('npm ci && npm run build', path.join(root, 'admin'), { VITE_ADMIN_API: '/admin/api' });

const pub = path.join(here, 'public');
fs.rmSync(pub, { recursive: true, force: true });
fs.cpSync(path.join(root, 'app', 'dist'), pub, { recursive: true });
fs.cpSync(path.join(root, 'admin', 'dist'), path.join(pub, 'admin'), { recursive: true });
console.log('✓ assembled worker/public (app at /, admin at /admin)');
