# Gabriela - WhatsApp AI Assistant

Gabriela is an AI-powered WhatsApp assistant built using FastAPI, Twilio, and OpenAI.

## Setup Instructions

1. Clone the repository
2. Install dependencies using Poetry:
   ```
   poetry install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   LANGSMITH_API_KEY=your_langsmith_api_key
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_PROJECT=gabriela
   PORT=8000
   ```
   Replace `your_openai_api_key` and `your_langsmith_api_key` with your actual API keys.

4. Run the FastAPI server:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

5. Set up Twilio webhook:
   - Create a Twilio account and set up a WhatsApp Sandbox
   - Set the webhook URL to your server's `/whatsapp` endpoint

## Usage

Once set up, users can interact with Gabriela by sending messages to the configured WhatsApp number. Gabriela will process the messages and respond accordingly.

## Development

This project uses Poetry for dependency management. To add or update dependencies, use the appropriate Poetry commands.

For more information on the project structure and components, refer to the source code and comments within the files.
