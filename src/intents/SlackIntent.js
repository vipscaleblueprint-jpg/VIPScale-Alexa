'use strict';

const slackService = require('../services/slackService');
const logger = require('../utils/logger');

const SlackIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'SlackIntent'
    );
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const message = slots.message?.value;

    if (!message) {
      return handlerInput.responseBuilder
        .speak('What message would you like to send to Slack?')
        .reprompt('Please tell me the message.')
        .getResponse();
    }

    try {
      await slackService.postMessage(message);
      return handlerInput.responseBuilder
        .speak(`Message sent to Slack: "${message}".`)
        .reprompt('Anything else?')
        .getResponse();
    } catch (err) {
      logger.error(`[SlackIntent] Error: ${err.message}`);
      return handlerInput.responseBuilder
        .speak('Sorry, I had trouble sending the message to Slack. Please check your bot token and try again.')
        .getResponse();
    }
  },
};

module.exports = { SlackIntentHandler };
