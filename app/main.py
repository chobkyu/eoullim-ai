from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.controllers.evaluate_controller import router as eval_router

# source venv/bin/activate
# uvicorn app.main:app --reload
app = FastAPI()
app.include_router(eval_router, prefix="/api")

# 정적 파일 서비스
app.mount("/", StaticFiles(directory="static", html=True), name="static")
