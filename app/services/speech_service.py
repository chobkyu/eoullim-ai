from app.repository.word_repository import WordRepository
from app.schemas.speech_schema import SpeechResult
import openai

class SpeechService:
    def __init__(self):
        self.repo = WordRepository()

    async def evaluate(self, expected_word: str, audio):
        # 실제로는 Whisper나 다른 API를 활용
        audio_content = await audio.read()
        transcribed = await self.transcribe(audio_content)
        
        correct = expected_word.strip() == transcribed.strip()
        explanation = "" if correct else f"'{transcribed}' 라고 발음했어요. '{expected_word}' 와 달라요."
        
        return SpeechResult(
            expected=expected_word,
            actual=transcribed,
            correct=correct,
            explanation=explanation
        )

    async def transcribe(self, audio_content: bytes) -> str:
        # 예시: OpenAI Whisper API 사용
        response = openai.Audio.transcribe(
            model="whisper-1",
            file=audio_content,
            language="ko"
        )
        return response['text']
