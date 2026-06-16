from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import os

from services.weather import get_weather
from services.news import get_news
from services.risk import generate_risk


app = FastAPI(title="Agri AI System")

# 👑 กัน Render path พัง (สำคัญมาก)
BASE_DIR = os.path.dirname(os.path.abspath(_file_))

templates = Jinja2Templates(
    directory=os.path.join(BASE_DIR, "templates")
)

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(BASE_DIR, "static")),
    name="static"
)


# 🌐 Dashboard
@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )


# 🤖 API วิเคราะห์ข้อมูล
@app.post("/analyze")
def analyze():

    weather = get_weather() or {}
    news = get_news() or []

    rain = (weather.get("precipitation_sum") or [0])[0]
    temp = (weather.get("temperature_2m_max") or [0])[0]

    risk = generate_risk(
        {
            "precipitation_sum": [rain],
            "temperature_2m_max": [temp]
        },
        news
    )

    return {
        "weather": {
            "rain": rain,
            "temp": temp
        },
        "news": news,
        "risk": risk
    }