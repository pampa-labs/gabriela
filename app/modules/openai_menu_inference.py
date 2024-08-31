import json
import os
from enum import Enum
from typing import Dict, List

from fastapi import HTTPException
from openai import OpenAI
from pydantic import BaseModel

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


class MenuItem(BaseModel):
    name: str
    description: str = None
    price: str


class MenuResponse(BaseModel):
    menu_items: List[MenuItem]


def infer_menu_from_image(image_url: str) -> List[Dict[str, str]]:
    try:
        response = client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this image of a menu and return a structured JSON list of menu items. Each item should include 'name', 'description' (if available), and 'price'.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                            },
                        },
                    ],
                }
            ],
            max_tokens=1000,
            response_format={"type": "json_object"},
        )

        # Parse the JSON response
        menu_response = MenuResponse.parse_raw(response.choices[0].message.content)
        return menu_response.menu_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inferring menu: {str(e)}")


# Example usage (for testing purposes)
if __name__ == "__main__":
    image_url = "https://example.com/path/to/menu_image.jpg"
    menu = infer_menu_from_image(image_url)
    print(json.dumps([item.dict() for item in menu], indent=2))
