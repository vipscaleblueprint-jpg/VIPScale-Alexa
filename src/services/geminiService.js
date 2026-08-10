'use strict';

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

// In-memory session store: sessionId → { chat, lastUsed }
const sessions = new Map();

// Clean up sessions older than 30 minutes
const SESSION_TTL_MS = 30 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastUsed > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

/**
 * Send a message to Gemini within a session context.
 * @param {string} sessionId - Alexa session ID for conversation continuity
 * @param {string} message - User's query
 * @returns {Promise<string>} - Gemini's text response
 */
async function chat(sessionId, message) {
  let sessionData = sessions.get(sessionId);

  if (!sessionData) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction:
        'You are a helpful voice assistant. Keep responses concise and clear, ' +
        'suitable for speech output. Avoid using markdown, bullet points, or ' +
        'special characters. Respond in plain conversational sentences.',
    });
    const chatSession = model.startChat({ history: [] });
    sessionData = { chat: chatSession, lastUsed: Date.now() };
    sessions.set(sessionId, sessionData);
  }

  sessionData.lastUsed = Date.now();
  console.log(`[GeminiService] Calling Gemini API (session: ${sessionId.substring(0, 15)}...) with prompt: "${message}"`);

  try {
    const result = await sessionData.chat.sendMessage(message);
    const textResponse = result.response.text();
    console.log(`[GeminiService] Success! Response: "${textResponse}"`);
    return textResponse;
  } catch (err) {
    console.error('[GeminiService] Error calling Gemini API:', err.message);
    throw new Error('Gemini API call failed');
  }
}

module.exports = { chat };
