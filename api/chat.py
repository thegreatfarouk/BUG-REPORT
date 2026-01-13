"""
Form Builder Bug Report - Chat API Handler
Vercel Serverless Function for processing chat messages with OpenRouter API
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import requests

# System prompt for the QA Engineer AI
SYSTEM_PROMPT = """You are a **professional QA engineer AI** specialized in generating **developer-ready bug reports** for a **low-code Form Builder platform**.

Your sole responsibility is to rewrite user-reported issues into **clear, precise, professional bug reports** that are ready to be logged in **DevOps / Jira / Azure Boards**.

You MUST strictly follow all rules below.

---

## Output Rules (MANDATORY)

* Output **Markdown only**
* Output **ONLY the bug report** — nothing else
* Do **NOT** suggest solutions, improvements, workarounds, or fixes
* Do **NOT** add commentary, explanations, assumptions, or opinions
* Do **NOT** add headers, footers, introductions, or conclusions
* Do **NOT** ask questions or request clarification
* Do **NOT** make assumptions or infer missing information
* Do **NOT** add extra sections
* Do **NOT** include screenshots or references to images
* Do **NOT** include environment, severity, priority, or notes unless explicitly provided
* Do **NOT** use tables
* Use **professional, neutral QA language**
* Be concise, accurate, and unambiguous

---

## Bug Report Structure (STRICT)

The output MUST contain **only** the following sections, in this exact order, with the separator line included exactly as shown:

Summary:
_______________________________________________________

Title:
_______________________________________________________

Reproduce Steps:
_______________________________________________________

Actual Result:
_______________________________________________________

Expected Result:

Rules:

* Each section must be clearly labeled
* The separator line must exist between sections
* Do not merge sections
* Do not add or remove sections

---

## Section Writing Rules

### Summary

* Maximum 1–2 sentences
* Describe the issue and its impact only
* No steps, domain explanations, or solutions

### Title

* Must follow this format:

  Area | Module | Component | Issue description

### Reproduce Steps

* Use a numbered list
* Steps must be deterministic and reproducible
* Include URLs **only if explicitly provided by the user**
* All URLs must be wrapped in double quotes "like this"

### Actual Result

* Use bullet points
* Describe the incorrect system behavior only

### Expected Result

* Use bullet points
* Describe the correct, expected behavior
* Must clearly contrast with the Actual Result

---

## Platform Domain Knowledge (MANDATORY CONTEXT)

Assume the platform includes:

* Form Builder
* View App
* Print Out Feature
* Data Model
* Pages
* Reports (Chart, Statistics)

Be aware of common issue categories:

* Time fields (12H vs 24H behavior)
* RTL / Arabic localization issues
* Table inline editing and value persistence
* Print layout alignment, pagination, and numbering
* Authentication timeout and session handling
* UI configuration vs runtime behavior inconsistencies

Your audience is **developers**, not end users.

---

## Absolute Rule

You must **never** output anything except the structured bug report defined above.
No explanations. No suggestions. No meta text."""

# OpenRouter API configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "allenai/molmo-2-8b:free"


class handler(BaseHTTPRequestHandler):
    """HTTP request handler for the chat API endpoint"""

    def send_cors_headers(self):
        """Add CORS headers to the response"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')

    def send_json_response(self, status_code, data):
        """Send a JSON response with proper headers"""
        self.send_response(status_code)
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def send_error_response(self, status_code, message):
        """Send an error response"""
        self.send_json_response(status_code, {'error': message})

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def do_POST(self):
        """Handle POST requests to the chat endpoint"""
        try:
            # Read and parse request body
            content_length = int(self.headers.get('Content-Length', 0))
            raw_body = self.rfile.read(content_length)
            
            try:
                body = json.loads(raw_body.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_error_response(400, 'Invalid JSON in request body')
                return

            # Get API key from environment
            api_key = os.environ.get('OPENROUTER_API_KEY')
            if not api_key:
                self.send_error_response(500, 'API key not configured. Please set OPENROUTER_API_KEY environment variable.')
                return

            # Get messages from request
            messages = body.get('messages', [])
            if not messages:
                self.send_error_response(400, 'No messages provided in request')
                return

            # Prepend system message
            api_messages = [
                {
                    'role': 'system',
                    'content': SYSTEM_PROMPT
                }
            ]

            # Process and add user messages
            for msg in messages:
                role = msg.get('role', 'user')
                content = msg.get('content', [])
                
                # Handle content array format
                if isinstance(content, list):
                    api_messages.append({
                        'role': role,
                        'content': content
                    })
                else:
                    # Handle simple string content
                    api_messages.append({
                        'role': role,
                        'content': [{'type': 'text', 'text': str(content)}]
                    })

            # Get site URL for OpenRouter headers
            site_url = os.environ.get('SITE_URL', 'https://form-builder-bug-report.vercel.app')

            # Prepare OpenRouter API request
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json',
                'HTTP-Referer': site_url,
                'X-Title': 'Form Builder Bug Report'
            }

            payload = {
                'model': MODEL,
                'messages': api_messages,
                'max_tokens': MAX_TOKENS,
                'temperature': TEMPERATURE
            }

            # Make request to OpenRouter API
            try:
                response = requests.post(
                    OPENROUTER_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=REQUEST_TIMEOUT
                )
            except requests.exceptions.Timeout:
                self.send_error_response(504, 'Request to AI service timed out')
                return
            except requests.exceptions.RequestException as e:
                self.send_error_response(502, f'Failed to connect to AI service: {str(e)}')
                return

            # Handle API response
            if response.status_code != 200:
                error_detail = 'Unknown error'
                try:
                    error_data = response.json()
                    error_detail = error_data.get('error', {}).get('message', str(error_data))
                except:
                    error_detail = response.text[:200] if response.text else 'No error details'
                
                self.send_error_response(
                    response.status_code,
                    f'AI service error: {error_detail}'
                )
                return

            # Return successful response
            try:
                response_data = response.json()
                self.send_json_response(200, response_data)
            except json.JSONDecodeError:
                self.send_error_response(502, 'Invalid response from AI service')

        except Exception as e:
            # Catch-all error handler
            self.send_error_response(500, f'Internal server error: {str(e)}')
