'use strict';

/**
 * Generates a self-signed SSL certificate for development purposes.
 * Run this script once: `node scripts/generateCert.js`
 * Output: ssl/cert.pem and ssl/key.pem
 */

const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, '..', 'ssl');

if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

console.log('🔐 Generating self-signed SSL certificate...');

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'organizationName', value: 'VIPScale Alexa Dev' },
];

const pems = selfsigned.generate(attrs, {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256',
  extensions: [
    { name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }] },
  ],
});

fs.writeFileSync(path.join(sslDir, 'cert.pem'), pems.cert);
fs.writeFileSync(path.join(sslDir, 'key.pem'), pems.private);

console.log('✅ Certificate generated:');
console.log('   ssl/cert.pem  ← Upload this to Alexa Developer Console');
console.log('   ssl/key.pem   ← Keep this private, never commit!');
console.log('');
console.log('📋 Next steps:');
console.log('   1. Start the server: npm start');
console.log('   2. In Alexa Developer Console → your skill → Endpoint:');
console.log('      - Set HTTPS endpoint to https://YOUR_VPS_IP:3000/alexa');
console.log('      - Under SSL Certificate type: "I will upload a self-signed certificate"');
console.log('      - Paste the contents of ssl/cert.pem into the certificate field');
