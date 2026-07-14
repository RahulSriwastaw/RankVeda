import os
from app import create_app
from db.pool import db
from db.models import MasterQuestion, QuestionResponse, ExamResult

def clear_test_data():
    app = create_app()
    with app.app_context():
        try:
            print("Clearing test data...")
            db.session.query(QuestionResponse).delete()
            db.session.query(ExamResult).delete()
            db.session.query(MasterQuestion).delete()
            db.session.commit()
            print("Successfully cleared test data!")
        except Exception as e:
            db.session.rollback()
            print(f"Error clearing data: {e}")

if __name__ == '__main__':
    clear_test_data()
