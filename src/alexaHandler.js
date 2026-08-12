'use strict';

const Alexa = require('ask-sdk-core');
const { ExpressAdapter } = require('ask-sdk-express-adapter');

const { AskGeminiIntentHandler } = require('./intents/AskGeminiIntent');
const { ClickUpIntentHandler } = require('./intents/ClickUpIntent');
const { SlackIntentHandler } = require('./intents/SlackIntent');
const {
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler,
} = require('./intents/StandardHandlers');

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
