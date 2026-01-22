# app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(postgresql://fastapi_db_eq51_user:ExMoSDWULrWbThJ03g9uE1agtIKsq31S@dpg-d5p2kutactks7395fm90-a/fastapi_db_eq51)


engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()
