'use strict';

const clickupService = require('../services/clickupService');

const ClickUpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'ClickUpIntent'
    );
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots || {};
    const action = slots.action?.value?.toLowerCase() || 'list';
    const taskName = slots.taskName?.value;

    try {
      // ── Create a task ──────────────────────────────────────────────────────
      if (action === 'create' || action === 'add') {
        if (!taskName) {
          return handlerInput.responseBuilder
            .speak('What should I name the task?')
            .reprompt('Please tell me the task name.')
            .getResponse();
        }
        const task = await clickupService.createTask(taskName);
        return handlerInput.responseBuilder
          .speak(`Done! I created a task called "${task.name}" in ClickUp.`)
          .reprompt('Anything else?')
          .getResponse();
      }

      // ── List tasks ────────────────────────────────────────────────────────
      if (action === 'list' || action === 'show') {
        const tasks = await clickupService.listTasks(5);
        if (tasks.length === 0) {
          return handlerInput.responseBuilder
            .speak('You have no open tasks in ClickUp right now.')
            .getResponse();
        }
        const taskList = tasks.map((t, i) => `${i + 1}. ${t.name}`).join('. ');
        return handlerInput.responseBuilder
          .speak(`Here are your top open tasks: ${taskList}.`)
          .reprompt('Anything else?')
          .getResponse();
      }

      // ── Unknown action fallback ───────────────────────────────────────────
      return handlerInput.responseBuilder
        .speak(
          'I can create or list ClickUp tasks. Try saying "add a task" or "list my tasks".'
        )
        .reprompt('What would you like to do with ClickUp?')
        .getResponse();
    } catch (err) {
      console.error('[ClickUpIntent] Error:', err.message);
      return handlerInput.responseBuilder
        .speak('Sorry, I had trouble connecting to ClickUp. Please check your configuration and try again.')
        .getResponse();
    }
  },
};

module.exports = { ClickUpIntentHandler };
