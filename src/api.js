import axios from 'axios';
import { getConfig } from './config.js';

const BASE_URL = 'https://api.symanto.net';

function getClient() {
  const apiKey = getConfig('apiKey');
  if (!apiKey) {
    throw new Error(
      'API key not configured. Run: symanto config set --api-key YOUR_KEY'
    );
  }
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
  });
}

async function post(endpoint, payload) {
  const client = getClient();
  try {
    const response = await client.post(endpoint, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        JSON.stringify(error.response.data);
      throw new Error(`Symanto API error ${status}: ${message}`);
    }
    throw new Error(`Network error: ${error.message}`);
  }
}

export async function analyzeSentiment(text, language = 'en') {
  return post('/sentiment', [{ id: '1', text, language }]);
}

export async function analyzeEmotion(text, language = 'en') {
  return post('/emotion', [{ id: '1', text, language }]);
}

export async function analyzeEkmanEmotion(text, language = 'en') {
  return post('/ekman-emotion', [{ id: '1', text, language }]);
}

export async function detectLanguage(text) {
  return post('/language-detection', [{ id: '1', text }]);
}

export async function analyzePersonality(text, language = 'en') {
  return post('/personality', [{ id: '1', text, language }]);
}

export async function analyzeCommunication(text, language = 'en') {
  return post('/communication', [{ id: '1', text, language }]);
}

export async function analyzeTopicSentiment(text, language = 'en') {
  return post('/topic-sentiment', [{ id: '1', text, language }]);
}
