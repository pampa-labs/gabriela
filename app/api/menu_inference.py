import logging
from typing import List, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Request,
    UploadFile,
)
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl, ValidationError

from app.modules.openai_menu_inference import MenuItem, infer_menu_from_image

router = APIRouter()
logger = logging.getLogger(__name__)


class MenuInferenceResponse(BaseModel):
    menu_items: List[MenuItem]


class ManualMenuItem(BaseModel):
    name: str
    price: str


class MenuInput(BaseModel):
    manual_items: Optional[List[ManualMenuItem]] = None


async def validate_image(image: UploadFile):
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"]
    if not any(image.filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=400,
            detail="Invalid image file format. Allowed formats: jpg, jpeg, png, webp",
        )
    return image


def log_inference(image_filename: str, result: List[MenuItem]):
    logger.info(f"Menu inference completed for image: {image_filename}")
    logger.info(f"Inferred {len(result)} menu items")


@router.post("/infer-menu", response_model=MenuInferenceResponse)
async def infer_menu(
    request: Request,
    background_tasks: BackgroundTasks,
    image: Optional[UploadFile] = File(None),
    menu_input: Optional[MenuInput] = None,
):
    try:
        if image:
            # Image upload mode
            validated_image = await validate_image(image)
            image_url = await save_image(validated_image)
            menu_items = infer_menu_from_image(image_url)
            background_tasks.add_task(
                log_inference, validated_image.filename, menu_items
            )
        elif menu_input and menu_input.manual_items:
            # Manual entry mode
            menu_items = [
                MenuItem(name=item.name, price=item.price)
                for item in menu_input.manual_items
            ]
        else:
            raise HTTPException(
                status_code=400,
                detail="Either an image file or manual items must be provided",
            )

        return MenuInferenceResponse(menu_items=menu_items)
    except HTTPException as e:
        logger.error(f"HTTP error during menu inference: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during menu inference: {str(e)}")
        raise HTTPException(
            status_code=500, detail="An unexpected error occurred during menu inference"
        )


async def save_image(image: UploadFile) -> str:
    # Implement image saving logic here
    # For now, we'll return a placeholder URL
    return f"http://example.com/images/{image.filename}"
