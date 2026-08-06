'use strict';

// ─── Launch Request ────────────────────────────────────────────────────────────
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speech =
      'Welcome to VIP Scale! I can answer your questions using Gemini AI, ' +
      'create or list tasks in ClickUp, or send messages to Slack. What would you like to do?';
    return handlerInput.responseBuilder
      .speak(speech)
      .reprompt('What would you like me to do?')
      .getResponse();
  },
};

// ─── Help Intent ───────────────────────────────────────────────────────────────
const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput) {
    const speech =
      'Here is what I can do. You can ask me any question and I will use Gemini AI to answer it. ' +
      'Say "add a task" followed by the task name to create a ClickUp task. ' +
      'Say "list my tasks" to hear your open ClickUp tasks. ' +
      'Say "send a message" followed by your message to post to Slack. ' +
      'What would you like to do?';
    return handlerInput.responseBuilder.speak(speech).reprompt(speech).getResponse();
  },
};

// ─── Cancel / Stop Intent ──────────────────────────────────────────────────────
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      ['AMAZON.CancelIntent', 'AMAZON.StopIntent'].includes(
        handlerInput.requestEnvelope.request.intent.name
      )
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak('Goodbye!').getResponse();
  },
};

// ─── Session Ended ─────────────────────────────────────────────────────────────
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log('[Session] Ended:', handlerInput.requestEnvelope.request.reason);
    return handlerInput.responseBuilder.getResponse();
  },
};

// ─── Error Handler ─────────────────────────────────────────────────────────────
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.error('[ErrorHandler]', error.message, error.stack);
    const speech =
      'Sorry, I ran into an issue processing your request. Please try again.';
    return handlerInput.responseBuilder.speak(speech).reprompt(speech).getResponse();
  },
};

module.exports = {
  LaunchRequestHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  ErrorHandler,
};
