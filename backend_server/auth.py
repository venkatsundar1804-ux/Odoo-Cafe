from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db

SECRET_KEY = "super-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

router = APIRouter(prefix="/api/auth", tags=["auth"])
session_router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: Annotated[models.User, Depends(get_current_user)]
):
    if hasattr(current_user, 'is_active') and not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_admin_role(
    current_user: Annotated[models.User, Depends(get_current_active_user)]
):
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user


@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user_in.password)
    new_user = models.User(
        username=user_in.username,
        hashed_password=hashed_password,
        role=getattr(user_in, 'role', 'user')
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/token", response_model=schemas.Token)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

from pydantic import BaseModel

class SessionOpen(BaseModel):
    employee_id: int

class SessionClose(BaseModel):
    closing_amount: float

@session_router.post("/open")
def open_session(
    session_req: SessionOpen, 
    current_user: Annotated[models.User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    db_session = models.POSSession(
        employee_id=session_req.employee_id,
        is_open=True
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@session_router.post("/{session_id}/close")
def close_session(
    session_id: int, 
    session_req: SessionClose, 
    current_user: Annotated[models.User, Depends(get_current_active_user)],
    db: Session = Depends(get_db)
):
    db_session = db.query(models.POSSession).filter(models.POSSession.id == session_id).first()
    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")
    if not db_session.is_open:
        raise HTTPException(status_code=400, detail="Session is already closed")
    
    db_session.is_open = False
    db_session.closed_at = datetime.now(timezone.utc)
    db_session.closing_amount = session_req.closing_amount
    db.commit()
    db.refresh(db_session)
    return db_session
