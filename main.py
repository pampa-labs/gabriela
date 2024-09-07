from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from openai import OpenAI
from dotenv import load_dotenv
import os
from agent.core import WhatsappAgent


# Cargar variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)

# Inicializar el agente de WhatsApp
wa = WhatsappAgent()

@app.route('/whatsapp', methods=['POST'])
def whatsapp_reply():
    incoming_msg = request.values.get('Body', '').strip()  # Mensaje recibido
    sender = request.values.get('From', '').strip()  # Número del remitente
    resp = MessagingResponse()
    msg = resp.message()

    if incoming_msg:
        # Llamada al agente personalizado para generar una respuesta
        try:
            # Llamada al método handle_message de WhatsappAgent
            agent_response = wa.handle_message({'from': sender, 'text': incoming_msg})['messages'][-1].content
            msg.body(agent_response)  # Envía la respuesta generada por el agente
        except Exception as e:
            msg.body(f"Lo siento, ocurrió un error: {e}")
    else:
        msg.body("No entiendo tu mensaje. ¿Puedes repetirlo?")

    return str(resp)

if __name__ == '__main__':
    app.run(debug=True)