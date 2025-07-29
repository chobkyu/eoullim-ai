import openai
import io
import os
from dotenv import load_dotenv
load_dotenv()

# 클라이언트 인스턴스를 먼저 생성해야 합니다.
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def analyze_audio(audio_bytes: bytes, expected_word: str):
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.wav"  # 이름 지정이 필수입니다.

    # Whisper transcription
    transcription_response = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="ko"  # 또는 'auto'
    )
    spoken = transcription_response.text.strip()

    # GPT 평가 요청
    prompt = (
        f"어린이가 단어 '{expected_word}'을(를) 읽었습니다. "
        f"음성 인식 결과는 '{spoken}'입니다.\n"
        "이 어린이가 올바르게 발음했는지 평가하고, 틀렸다면 왜 틀렸는지 친절하게 설명해 주세요."
    )

    chat_response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "당신은 유아 교육 전문가입니다."},
            {"role": "user", "content": prompt}
        ]
    )

    return chat_response.choices[0].message.content.strip()
