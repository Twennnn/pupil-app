from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import shutil
import os

app = FastAPI()

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# 🔥 Убираем mount и используем ручной маршрут для видео
# app.mount("/videos", StaticFiles(directory=UPLOAD_FOLDER), name="videos")

# 🔥 Ручная отдача видео с правильными заголовками
@app.get("/videos/{filename}")
async def serve_video(filename: str):
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        # Определяем MIME-тип по расширению
        if filename.endswith(".avi"):
            media_type = "video/x-msvideo"
        elif filename.endswith(".webm"):
            media_type = "video/webm"
        else:
            media_type = "video/mp4"

        return FileResponse(
            file_path,
            media_type=media_type,
            headers={
                "Accept-Ranges": "bytes",
                "Cache-Control": "no-cache"
            }
        )
    return {"error": "Video not found"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "API работает"}


@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...), method: str = Form("classic")):
    print(f"🔥 Получен файл: {file.filename}, метод: {method}")

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    from backend.processing import process_video

    result = process_video(file_path, UPLOAD_FOLDER, method=method, flash_frame=50)

    if "error" in result:
        print(f"❌ Ошибка: {result['error']}")
        print(f"🔍 Debug: {result.get('debug', [])}")
        return result

    video_name = os.path.basename(result["video_path"])
    video_url = f"http://127.0.0.1:8000/videos/{video_name}"

    print(f"✅ Видео создано: {video_url}")
    print(f"📊 Статистика: {result['stats']}")

    return {
        "mean_pupil": result["mean_pupil"],
        "baseline_diameter": result["baseline_diameter"],
        "constriction_amplitude": result["constriction_amplitude"],
        "constriction_latency_ms": result["constriction_latency_ms"],
        "recovery_time_ms": result["recovery_time_ms"],
        "recovery_velocity": result["recovery_velocity"],
        "variability": result["variability"],
        "blink_rate": result["blink_rate"],
        "state": result["state"],
        "method": result["method"],
        "video_url": video_url,
        "pupil_sizes": result["pupil_sizes"],
        "debug": result["debug"],
        "stats": result["stats"]
    }