import requests

def get_weather():
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": 15.0,
        "longitude": 100.0,
        "daily": "temperature_2m_max,precipitation_sum",
        "timezone": "Asia/Bangkok"
    }

    res = requests.get(url, params=params, timeout=10)
    data = res.json()

    return data["daily"]