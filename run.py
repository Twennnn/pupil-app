import subprocess
import sys
import time
import webbrowser

print("🚀 Запуск проекта...")

# Backend
backend = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload"],
    cwd="."
)

time.sleep(2)

# Frontend
frontend = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd="frontend",
    shell=True
)

time.sleep(3)
webbrowser.open("http://localhost:5173")

print("✅ Всё запущено!")

backend.wait()
frontend.wait()