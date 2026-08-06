'use strict';

const geminiService = require('../services/geminiService');

const AskGeminiIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AskGeminiIntent'
    );
  },
  async handle(handlerInput) {
    const sessionId = handlerInput.requestEnvelope.session.sessionId;
    const querySlot = handlerInput.requestEnvelope.request.intent.slots?.query;
    const query = querySlot?.value;

    if (!query) {
      return handlerInput.responseBuilder
        .speak('What would you like to ask Gemini?')
        .reprompt('Go ahead and ask your question.')
        .getResponse();
    }

    try {
      const answer = await geminiService.chat(sessionId, query);

      // Truncate very long responses to stay within Alexa's 8-second TTS limit
      const truncated =
        answer.length > 2000
          ? answer.substring(0, 2000) + '... I can continue if you ask me to.'
          : answer;

      return handlerInput.responseBuilder
        .speak(truncated)
        .reprompt('Do you have another question?')
        .getResponse();
    } catch (err) {
      console.error('[AskGeminiIntent] Error:', err.message);
      return handlerInput.responseBuilder
        .speak('Sorry, I had trouble reaching Gemini right now. Please try again in a moment.')
        .getResponse();
    }
  },
};

module.exports = { AskGeminiIntentHandler };
