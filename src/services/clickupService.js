'use strict';

require('dotenv').config();
const axios = require('axios');
const logger = require('../utils/logger');

const BASE_URL = 'https://api.clickup.com/api/v2';
const TOKEN = process.env.CLICKUP_API_TOKEN;
const LIST_ID = process.env.CLICKUP_LIST_ID;

const headers = {
  Authorization: TOKEN,
  'Content-Type': 'application/json',
};

/**
 * Create a new task in the configured ClickUp list.
 * @param {string} name - Task name
 * @param {string} [description] - Optional task description
 * @returns {Promise<object>} Created task object
 */
async function createTask(name, description = '') {
  logger.info(`[ClickUpService] Creating task: "${name}"`);
  try {
    const res = await axios.post(
      `${BASE_URL}/list/${LIST_ID}/task`,
      { name, description, status: 'to do' },
      { headers }
    );
    logger.info(`[ClickUpService] Task created successfully: ${res.data.url}`);
    return res.data;
  } catch (err) {
    logger.error(`[ClickUpService] Error creating task: ${JSON.stringify(err.response?.data || err.message)}`);
    throw err;
  }
}

/**
 * List open tasks in the configured ClickUp list.
 * @param {number} [limit=5] - Max tasks to return
 * @returns {Promise<Array>} Array of task objects
 */
async function listTasks(limit = 5) {
  logger.info(`[ClickUpService] Fetching tasks (limit ${limit})`);
  try {
    const res = await axios.get(`${BASE_URL}/list/${LIST_ID}/task`, {
      headers,
      params: { statuses: ['to do', 'in progress'], order_by: 'created', reverse: true },
    });
    const tasks = (res.data.tasks || []).slice(0, limit);
    logger.info(`[ClickUpService] Successfully fetched ${tasks.length} tasks`);
    return tasks;
  } catch (err) {
    logger.error(`[ClickUpService] Error listing tasks: ${JSON.stringify(err.response?.data || err.message)}`);
    throw err;
  }
}

/**
 * Update a task's status by its ID.
 * @param {string} taskId - ClickUp task ID
 * @param {string} status - New status (e.g., 'complete', 'in progress')
 * @returns {Promise<object>} Updated task object
 */
async function updateTaskStatus(taskId, status) {
  logger.info(`[ClickUpService] Updating task ${taskId} status to "${status}"`);
  try {
    const res = await axios.put(
      `${BASE_URL}/task/${taskId}`,
      { status },
      { headers }
    );
    logger.info(`[ClickUpService] Task status updated successfully`);
    return res.data;
  } catch (err) {
    logger.error(`[ClickUpService] Error updating task status: ${JSON.stringify(err.response?.data || err.message)}`);
    throw err;
  }
}

module.exports = { createTask, listTasks, updateTaskStatus };
