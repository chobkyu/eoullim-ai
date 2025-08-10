from fastapi import APIRouter, UploadFile, Form
from app.services.evaluate_service import evaluate_pronunciation
from fastapi.responses import StreamingResponse
import openai, io, os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
router = APIRouter()

@router.post("/evaluate")
async def evaluate(audio: UploadFile, word: str = Form(...)):
    feedback_text = await evaluate_pronunciation(audio, word)
    print(feedback_text)
     # TTS 변환
    tts_response = openai.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input=feedback_text['feedback']
    )

    audio_stream = io.BytesIO(tts_response.read())
    return StreamingResponse(audio_stream, media_type="audio/mpeg")
 