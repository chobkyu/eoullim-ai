from fastapi import APIRouter, UploadFile, Form
from app.services.evaluate_service import evaluate_pronunciation

router = APIRouter()

@router.post("/evaluate")
async def evaluate(audio: UploadFile, word: str = Form(...)):
    return await evaluate_pronunciation(audio, word)
