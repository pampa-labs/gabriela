from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.modules.openai_menu_inference import infer_menu_from_image

router = APIRouter()


class ImageURL(BaseModel):
    url: str


@router.post("/infer-menu")
async def infer_menu(image: ImageURL):
    try:
        menu_items = infer_menu_from_image(image.url)
        return {"menu_items": menu_items}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
