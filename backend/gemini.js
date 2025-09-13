// gemini.js
// This module connects to Google Gemini API using Node.js
// Requires: npm install axios dotenv

require('dotenv').config();
const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not set in .env file');
}

/**
 * Sends a prompt to Google Gemini and returns the response.
 * @param {string} prompt - The prompt to send to Gemini.
 * @returns {Promise<string>} - The generated response from Gemini.
 */
async function getGeminiResponse(prompt) {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    // Extract the generated text from the response
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getGeminiResponse };
