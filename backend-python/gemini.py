# gemini.py
# Connects to Google Gemini API using Python
# Requires: pip install requests python-dotenv

import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    raise Exception('GEMINI_API_KEY not set in .env file')

genai.configure(api_key=GEMINI_API_KEY)

def get_gemini_response(prompt: str) -> str:
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        # The response.text contains the generated text
        return response.text if hasattr(response, 'text') else str(response)
    except Exception as e:
        print('Gemini API error:', e)
        raise
