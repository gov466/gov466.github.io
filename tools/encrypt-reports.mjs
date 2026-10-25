// Encrypts the confidential reports in private/ so they can be published.
//
// The site only ever holds the encrypted .enc files. assets/report-unlock.js
// decrypts them in the visitor's browser once they enter the password.
//
// Usage (PowerShell):
//   $env:REPORT_PASSWORD = 'your-new-password'; node tools/encrypt-reports.mjs
// Then commit and push the updated reports/*.enc files.
//
// Format of each .enc file:  "GRENC1" | salt (16 bytes) | IV (12 bytes) | AES-256-GCM ciphertext+tag
// Key: PBKDF2-SHA256 over the password, ITERATIONS rounds. Must match assets/report-unlock.js.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ITERATIONS = 600000;
const MAGIC = new TextEncoder().encode('GRENC1');

// id -> source file in private/. The id is the reports/<id>.enc name the pages use.
const REPORTS = {
  'calibration-system': 'calibration-system-report.pdf',
  'wireless-test-fixture': 'wireless-test-fixture-report.pdf',
};

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const password = process.env.REPORT_PASSWORD;
if (!password || password.length < 12) {
  console.error('Set REPORT_PASSWORD to a password of at least 12 characters.');
  process.exit(1);
}

async function encrypt(data) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  const out = new Uint8Array(MAGIC.length + salt.length + iv.length + ct.length);
  out.set(MAGIC, 0);
  out.set(salt, MAGIC.length);
  out.set(iv, MAGIC.length + salt.length);
  out.set(ct, MAGIC.length + salt.length + iv.length);
  return out;
}

await mkdir(path.join(root, 'reports'), { recursive: true });
for (const [id, file] of Object.entries(REPORTS)) {
  const src = path.join(root, 'private', file);
  const dst = path.join(root, 'reports', id + '.enc');
  const enc = await encrypt(await readFile(src));
  await writeFile(dst, enc);
  console.log(`${file} -> reports/${id}.enc (${enc.length} bytes)`);
}
