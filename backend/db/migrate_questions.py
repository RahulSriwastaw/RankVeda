import sys
import os
from datetime import datetime, timezone
from sqlalchemy import inspect, text, Table, Column, Integer, String, Text, ForeignKey, Numeric, DateTime, JSON

# Add the backend directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from db.models import db, MasterQuestion, ExamResult

app = create_app()

def migrate_database():
    with app.app_context():
        inspector = inspect(db.engine)
        
        # 1. Create master_questions table if it doesn't exist
        if 'master_questions' not in inspector.get_table_names():
            print("Creating master_questions table...")
            db.metadata.tables['master_questions'].create(db.engine)
        
        # 2. Check if we need to migrate question_responses
        qr_columns = [col['name'] for col in inspector.get_columns('question_responses')]
        
        if 'question_text' in qr_columns:
            print("Legacy schema detected. Initiating data migration...")
            
            # Fetch all results to map shift info
            results = {r.id: r for r in ExamResult.query.all()}
            
            # Fetch all old question responses
            # We use raw sql because the SQLAlchemy model class has already been updated
            # and no longer maps the old columns to attribute fields directly.
            connection = db.engine.connect()
            transaction = connection.begin()
            
            try:
                old_qrs = connection.execute(text("SELECT * FROM question_responses")).fetchall()
                old_sols = connection.execute(text("SELECT * FROM ai_solutions")).fetchall()
                
                print(f"Loaded {len(old_qrs)} legacy question responses and {len(old_sols)} AI solutions.")
                
                # To track inserted MasterQuestions
                # Key: question_id_html or question_hash -> MasterQuestion.id
                mq_mapping = {}
                
                # We'll save master questions first
                for row in old_qrs:
                    # Note: row keys are accessible by index or attribute name (depending on SQLAlchemy version)
                    # To be safe, we'll map by column index or dict
                    row_dict = dict(row._mapping)
                    
                    q_text = row_dict.get('question_text') or ''
                    q_hash = MasterQuestion.generate_hash(q_text)
                    q_id_html = row_dict.get('question_id_html')
                    correct_answer = row_dict.get('correct_answer')
                    correct_option_text = row_dict.get('correct_option_text')
                    result_id = row_dict.get('result_id')
                    
                    # Determine shift info
                    shift = None
                    res = results.get(result_id)
                    if res:
                        shift = {
                            'exam_id': res.exam_id,
                            'test_date': res.test_date,
                            'test_time': res.test_time,
                            'subject': res.subject
                        }
                    
                    # Find if master question already mapped
                    mq_key = q_id_html if q_id_html else q_hash
                    if mq_key in mq_mapping:
                        mq_id = mq_mapping[mq_key]
                        # Increment count and add shift if new
                        mq = MasterQuestion.query.get(mq_id)
                        mq.reference_count += 1
                        if shift:
                            shifts_list = mq.shifts or []
                            is_new_shift = True
                            for s in shifts_list:
                                if (s.get('exam_id') == shift['exam_id'] and 
                                    s.get('test_date') == shift['test_date'] and 
                                    s.get('test_time') == shift['test_time'] and 
                                    s.get('subject') == shift['subject']):
                                    is_new_shift = False
                                    break
                            if is_new_shift:
                                shifts_list.append(shift)
                                mq.shifts = shifts_list
                                mq.shift_count = len(shifts_list)
                        db.session.commit()
                    else:
                        # Insert new MasterQuestion
                        mq = MasterQuestion(
                            question_id_html=q_id_html,
                            question_hash=q_hash,
                            question_text=q_text,
                            correct_answer=correct_answer or '1',
                            correct_option_text=correct_option_text,
                            reference_count=1,
                            shifts=[shift] if shift else [],
                            shift_count=1 if shift else 0
                        )
                        db.session.add(mq)
                        db.session.commit()
                        mq_mapping[mq_key] = mq.id
                
                print(f"Created {len(mq_mapping)} unique master questions.")
                
                def parse_datetime(val):
                    if not val:
                        return datetime.now(timezone.utc).replace(tzinfo=None)
                    if isinstance(val, datetime):
                        return val
                    if isinstance(val, str):
                        try:
                            return datetime.fromisoformat(val)
                        except ValueError:
                            pass
                        try:
                            return datetime.strptime(val.split(".")[0], "%Y-%m-%d %H:%M:%S")
                        except ValueError:
                            pass
                    return datetime.now(timezone.utc).replace(tzinfo=None)

                # Reconstruct question_responses list with master_question_id
                migrated_qrs = []
                for row in old_qrs:
                    row_dict = dict(row._mapping)
                    q_text = row_dict.get('question_text') or ''
                    q_hash = MasterQuestion.generate_hash(q_text)
                    q_id_html = row_dict.get('question_id_html')
                    
                    mq_key = q_id_html if q_id_html else q_hash
                    mq_id = mq_mapping.get(mq_key)
                    
                    migrated_qrs.append({
                        'id': row_dict.get('id'),
                        'result_id': row_dict.get('result_id'),
                        'question_no': row_dict.get('question_no'),
                        'master_question_id': mq_id,
                        'option_id': row_dict.get('option_id'),
                        'student_answer': row_dict.get('student_answer'),
                        'student_option_text': row_dict.get('student_option_text'),
                        'marks_awarded': row_dict.get('marks_awarded'),
                        'difficulty': row_dict.get('difficulty'),
                        'status': row_dict.get('status'),
                        'created_at': parse_datetime(row_dict.get('created_at'))
                    })
                
                # Reconstruct ai_solutions list with master_question_id
                migrated_sols = []
                seen_mqs_for_sol = set()
                
                # Map old question_id to master_question_id
                qr_id_to_mq_id = {}
                for qr in migrated_qrs:
                    qr_id_to_mq_id[qr['id']] = qr['master_question_id']
                
                for row in old_sols:
                    row_dict = dict(row._mapping)
                    old_qr_id = row_dict.get('question_id')
                    mq_id = qr_id_to_mq_id.get(old_qr_id)
                    
                    if mq_id and mq_id not in seen_mqs_for_sol:
                        seen_mqs_for_sol.add(mq_id)
                        migrated_sols.append({
                            'id': row_dict.get('id'),
                            'master_question_id': mq_id,
                            'explanation': row_dict.get('explanation'),
                            'why_wrong': row_dict.get('why_wrong'),
                            'key_takeaways': row_dict.get('key_takeaways'),
                            'similar_questions_url': row_dict.get('similar_questions_url'),
                            'created_at': parse_datetime(row_dict.get('created_at'))
                        })
                
                # Drop old tables
                print("Dropping old table views...")
                connection.execute(text("DROP TABLE ai_solutions"))
                connection.execute(text("DROP TABLE question_responses"))
                transaction.commit()
                
                # Create tables with new schema
                print("Re-creating tables with new schema...")
                db.metadata.tables['question_responses'].create(db.engine)
                db.metadata.tables['ai_solutions'].create(db.engine)
                
                # Reinsert the migrated data
                print(f"Re-inserting {len(migrated_qrs)} migrated question responses...")
                for qr in migrated_qrs:
                    db.session.execute(
                        db.metadata.tables['question_responses'].insert().values(**qr)
                    )
                
                print(f"Re-inserting {len(migrated_sols)} migrated AI solutions...")
                for sol in migrated_sols:
                    db.session.execute(
                        db.metadata.tables['ai_solutions'].insert().values(**sol)
                    )
                
                db.session.commit()
                print("Database migration completed successfully! ✅")
                
            except Exception as e:
                transaction.rollback()
                db.session.rollback()
                print(f"Migration failed: {e}")
                import traceback
                traceback.print_exc()
                raise e
        else:
            print("Database already matches the new schema. No migration needed.")

if __name__ == '__main__':
    migrate_database()
