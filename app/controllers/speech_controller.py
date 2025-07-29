from fastapi import APIRouter, UploadFile, File
from app.services.speech_service import SpeechService
from app.schemas.speech_schema import SpeechResult

router = APIRouter()
speech_service = SpeechService()

@router.post("/evaluate", response_model=SpeechResult)
async def evaluate_speech(word: str, audio: UploadFile = File(...)):
    return await speech_service.evaluate(word, audio)