from flask import Blueprint, request, jsonify
from db.models import db, MasterQuestion, Exam, AISolution, ExamPurchase, UserPoints, PointsTransaction
from routes.auth import get_current_user
from sqlalchemy import func, desc
import traceback

marketplace_bp = Blueprint('marketplace', __name__, url_prefix='/api/marketplace')

SOLUTION_COST = 10  # points per question solution


# ── List all Exams in Marketplace ─────────────────────────────────────────────

@marketplace_bp.route('/exams', methods=['GET'])
def list_marketplace_exams():
    try:
        exams = Exam.query.order_by(desc(Exam.date)).all()
        current_user = get_current_user()

        result = []
        for exam in exams:
            # Count unique master questions in this exam (via shifts JSON)
            total_questions = MasterQuestion.query.filter(
                MasterQuestion.shifts.contains([{'exam_id': exam.id}])
            ).count()

            # Get all unique subjects and dates from this exam's questions
            mqs = MasterQuestion.query.filter(
                MasterQuestion.shifts != None
            ).all()
            subjects = set()
            dates = set()
            for mq in mqs:
                for s in (mq.shifts or []):
                    if s.get('exam_id') == exam.id:
                        if s.get('subject'): subjects.add(s['subject'])
                        if s.get('test_date'): dates.add(s['test_date'])

            # Check if current user has purchased
            purchased = False
            if current_user:
                purchased = ExamPurchase.query.filter_by(
                    user_id=current_user.id, exam_id=exam.id
                ).first() is not None

            result.append({
                'id': exam.id,
                'name': exam.name,
                'date': str(exam.date) if exam.date else None,
                'total_questions': total_questions,
                'price': exam.price or 0,
                'shifts': len(dates),
                'subjects': list(subjects),
                'purchased': purchased,
            })

        return jsonify({'exams': result})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ── Questions for an Exam (with blur if not purchased) ────────────────────────

@marketplace_bp.route('/exams/<int:exam_id>/questions', methods=['GET'])
def exam_questions(exam_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        subject = request.args.get('subject', '').strip()
        search = request.args.get('search', '').strip()

        current_user = get_current_user()
        is_purchased = False
        if current_user:
            is_purchased = ExamPurchase.query.filter_by(
                user_id=current_user.id, exam_id=exam_id
            ).first() is not None

        exam = Exam.query.get_or_404(exam_id)

        # Get master questions linked to this exam via shifts
        all_mqs = MasterQuestion.query
        if search:
            all_mqs = all_mqs.filter(MasterQuestion.question_text.ilike(f'%{search}%'))
        all_mqs = all_mqs.all()

        # Filter by exam_id in shifts
        filtered = []
        for mq in all_mqs:
            for s in (mq.shifts or []):
                if s.get('exam_id') == exam_id:
                    if not subject or s.get('subject') == subject:
                        filtered.append(mq)
                        break

        total = len(filtered)
        start = (page - 1) * per_page
        page_items = filtered[start: start + per_page]

        questions = []
        for mq in page_items:
            has_sol = AISolution.query.filter_by(master_question_id=mq.id).first() is not None
            q_data = {
                'id': mq.id,
                'question_text': mq.question_text,
                'correct_answer': mq.correct_answer if is_purchased else None,
                'correct_option_text': mq.correct_option_text if is_purchased else None,
                'option_a_text': mq.option_a_text if is_purchased else '••••',
                'option_b_text': mq.option_b_text if is_purchased else '••••',
                'option_c_text': mq.option_c_text if is_purchased else '••••',
                'option_d_text': mq.option_d_text if is_purchased else '••••',
                'reference_count': mq.reference_count,
                'shift_count': mq.shift_count,
                'shifts': mq.shifts or [],
                'has_solution': has_sol,
                'is_locked': not is_purchased,
            }
            questions.append(q_data)

        return jsonify({
            'exam': {'id': exam.id, 'name': exam.name, 'price': exam.price or 0},
            'questions': questions,
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page,
            'is_purchased': is_purchased,
        })
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ── Purchase Exam Access ──────────────────────────────────────────────────────

@marketplace_bp.route('/purchase', methods=['POST'])
def purchase_exam():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Login करें पहले'}), 401

        data = request.get_json() or {}
        exam_id = data.get('exam_id')
        if not exam_id:
            return jsonify({'error': 'exam_id required'}), 400

        exam = Exam.query.get_or_404(exam_id)
        price = exam.price or 0

        # Check if already purchased
        existing = ExamPurchase.query.filter_by(
            user_id=current_user.id, exam_id=exam_id
        ).first()
        if existing:
            return jsonify({'error': 'यह exam पहले से खरीदी जा चुकी है'}), 400

        # Check wallet balance
        wallet = UserPoints.query.filter_by(user_id=current_user.id).first()
        if not wallet or wallet.balance < price:
            return jsonify({
                'error': f'Insufficient points. आपके पास {wallet.balance if wallet else 0} points हैं, ज़रूरत है {price}',
                'balance': wallet.balance if wallet else 0,
                'required': price
            }), 402

        # Deduct points
        wallet.balance -= price
        wallet.total_spent += price

        # Record transaction
        txn = PointsTransaction(
            user_id=current_user.id,
            type='spend',
            amount=price,
            description=f'Purchased: {exam.name} Question Bank',
            reference_id=exam_id
        )
        db.session.add(txn)

        # Create purchase record
        purchase = ExamPurchase(user_id=current_user.id, exam_id=exam_id)
        db.session.add(purchase)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': f'✅ {exam.name} का Question Bank unlock हो गया!',
            'new_balance': wallet.balance
        })
    except Exception as e:
        db.session.rollback()
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


# ── My Purchases ──────────────────────────────────────────────────────────────

@marketplace_bp.route('/my-purchases', methods=['GET'])
def my_purchases():
    try:
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'Login करें'}), 401

        purchases = ExamPurchase.query.filter_by(user_id=current_user.id).all()
        result = []
        for p in purchases:
            exam = Exam.query.get(p.exam_id)
            if exam:
                result.append({
                    'exam_id': exam.id,
                    'exam_name': exam.name,
                    'purchased_at': p.purchased_at.isoformat() if p.purchased_at else None,
                })
        return jsonify({'purchases': result})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500
