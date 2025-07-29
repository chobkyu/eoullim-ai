from pydantic import BaseModel

class SpeechResult(BaseModel):
    expected: str
    actual: str
    correct: bool
    explanation: str