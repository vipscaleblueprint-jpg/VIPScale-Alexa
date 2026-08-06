'use strict';

require('dotenv').config();
const { WebClient } = require('@slack/web-api');

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
const DEFAULT_CHANNEL = process.env.SLACK_CHANNEL_ID;

/**
 * Post a message to a Slack channel.
 * @param {string} text - Message to send
 * @param {string} [channel] - Channel ID override (defaults to env config)
 * @returns {Promise<object>} Slack API response
 */
async function postMessage(text, channel = DEFAULT_CHANNEL) {
  const res = await slack.chat.postMessage({ channel, text });
  return res;
}

module.exports = { postMessage };
