import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Always use an absolute path for the DB file so it works from any CWD
_db_dir = os.path.dirname(os.path.abspath(__file__))
_db_path = os.path.join(_db_dir, "sql_app.db")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{_db_path}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
