from fastapi import UploadFile
from app.repository.openai_repository import analyze_audio

async def evaluate_pronunciation(audio: UploadFile, word: str):
    audio_bytes = await audio.read()
    feedback = await analyze_audio(audio_bytes, word)
    return { "feedback": feedback }
