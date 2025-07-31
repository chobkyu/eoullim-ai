import openai
import io
import os
from dotenv import load_dotenv

from app.util.evaluate_similarity import evaluate_pronunciation_accuracy
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

    similarity = evaluate_pronunciation_accuracy(expected_word, spoken)


    # GPT 평가 요청
    prompt = (
        f"어린이가 단어 '{expected_word}'을(를) 읽었습니다.\n"
        f"음성 인식 결과는 '{spoken}'입니다.\n"
        f"발음 유사도 평가는 다음과 같습니다:\n"
        f"- 문자 유사도: {similarity['char_similarity']}%\n"
        f"- 자모 유사도: {similarity['jamo_similarity']}%\n"
        f"- Jaro-Winkler 유사도: {similarity['jaro_similarity']}%\n"
        f"- 종합 평균 유사도 점수: {similarity['average_score']}%\n\n"
        "이 정보를 바탕으로 어린이가 발음을 얼마나 정확히 했는지 평가해 주세요. "
        "발음이 부정확하다면 어떤 부분이 틀렸는지도 함께 설명해 주세요."
    )

    chat_response = client.chat.completions.create(
        model="gpt-4.1-nano",
        messages=[
            {"role": "system", "content": "당신은 유아 교육 전문가입니다."},
            {"role": "user", "content": prompt}
        ]
    )

    return chat_response.choices[0].message.content.strip()
