import requests
from bs4 import BeautifulSoup
import re
import json
from datetime import datetime, timezone

def fetch_html(url, use_curl=True):
    """
    Fetch HTML from URL. Uses curl_cffi by default for bot-detection bypass.
    Falls back to requests if curl_cffi not available.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
    }
    try:
        if use_curl:
            from curl_cffi import requests as curl_requests
            resp = curl_requests.get(url, headers=headers, impersonate="chrome120", timeout=30)
        else:
            resp = requests.get(url, headers=headers, timeout=30)

        if resp.status_code == 200:
            return resp.text
        else:
            print(f"[Scraper] Status code: {resp.status_code}")
    except ImportError:
        print("[Scraper] curl_cffi not installed, falling back to requests")
        try:
            resp = requests.get(url, headers=headers, timeout=30)
            if resp.status_code == 200:
                return resp.text
        except Exception as e:
            print(f"[Scraper] requests fallback error: {e}")
    except Exception as e:
        print(f"[Scraper] Fetch error: {e}")
    return None


def _collect_generic_html_fields(element):
    if not element:
        return {}

    fields = {}
    for attr_name in sorted(element.attrs.keys()):
        if attr_name in {'class', 'style'}:
            fields[attr_name] = element.get(attr_name)
        else:
            fields[attr_name] = element.get(attr_name)

    for hidden in element.find_all('input', type='hidden'):
        if hidden.get('name'):
            fields[hidden.get('name')] = hidden.get('value')

    if element.name in {'img', 'audio', 'video', 'source'}:
        for key in ['src', 'href', 'data-src', 'poster']:
            if element.get(key):
                fields[key] = element.get(key)

    if element.get('id'):
        fields['id'] = element.get('id')
    if element.get('class'):
        fields['class'] = element.get('class')

    return fields


def _normalize_option_value(value):
    if not value:
        return None
    value = str(value).strip()
    if not value or value == '--':
        return None
    # Normalize letter labels A-D to numeric values 1-4 for consistent comparison.
    letter_match = re.search(r'\b([A-D])\b', value, re.I)
    if letter_match:
        return str(ord(letter_match.group(1).upper()) - ord('A') + 1)
    num_match = re.search(r'([1-4])', value)
    if num_match:
        return num_match.group(1)
    return value.strip().upper()


def _coerce_int(value):
    if value is None:
        return None
    try:
        normalized = re.sub(r'[^-\d]', '', str(value))
        return int(normalized) if normalized else None
    except Exception:
        return None


def _coerce_float(value):
    if value is None:
        return None
    try:
        text = str(value).strip().replace(',', '').replace('%', '')
        text = re.sub(r'[^0-9\.-]', '', text)
        return float(text) if text else None
    except Exception:
        return None


def parse_result_html(html):
    """
    Parse RRB/digialm exam result HTML.

    The parser captures both existing fields and a generic HTML field map so that
    any HTML attributes, hidden inputs, data-* attributes, ids, classes, values,
    onclick parameters, media URLs, and question-related identifiers are preserved.
    """
    soup = BeautifulSoup(html, 'html.parser')

    from typing import Any
    result: dict[str, Any] = {
        'candidate_name': None,
        'registration_number': None,
        'roll_number': None,
        'community': None,
        'test_centre_name': None,
        'test_date': None,
        'test_time': None,
        'subject': None,
        'photo_url': None,
        'application_photograph': None,
        'candidate_payload': {},
        'source_html': html,
        'parser_version': 'rankveda-parser-v1.0',
        'parsed_at': datetime.now(timezone.utc).isoformat(),
        'score': 0.0,
        'total_correct': 0,
        'total_wrong': 0,
        'total_unattempted': 0,
        'questions': [],
        'rank': 0,
        'percentile': 0.0,
        'category_rank': 0,
        'category': 'UR',
        'section_wise': {}
    }

    # Extract participant details
    details_table = soup.find('table', class_='main-info-tbl')
    if details_table:
        for tr in details_table.find_all('tr'):
            tds = tr.find_all('td')
            if len(tds) >= 2:
                raw_key = tds[0].get_text(strip=True)
                key = raw_key.replace(' ', '').replace('_', '').replace('-', '').lower()
                val = tds[1].get_text(strip=True)

                if 'registrationno' in key: result['registration_number'] = val
                elif 'rollno' in key or 'rollnumber' in key: result['roll_number'] = val
                elif 'candidatename' in key: result['candidate_name'] = val
                elif 'community' in key: result['community'] = val
                elif 'testcentername' in key or 'testcentrename' in key: result['test_centre_name'] = val
                elif 'testdate' in key: result['test_date'] = val
                elif 'testtime' in key: result['test_time'] = val
                elif 'subject' in key: result['subject'] = val
                elif 'rank' in key and 'category' not in key and 'percentile' not in key:
                    rank_value = _coerce_int(val)
                    if rank_value is not None:
                        result['rank'] = rank_value
                elif 'percentile' in key:
                    percentile_value = _coerce_float(val)
                    if percentile_value is not None:
                        result['percentile'] = round(percentile_value, 2)
                elif 'categoryrank' in key or 'categoryrank' in raw_key.replace(' ', '').lower():
                    category_rank_value = _coerce_int(val)
                    if category_rank_value is not None:
                        result['category_rank'] = category_rank_value
                elif 'score' in key or 'marksobtained' in key or 'totalmarks' in key:
                    score_value = _coerce_float(val)
                    if score_value is not None:
                        result['score'] = round(score_value, 2)
                elif 'category' == key:
                    result['category'] = val or result['category']

    img_tag = soup.find('img')
    if img_tag and img_tag.has_attr('src'):
        src = str(img_tag['src'])
        if not src.startswith('http'):
            result['photo_url'] = 'https://rrb.digialm.com' + src
        else:
            result['photo_url'] = src
    result['application_photograph'] = result['photo_url']

    candidate_fields = _collect_generic_html_fields(soup.find('table', class_='main-info-tbl') or soup)
    if candidate_fields:
        result['candidate_payload'] = candidate_fields

    # --- Questions ---
    correct_count = 0
    wrong_count = 0
    unattempted_count = 0
    total_marks = 0.0

    question_panels = soup.find_all('div', class_='question-pnl')
    for panel in question_panels:
        q_div = panel
        
        qno_match = re.search(r'Question ID :.*?(\d+)', q_div.get_text())
        qno = qno_match.group(1) if qno_match else "0"

        # Try to find the question number from the header if the ID match fails to get sequential number
        header_num = q_div.find('td', class_='bold', string=re.compile(r'Q\.\d+'))
        if header_num:
            m = re.search(r'Q\.(\d+)', header_num.get_text())
            if m:
                qno = m.group(1)

        def _parse_option_label(text):
            if not text:
                return None, None
            text = re.sub(r'\s+', ' ', text).strip()
            m = re.match(r'^([A-D])\s*[\.)]\s*(.+)$', text, re.I)
            if m:
                return m.group(1).upper(), m.group(2).strip()
            m = re.match(r'^(\d+)\s*[\.)]\s*(.+)$', text)
            if m:
                return m.group(1), m.group(2).strip()
            return None, text

        # Question text
        question_text = None
        question_row_tbl = q_div.find('table', class_='questionRowTbl')
        if question_row_tbl:
            for td in question_row_tbl.find_all('td', class_='bold'):
                text = td.get_text(separator=' ', strip=True)
                if not text:
                    continue
                if re.match(r'^(Q\.\d+|Ans|Question Type|Question ID|Option \d+ ID|Status|Chosen Option)$', text, re.I):
                    continue
                question_text = text
                break

        if not question_text:
            bold_tds = q_div.find_all('td', class_='bold')
            if bold_tds:
                candidate_texts = []
                for td in bold_tds:
                    text = td.get_text(separator=' ', strip=True)
                    if text and re.match(r'^(Q\.|Q\.\d+|Question ID|\d+\.|\d+|Ans)$', text, re.I) is None:
                        text = re.sub(r'^\d+\.\s*', '', text)
                        candidate_texts.append(text)
                if candidate_texts:
                    question_text = candidate_texts[0]
        if not question_text:
            body_text = q_div.get_text(separator=' ', strip=True)
            if body_text:
                cleaned = re.sub(r'Question ID\s*\d+', '', body_text)
                cleaned = re.sub(r'\b(?:[A-D]|1|2|3|4)\s*[\.)]\s*', '', cleaned)
                cleaned = re.sub(r'\s+', ' ', cleaned).strip()
                question_text = cleaned or body_text

        # Question HTML ID from the div itself
        question_id_html = q_div.get('id') or None
        if not question_id_html:
            question_id_html = q_div.get('data-question-id') or None

        # Option IDs & text - collect all option rows
        wrong_tds = q_div.find_all('td', class_='wrngAns')
        right_td = q_div.find('td', class_='rightAns')
        
        all_option_tds = wrong_tds + ([right_td] if right_td else [])
        
        correct_option = None
        correct_option_text = None
        student_option = None
        student_option_text_raw = None
        option_a_id = None
        option_b_id = None
        option_c_id = None
        option_d_id = None
        
        option_a_text = None
        option_b_text = None
        option_c_text = None
        option_d_text = None

        menu_tbl = q_div.find('table', class_='menu-tbl')
        if menu_tbl:
            for row in menu_tbl.find_all('tr'):
                cells = row.find_all('td')
                if len(cells) < 2:
                    continue

                label = cells[0].get_text(strip=True)
                value = cells[1].get_text(strip=True)
                label_key = label.lower()

                if 'question id' in label_key:
                    question_id_html = value or question_id_html
                elif 'option 1 id' in label_key:
                    option_a_id = value or option_a_id
                elif 'option 2 id' in label_key:
                    option_b_id = value or option_b_id
                elif 'option 3 id' in label_key:
                    option_c_id = value or option_c_id
                elif 'option 4 id' in label_key:
                    option_d_id = value or option_d_id
                elif 'chosen option' in label_key or 'chosen' in label_key:
                    student_option = _normalize_option_value(value)

        if right_td:
            text = right_td.get_text(separator=' ', strip=True)
            opt_num, opt_text = _parse_option_label(text)
            normalized = _normalize_option_value(opt_num or text)
            if normalized:
                correct_option = normalized
                correct_option_text = opt_text or text.strip()
            else:
                correct_option = text.strip()
                correct_option_text = text.strip()

        for td in all_option_tds:
            text = td.get_text(separator=' ', strip=True)
            opt_num, opt_text = _parse_option_label(text)
            normalized = _normalize_option_value(opt_num or text)
            if normalized == '1':
                option_a_text = opt_text
            elif normalized == '2':
                option_b_text = opt_text
            elif normalized == '3':
                option_c_text = opt_text
            elif normalized == '4':
                option_d_text = opt_text

        if student_option == '1':
            student_option_text_raw = option_a_text
        elif student_option == '2':
            student_option_text_raw = option_b_text
        elif student_option == '3':
            student_option_text_raw = option_c_text
        elif student_option == '4':
            student_option_text_raw = option_d_text

        # Marks calculation
        marks = 0.0
        status = 'unattempted'
        if student_option and correct_option:
            if student_option == correct_option:
                marks = 1.0
                correct_count += 1
                status = 'correct'
            elif student_option_text_raw and correct_option_text and student_option_text_raw.strip().lower() == correct_option_text.strip().lower():
                marks = 1.0
                correct_count += 1
                status = 'correct'
            else:
                marks = -1/3
                wrong_count += 1
                status = 'wrong'
        else:
            unattempted_count += 1

        total_marks += marks

        generic_question_fields = _collect_generic_html_fields(q_div)
        question_data = {
            'qno': qno,
            'question_text': question_text,
            'question_id_html': question_id_html,
            'html_fields': generic_question_fields,
            'raw_question_html': str(q_div),
            'raw_option_html': str(q_div.find('table', class_='menu-tbl') or ''),
            'raw_answer_html': str(q_div.find('td', class_='rightAns') or ''),
            'image_url': None,
            'audio_url': None,
            'video_url': None,
            'question_type': 'unknown',
            'question_status': 'parsed',
            'section_name': None,
            'section_id': None,
            'question_group': None,
            'question_language': None,
            'passage_id': None,
            'parent_question_id': None,
            'source_html': html,
            'parser_version': 'rankveda-parser-v1.0',
            'parsed_at': datetime.now(timezone.utc).isoformat(),
            'option_a_id': option_a_id,
            'option_b_id': option_b_id,
            'option_c_id': option_c_id,
            'option_d_id': option_d_id,
            'option_a_text': option_a_text,
            'option_b_text': option_b_text,
            'option_c_text': option_c_text,
            'option_d_text': option_d_text,
            'student_answer': student_option,
            'correct_answer': correct_option,
            'student_option_text': student_option_text_raw or None,
            'correct_option_text': correct_option_text,
            'marks': round(marks, 2),
            'status': status
        }
        result['questions'].append(question_data)

    # Calculate final stats
    result['score'] = round(total_marks, 2)
    result['total_correct'] = correct_count
    result['total_wrong'] = wrong_count
    result['total_unattempted'] = unattempted_count
    
    print(f"[Scraper] Correct={correct_count}, Wrong={wrong_count}, Unattempted={unattempted_count}, Score={result['score']}")
    print(f"[Scraper] Candidate: {result['candidate_name']}, Roll: {result['roll_number']}")

    return result