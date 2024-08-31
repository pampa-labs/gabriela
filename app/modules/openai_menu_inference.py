import json
from typing import List, Optional

from fastapi import HTTPException
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field, validator

from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


class MenuItem(BaseModel):
    name: str
    description: Optional[str] = Field(
        None, description="Optional description of the menu item"
    )
    price: str
    category: Optional[str] = Field(
        None,
        description="Category of the menu item, e.g., 'Appetizer', 'Main Course', etc.",
    )

    @validator("price")
    def validate_price(cls, v):
        if not v.replace(".", "").isdigit():
            raise ValueError("Price must be a valid number")
        return v


class MenuResponse(BaseModel):
    menu_items: List[MenuItem]


def infer_menu_from_image(image_url: str) -> List[MenuItem]:
    try:
        completion = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "system",
                    "content": "You are a menu analysis expert. Analyze images of menus and extract structured information about menu items, including their category if possible. Ensure prices are in a consistent format.",
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Analyze this image of a menu and extract the menu items. Include the category for each item if you can determine it. Ensure prices are in a consistent format (e.g., $X.XX).",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                            },
                        },
                    ],
                },
            ],
            max_tokens=1500,
            response_format={"type": "json_object"},
        )

        menu_response = MenuResponse.parse_raw(completion.choices[0].message.content)
        return menu_response.menu_items
    except OpenAIError as e:
        raise HTTPException(status_code=503, detail=f"OpenAI service error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inferring menu: {str(e)}")


# Example usage (for testing purposes)
if __name__ == "__main__":
    image_url = "https://example.com/path/to/menu_image.jpg"
    menu = infer_menu_from_image(image_url)
    print(json.dumps([item.dict() for item in menu], indent=2))
