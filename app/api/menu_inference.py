import logging
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl, ValidationError

from app.config import settings
from app.modules.openai_menu_inference import MenuItem, infer_menu_from_image

router = APIRouter()
logger = logging.getLogger(__name__)


class ImageURL(BaseModel):
    url: HttpUrl


class MenuInferenceResponse(BaseModel):
    menu_items: List[MenuItem]


async def validate_image_url(image: ImageURL):
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"]
    if not any(image.url.path.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Invalid image file format. Allowed formats: jpg, jpeg, png, webp",
        )
    return image


def log_inference(image_url: str, result: List[MenuItem]):
    logger.info(f"Menu inference completed for image: {image_url}")
    logger.info(f"Inferred {len(result)} menu items")


@router.post("/infer-menu", response_model=MenuInferenceResponse)
async def infer_menu(
    request: Request,
    background_tasks: BackgroundTasks,
    image: ImageURL = Depends(validate_image_url),
):
    try:
        logger.info(f"Inferring menu from image: {image.url}")
        menu_items = infer_menu_from_image(str(image.url))
        background_tasks.add_task(log_inference, str(image.url), menu_items)
        return MenuInferenceResponse(menu_items=menu_items)
    except HTTPException as e:
        logger.error(f"HTTP error during menu inference: {e.detail}")
        raise e
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during menu inference: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An unexpected error occurred during menu inference"
        )
