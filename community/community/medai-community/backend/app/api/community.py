from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.core.deps import get_current_user, get_db

router = APIRouter()


class QuestionCreate(BaseModel):
    title: str
    body_md: str
    tags: List[str] = []


class AnswerCreate(BaseModel):
    body_md: str


class VotePayload(BaseModel):
    target_type: str
    target_id: int
    value: int


class SettingsPayload(BaseModel):
    editor_mode: Optional[str] = "markdown"
    profile_public: bool = True
    notify_answers: bool = True
    notify_mentions: bool = True
    weekly_digest: bool = False


class ReportPayload(BaseModel):
    target_type: str
    target_id: int
    reason: str


@router.get("/questions")
def list_questions(
    sort: str = Query("recent", pattern="^(recent|trending|unanswered)$"),
    tag: Optional[str] = None,
    q: Optional[str] = None,
    page: int = Query(1, ge=1),
    db=Depends(get_db),
) -> Dict[str, Any]:
    # Placeholder data; wire to database later.
    return {
        "items": [],
        "sort": sort,
        "tag": tag,
        "query": q,
        "page": page,
    }


@router.post("/questions", status_code=status.HTTP_201_CREATED)
def create_question(
    payload: QuestionCreate,
    db=Depends(get_db),
    user=Depends(get_current_user),
) -> Dict[str, Any]:
    return {"message": "question created", "slug": "generated-slug", "payload": payload.model_dump(), "user_id": user["id"]}


@router.get("/questions/{slug}")
def get_question(slug: str, db=Depends(get_db)) -> Dict[str, Any]:
    return {"slug": slug, "title": "Placeholder question", "body_md": "Markdown body", "answers": []}


@router.patch("/questions/{question_id}")
def update_question(question_id: int, payload: QuestionCreate, db=Depends(get_db), user=Depends(get_current_user)) -> Dict[str, Any]:
    return {"message": "question updated", "id": question_id, "payload": payload.model_dump(), "user_id": user["id"]}


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db=Depends(get_db), user=Depends(get_current_user)) -> None:
    return None


@router.post("/questions/{question_id}/answers", status_code=status.HTTP_201_CREATED)
def create_answer(
    question_id: int,
    payload: AnswerCreate,
    db=Depends(get_db),
    user=Depends(get_current_user),
) -> Dict[str, Any]:
    return {"message": "answer created", "question_id": question_id, "payload": payload.model_dump(), "user_id": user["id"]}


@router.patch("/answers/{answer_id}")
def update_answer(answer_id: int, payload: AnswerCreate, db=Depends(get_db), user=Depends(get_current_user)) -> Dict[str, Any]:
    return {"message": "answer updated", "id": answer_id, "payload": payload.model_dump(), "user_id": user["id"]}


@router.post("/answers/{answer_id}/accept")
def accept_answer(answer_id: int, db=Depends(get_db), user=Depends(get_current_user)) -> Dict[str, Any]:
    return {"message": "answer accepted", "id": answer_id, "user_id": user["id"]}


@router.post("/votes")
def vote(payload: VotePayload, db=Depends(get_db), user=Depends(get_current_user)) -> Dict[str, Any]:
    if payload.value not in (-1, 1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid vote value")
    return {"message": "vote recorded", "payload": payload.model_dump(), "user_id": user["id"]}


@router.get("/leaderboard")
def leaderboard(range_: str = Query("weekly", pattern="^(weekly|monthly|alltime)$"), db=Depends(get_db)) -> Dict[str, Any]:
    return {"range": range_, "leaders": []}


@router.get("/settings")
def get_settings(db=Depends(get_db), user=Depends(get_current_user)) -> Dict[str, Any]:
    return {
        "editor_mode": "markdown",
        "profile_public": True,
        "notify_answers": True,
        "notify_mentions": True,
        "weekly_digest": False,
        "user_id": user["id"],
    }


@router.patch("/settings")
def update_settings(payload: SettingsPayload, db=Depends(get_db), user=Depends(get_current_user)) -> Dict[str, Any]:
    return {"message": "settings updated", "payload": payload.model_dump(), "user_id": user["id"]}


@router.post("/reports", status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportPayload, db=Depends(get_db), user=Depends(get_current_user)) -> Dict[str, Any]:
    return {"message": "report received", "payload": payload.model_dump(), "user_id": user["id"]}
