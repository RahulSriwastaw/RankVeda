from db.models import Exam, ExamPurchase, QuestionPack, UserPoints, PointsTransaction


def sync_individual_exam_pack(db_session, exam):
    """
    Ensure an individual QuestionPack exists for this exam, creating or updating it as needed.
    """
    if not exam or not exam.id:
        return None

    # Search for an existing QuestionPack that has exactly [exam.id] in exam_ids
    all_packs = db_session.query(QuestionPack).all()
    target_pack = None
    for p in all_packs:
        raw_ids = p.exam_ids or []
        clean_ids = []
        for item in raw_ids:
            if isinstance(item, dict):
                clean_ids.append(int(item.get('exam_id')))
            elif item is not None:
                clean_ids.append(int(item))
        if clean_ids == [exam.id]:
            target_pack = p
            break

    pack_name = f"{exam.name} Question Bank Pack"
    pack_desc = exam.description or f"Complete Question Bank Pack for {exam.name}. Access all shift questions, solutions, and analytics."
    pack_price = int(exam.price or 0)
    is_active = (exam.status == 'active')

    if target_pack:
        target_pack.name = pack_name
        target_pack.description = pack_desc
        target_pack.price = pack_price
        target_pack.is_active = is_active
        target_pack.exam_ids = [exam.id]
    else:
        target_pack = QuestionPack(
            name=pack_name,
            description=pack_desc,
            price=pack_price,
            exam_ids=[exam.id],
            is_active=is_active
        )
        db_session.add(target_pack)

    db_session.flush()
    db_session.commit()
    return target_pack


def create_question_pack(db_session, name, description, price, exam_ids):
    pack = QuestionPack(name=name, description=description, price=price, exam_ids=list(exam_ids or []))
    db_session.add(pack)
    db_session.flush()
    db_session.commit()
    return pack


def purchase_question_pack(db_session, user_id, pack):
    if not pack:
        return []

    wallet = db_session.query(UserPoints).filter_by(user_id=user_id).first()
    if not wallet or wallet.balance < pack.price:
        raise ValueError('Insufficient points')

    purchased_ids = []
    for exam_id in (pack.exam_ids or []):
        existing = db_session.query(ExamPurchase).filter_by(user_id=user_id, exam_id=exam_id).first()
        if existing:
            continue
        db_session.add(ExamPurchase(user_id=user_id, exam_id=exam_id))
        purchased_ids.append(exam_id)

    wallet.balance -= pack.price
    wallet.total_spent += pack.price
    db_session.add(PointsTransaction(
        user_id=user_id,
        type='spend',
        amount=pack.price,
        description=f'Purchased Question Pack: {pack.name}',
        reference_id=pack.id
    ))
    db_session.commit()
    return purchased_ids
