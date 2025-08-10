from Levenshtein import distance as levenshtein_distance
import jellyfish
from jamo import h2j

def split_jamo(text: str) -> str:
    return ''.join(h2j(char) for char in text)

def evaluate_pronunciation_accuracy(expected: str, spoken: str) -> dict:
    # 1. 문자 단위 Levenshtein
    char_dist = levenshtein_distance(expected, spoken)
    char_similarity = 1 - char_dist / max(len(expected), len(spoken))

    # 2. 자모(Jamo) 단위 Levenshtein
    expected_jamo = split_jamo(expected)
    spoken_jamo = split_jamo(spoken)
    jamo_dist = levenshtein_distance(expected_jamo, spoken_jamo)
    jamo_similarity = 1 - jamo_dist / max(len(expected_jamo), len(spoken_jamo))

    # 3. Jaro-Winkler 유사도
    jaro_similarity = jellyfish.jaro_winkler_similarity(expected, spoken)

    # 4. 평균 점수 계산
    average_score = round((char_similarity + jamo_similarity + jaro_similarity) / 3 * 100, 2)

    return {
        "char_similarity": round(char_similarity * 100, 2),
        "jamo_similarity": round(jamo_similarity * 100, 2),
        "jaro_similarity": round(jaro_similarity * 100, 2),
        "average_score": average_score
    }
