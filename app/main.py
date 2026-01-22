# app/main.py
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil
import os

from pydantic import BaseModel

from app import models, schemas, crud
from app.database import engine, SessionLocal

# Admin imports
from starlette_admin.contrib.sqla import Admin, ModelView


# Create tables (users + resumes)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Resume API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserDelete(BaseModel):
    id: int

# ---------------- CREATE USER ----------------
@app.post("/users")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    if db.query(models.User).filter(models.User.mobile == user.mobile).first():
        raise HTTPException(status_code=400, detail="Mobile already exists")

    new_user = models.User(
        name=user.name,
        email=user.email,
        mobile=user.mobile,
        current_location=user.current_location,
        preferred_job_location=user.preferred_job_location,
        highest_qualification=user.highest_qualification,
        job_role=user.job_role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ---------------- GET USERS (ADMIN) ----------------
@app.get("/admin/users")
def get_users(db: Session = Depends(get_db)):
    return crud.get_all_users(db)

# ---------------- DELETE USER (ADMIN) ----------------
@app.delete("/admin/users")
def admin_delete_user(payload: UserDelete, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_id(db, payload.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted successfully"}

# ---------------- UPDATE USER (ADMIN) ----------------
@app.put("/admin/users/{user_id}")
def admin_update_user(
    user_id: int,
    user: schemas.UserUpdate,
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.name is not None:
        db_user.name = user.name
    if user.email is not None:
        if db.query(models.User).filter(
            models.User.email == user.email,
            models.User.id != user_id,
        ).first():
            raise HTTPException(status_code=400, detail="Email already exists")
        db_user.email = user.email
    if user.mobile is not None:
        if db.query(models.User).filter(
            models.User.mobile == user.mobile,
            models.User.id != user_id,
        ).first():
            raise HTTPException(status_code=400, detail="Mobile already exists")
        db_user.mobile = user.mobile
    if user.current_location is not None:
        db_user.current_location = user.current_location
    if user.preferred_job_location is not None:
        db_user.preferred_job_location = user.preferred_job_location
    if user.highest_qualification is not None:
        db_user.highest_qualification = user.highest_qualification
    if user.job_role is not None:
        db_user.job_role = user.job_role

    db.commit()
    db.refresh(db_user)
    return db_user

# ---------------- UPLOAD / UPDATE RESUME ----------------
@app.post("/users/{user_id}/upload-resume")
def upload_resume(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    os.makedirs("resumes", exist_ok=True)

    ext = os.path.splitext(file.filename)[1]
    file_path = f"resumes/user_{user_id}_resume{ext}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # One-to-one: either update existing or create new
    resume = db.query(models.Resume).filter(
        models.Resume.user_id == user_id
    ).first()

    if resume:
        resume.resume_path = file_path
    else:
        resume = models.Resume(
            user_id=user_id,
            resume_path=file_path,
        )
        db.add(resume)

    db.commit()

    return {
        "message": "Resume uploaded successfully",
        "resume_path": file_path,
    }

# ---------------- ADMIN DASHBOARD ----------------
admin = Admin(
    engine,
    title="Admin Dashboard",
)

admin.add_view(ModelView(models.User))
admin.add_view(ModelView(models.Resume))

admin.mount_to(app)
