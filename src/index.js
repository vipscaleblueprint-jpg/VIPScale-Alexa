'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const { adapter } = require('./alexaHandler');
const { alexaVerifier } = require('./utils/verifier');
const logger = require('./utils/logger');

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

// ── Morgan HTTP Request Logger ────────────────────────────────────────────────
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message) => logger.info(`HTTP Request: ${message.trim()}`),
    },
  })
);

// ── Alexa Intent Logging Middleware ───────────────────────────────────────────
app.use((req, res, next) => {
  if ((req.path === '/alexa' || req.path === '/') && req.body) {
    logger.info(`Alexa Headers: ${JSON.stringify(req.headers)}`);
    logger.info(`Alexa Request Type: ${req.body.request?.type}`);
    if (req.body.request?.type === 'IntentRequest') {
      const intent = req.body.request.intent;
      logger.info(`Alexa Intent Name:  ${intent?.name}`);
      const slots = Object.values(intent?.slots || {}).filter(s => s.value);
      if (slots.length > 0) {
        logger.info(`Alexa Slots:        ${JSON.stringify(slots.map(s => `${s.name}=${s.value}`))}`);
      }
    }
  }
  next();
});

// ── Health check endpoint ──────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Alexa skill endpoint ───────────────────────────────────────────────────────
app.post(['/', '/alexa'], alexaVerifier, async (req, res, next) => {
  try {
    const responseEnvelope = await adapter.skill.invoke(req.body);
    res.json(responseEnvelope);
  } catch (err) {
    next(err);
  }
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Error handling middleware ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`[Express] Unhandled Error: ${err.message}\n${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error' });
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
      logger.info(`✅ HTTPS server running on port ${PORT}`);
      logger.info(`   Alexa endpoint: https://your-domain.com:${PORT}/alexa`);
      logger.info(`   Health check:   https://your-domain.com:${PORT}/health`);
    });
  } else {
    // Fall back to HTTP for local development without certs
    logger.warn(
      'No SSL certificates found in ssl/ directory.\n' +
        '   Run "npm run generate-cert" to create a self-signed cert, or\n' +
        '   place your Let\'s Encrypt cert.pem and key.pem in the ssl/ folder.\n' +
        '   Starting HTTP server for local development only...'
    );
    http.createServer(app).listen(PORT, () => {
      logger.info(`⚡ HTTP server running on port ${PORT} (dev only)`);
      logger.info(`   Health check: http://localhost:${PORT}/health`);
    });
  }
}

startServer();
