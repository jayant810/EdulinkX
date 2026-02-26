from datetime import datetime

from sqlalchemy import Column, DateTime, Integer

from app.db.session import Base


class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class ExampleModel(TimestampMixin, Base):
    __tablename__ = "example"

    id = Column(Integer, primary_key=True, index=True)
