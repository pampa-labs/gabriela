from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from openai import OpenAI
from dotenv import load_dotenv
import os

# Cargar variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)

# Inicializar el cliente de OpenAI
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

@app.route('/whatsapp', methods=['POST'])
def whatsapp_reply():
    incoming_msg = request.values.get('Body', '').strip()  # Mensaje recibido
    resp = MessagingResponse()
    msg = resp.message()

    if incoming_msg:
        # Llamada a OpenAI GPT-4 para generar una respuesta
        try:
            chat_completion = client.chat.completions.create(
                model="gpt-4o",  # Cambia a GPT-4
                messages=[
                    {"role": "system", "content": "Eres un asistente útil y respondes en español."},
                    {"role": "user", "content": incoming_msg}
                ],
                max_tokens=150  # Ajusta según la longitud de la respuesta que quieras
            )
            gpt_response = chat_completion.choices[0].message.content.strip()
            msg.body(gpt_response)  # Envía la respuesta generada por GPT-4
        except Exception as e:
            msg.body(f"Lo siento, ocurrió un error: {e}")
    else:
        msg.body("No entiendo tu mensaje. ¿Puedes repetirlo?")

    return str(resp)

if __name__ == '__main__':
    app.run(debug=True)