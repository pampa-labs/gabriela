from typing import Any, Dict

from .agent import Agent


class WhatsAppAgent:
    def __init__(self):
        self.agent = Agent()

    def handle_message(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """
        Entrypoint for handling incoming WhatsApp messages.

        :param message: A dictionary containing message details
        :return: Response to be sent back to the user
        """
        # Extract relevant information from the message
        sender = message.get("from")
        content = message.get("text", "")
        image_url = message.get("image_url")

        # Process the message and generate a response
        response = self.process_message(sender, content, image_url)

        return response

    def process_message(
        self, sender: str, content: str, image_url: str | None
    ) -> Dict[str, Any]:
        """
        Process the incoming message and generate a response.

        :param sender: The sender's identifier
        :param content: The content of the message
        :param image_url: The URL of the image, if any
        :return: Response to be sent back to the user
        """
        return self.agent.invoke(id=sender, message=content, image_url=image_url)
