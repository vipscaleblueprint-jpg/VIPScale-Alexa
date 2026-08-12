'use strict';

const { SkillRequestSignatureVerifier, TimestampVerifier } = require('ask-sdk-express-adapter');
const logger = require('./logger');

/**
 * Express middleware that verifies incoming Alexa requests.
 * Validates the signature and timestamp to reject unauthorized calls.
 */
async function alexaVerifier(req, res, next) {
  if (process.env.BYPASS_ALEXA_VERIFICATION === 'true') {
    logger.warn('[Verifier] Alexa request verification bypassed (BYPASS_ALEXA_VERIFICATION is true)');
    return next();
  }
  try {
    const rawBody = req.rawBody || JSON.stringify(req.body);
    await new SkillRequestSignatureVerifier().verify(rawBody, req.headers);
    await new TimestampVerifier().verify(rawBody);
    next();
  } catch (err) {
    logger.error(`[Verifier] Request verification failed: ${err.message}`);
    res.status(400).json({ error: 'Invalid Alexa request signature or timestamp.' });
  }
}

module.exports = { alexaVerifier };
