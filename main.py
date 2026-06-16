from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from services.weather import get_weather
from services.news import get_news
from services.risk import generate_risk

app = FastAPI(title="Agri AI System")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


# 🌐 dashboard
@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


# 🤖 API
@app.post("/analyze")
def analyze():

    weather = get_weather()
    news = get_news()

    risk = generate_risk(weather, news)

    return {
        "weather": {
            "rain": weather["precipitation_sum"][0],
            "temp": weather["temperature_2m_max"][0]
        },
        "news": news,
        "risk": risk
    }