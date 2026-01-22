# app/models.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    mobile = Column(String(15), unique=True, nullable=False)

    current_location = Column(String(100), nullable=False)
    preferred_job_location = Column(String(100), nullable=False)
    highest_qualification = Column(String(100), nullable=False)
    job_role = Column(String(50), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # One-to-one relationship to Resume
    resume = relationship("Resume", back_populates="user", uselist=False)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    resume_path = Column(String(255), nullable=False)

    user = relationship("User", back_populates="resume")
