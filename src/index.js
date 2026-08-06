'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const express = require('express');
const helmet = require('helmet');

const { adapter } = require('./alexaHandler');
const { alexaVerifier } = require('./utils/verifier');

const app = express();
const PORT = process.env.PORT || 3000;
const USE_SELF_SIGNED = process.env.USE_SELF_SIGNED_CERT === 'true';

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet());

// ── Raw body parsing (required for Alexa signature verification) ──────────────
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// ── Health check endpoint ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Alexa skill endpoint ───────────────────────────────────────────────────────
app.post('/alexa', alexaVerifier, adapter.getRequestHandlers());

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start server ───────────────────────────────────────────────────────────────
function startServer() {
  const sslDir = path.join(__dirname, '..', 'ssl');
  const certPath = path.join(sslDir, 'cert.pem');
  const keyPath = path.join(sslDir, 'key.pem');

  // Check if SSL certificates exist
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const credentials = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
    https.createServer(credentials, app).listen(PORT, () => {
      console.log(`✅  HTTPS server running on port ${PORT}`);
      console.log(`   Alexa endpoint: https://your-domain.com:${PORT}/alexa`);
      console.log(`   Health check:   https://your-domain.com:${PORT}/health`);
    });
  } else {
    // Fall back to HTTP for local development without certs
    console.warn(
      '⚠️  No SSL certificates found in ssl/ directory.\n' +
        '   Run "npm run generate-cert" to create a self-signed cert, or\n' +
        '   place your Let\'s Encrypt cert.pem and key.pem in the ssl/ folder.\n' +
        '   Starting HTTP server for local development only...'
    );
    http.createServer(app).listen(PORT, () => {
      console.log(`⚡  HTTP server running on port ${PORT} (dev only)`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
    });
  }
}

startServer();
