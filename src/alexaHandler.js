'use strict';

const Alexa = require('ask-sdk-core');
const { ExpressAdapter } = require('ask-sdk-express-adapter');

const {
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler,
} = require('./intents/StandardHandlers');

// ── Mock handlers for testing without external services ────────────────────────

const AskGeminiIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AskGeminiIntent'
    );
  },
  handle(handlerInput) {
    const query = handlerInput.requestEnvelope.request.intent.slots?.query?.value || 'your question';
    return handlerInput.responseBuilder
      .speak(`Test response: You asked Gemini "${query}". Gemini is currently offline in test mode.`)
      .reprompt('Is there anything else I can do for you?')
      .getResponse();
  }
};

const ClickUpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'ClickUpIntent'
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Test response: ClickUp integration is currently disabled in test mode.')
      .reprompt('Is there anything else I can do for you?')
      .getResponse();
  }
};

const SlackIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'SlackIntent'
    );
  },
  handle(handlerInput) {
    const message = handlerInput.requestEnvelope.request.intent.slots?.message?.value || 'nothing';
    return handlerInput.responseBuilder
      .speak(`Test response: You tried to send "${message}" to Slack. Slack is currently disabled in test mode.`)
      .reprompt('Is there anything else I can do for you?')
      .getResponse();
  }
};

// Build the Alexa skill with all intent handlers registered in priority order
const skill = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    AskGeminiIntentHandler,
    ClickUpIntentHandler,
    SlackIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .create();

// Create an Express-compatible adapter from the skill (verification is handled by custom middleware)
const adapter = new ExpressAdapter(skill, false, false);

module.exports = { adapter };
