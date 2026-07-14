from flask import Blueprint, request, jsonify
from db.models import db, QuestionResponse, AISolution
from services.ai_service import generate_solution
from services.points_service import get_balance, deduct_points
import traceback

questions_bp = Blueprint('questions', __name__, url_prefix='/api/questions')

@questions_bp.route('/<result_id>/questions/<q_id>/unlock', methods=['POST'])
def unlock_question(result_id, q_id):
    data = request.get_json()
    user_id = data.get('user_id')  # TODO: from JWT
    if not user_id:
        return jsonify({'error': 'User not authenticated'}), 401

    try:
        # 1. Get question data (to generate solution)
        q = QuestionResponse.query.get(q_id)
        if not q:
            return jsonify({'error': 'Question not found'}), 404

        # 2. Check if solution already exists in cache by master_question_id
        sol = AISolution.query.filter_by(master_question_id=q.master_question_id).first()
        if sol:
            # Return cached solution along with current balance
            balance = get_balance(user_id)
            return jsonify({
                'solution': sol.to_dict(),
                'fromCache': True,
                'newBalance': balance
            })

        # 3. Check balance
        balance = get_balance(user_id)
        if balance < 5:
            return jsonify({'error': 'Insufficient points. Please recharge.'}), 402

        # 4. Deduct 5 points
        deduct_points(user_id, 5, f'Unlocked solution for question {q_id}')

        # 5. Generate AI solution
        sol_data = generate_solution(q.question_no, q.correct_answer, q.student_answer)

        # 6. Save to DB
        new_sol = AISolution(
            master_question_id=q.master_question_id,
            explanation=sol_data['explanation'],
            why_wrong=sol_data.get('why_wrong'),
            key_takeaways=sol_data.get('key_takeaways'),
            similar_questions_url=sol_data.get('similar_questions_url')
        )
        db.session.add(new_sol)
        db.session.commit()

        # 7. Get updated balance
        new_balance = get_balance(user_id)

        # 8. Return solution + new balance
        return jsonify({
            'solution': new_sol.to_dict(),
            'fromCache': False,
            'newBalance': new_balance
        })

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        print(traceback.format_exc())
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500