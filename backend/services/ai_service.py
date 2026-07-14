import requests
import json
import os
import re
import time

# ─── Claude: Generate AI explanation for wrong answer ────────────────────────

def generate_solution(question_no, correct_answer, student_answer):
    prompt = f"""
    You are an expert exam coach. A student got a question wrong.
    Question number: {question_no}
    Correct answer: {correct_answer}
    Student's answer: {student_answer or 'Did not attempt'}

    Please provide:
    1. A clear concept explanation.
    2. Why the student's answer is wrong (if they attempted).
    3. Key takeaways (3-4 bullet points).
    4. A link to similar practice questions (if known).

    Respond in JSON format with keys: explanation, why_wrong, key_takeaways (array), similar_questions_url.
    """
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': os.getenv('CLAUDE_API_KEY'),
        'anthropic-version': '2023-06-01'
    }
    data = {
        'model': 'claude-3-opus-20240229',
        'max_tokens': 500,
        'messages': [{'role': 'user', 'content': prompt}]
    }
    try:
        response = requests.post('https://api.anthropic.com/v1/messages', headers=headers, json=data)
        response.raise_for_status()
        content = response.json()['content'][0]['text']
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        else:
            return {
                'explanation': content,
                'why_wrong': 'Please review the concept.',
                'key_takeaways': ['Review basics'],
                'similar_questions_url': None
            }
    except Exception as e:
        print('Claude API error:', e)
        raise


# ─── Gemini: AI Edit a question ──────────────────────────────────────────────

def ai_edit_question(question_data: dict) -> dict:
    """
    Use Gemini to clean/improve a question's text, options, and verify correct answer.
    question_data: {question_text, option_a, option_b, option_c, option_d, correct_answer}
    Returns: {question_text, option_a, option_b, option_c, option_d, correct_answer, notes}
    """
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return {'error': 'GEMINI_API_KEY not set in .env'}

    prompt = f"""You are an expert question editor for competitive exams (SSC, RRB, Banking, etc.).
Clean and improve the following exam question. Fix any formatting issues, remove HTML artifacts,
correct spelling mistakes, and ensure the question and options are clear.

Question Text: {question_data.get('question_text', '')}
Option A: {question_data.get('option_a', '')}
Option B: {question_data.get('option_b', '')}
Option C: {question_data.get('option_c', '')}
Option D: {question_data.get('option_d', '')}
Correct Answer: {question_data.get('correct_answer', '')}

Return ONLY a valid JSON object with these exact keys:
{{
  "question_text": "cleaned question text",
  "option_a": "cleaned option A",
  "option_b": "cleaned option B",
  "option_c": "cleaned option C",
  "option_d": "cleaned option D",
  "correct_answer": "A/B/C/D",
  "notes": "brief notes on what was changed"
}}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2, "maxOutputTokens": 1024}
    }
    try:
        resp = requests.post(url, json=payload, timeout=30)
        resp.raise_for_status()
        text_out = resp.json()['candidates'][0]['content']['parts'][0]['text']
        json_match = re.search(r'\{.*\}', text_out, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {'error': 'Could not parse AI response', 'raw': text_out}
    except Exception as e:
        print('Gemini AI edit error:', e)
        return {'error': str(e)}


def bulk_ai_edit_questions(questions: list, delay_seconds: float = 1.0) -> list:
    """
    Edit multiple questions via Gemini with rate limiting.
    questions: list of question_data dicts (same format as ai_edit_question)
    Returns: list of {id, result} dicts
    """
    results = []
    for q in questions:
        qid = q.get('id')
        try:
            result = ai_edit_question(q)
            results.append({'id': qid, 'success': True, 'data': result})
        except Exception as e:
            results.append({'id': qid, 'success': False, 'error': str(e)})
        time.sleep(delay_seconds)  # Rate limiting
    return results