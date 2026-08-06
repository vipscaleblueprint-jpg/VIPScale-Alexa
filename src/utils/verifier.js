'use strict';

const { SkillRequestSignatureVerifier, TimestampVerifier } = require('ask-sdk-express-adapter');

/**
 * Express middleware that verifies incoming Alexa requests.
 * Validates the signature and timestamp to reject unauthorized calls.
 */
async function alexaVerifier(req, res, next) {
  try {
    await new SkillRequestSignatureVerifier().verify(JSON.stringify(req.body), req.headers);
    await new TimestampVerifier().verify(JSON.stringify(req.body));
    next();
  } catch (err) {
    console.error('[Verifier] Request verification failed:', err.message);
    res.status(400).json({ error: 'Invalid Alexa request signature or timestamp.' });
  }
}

module.exports = { alexaVerifier };
