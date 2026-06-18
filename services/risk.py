def generate_risk(weather, news):

    rain = weather["precipitation_sum"][0]
    temp = weather["temperature_2m_max"][0]

    alerts = []

    if rain > 20:
        alerts.append("ฝนตกหนักต่อเนื่อง เสี่ยงน้ำท่วมพื้นที่เกษตร")

    if temp > 35:
        alerts.append("อุณหภูมิสูง เสี่ยงพืชขาดน้ำ")

    for n in news:
        if "ฝน" in n["title"]:
            alerts.append("ข่าวเตือนฝนกระทบพื้นที่เกษตร")
        if "น้ำท่วม" in n["title"]:
            alerts.append("ข่าวเตือนน้ำท่วม")

    alerts = list(set(alerts))

    risk_score = min(100, len(alerts) * 30)

    return {
        "alerts": alerts,
        "risk_score": risk_score,
        "level": "HIGH" if risk_score > 60 else "NORMAL",
        "advice": "เฝ้าระวังพื้นที่ลุ่ม และเตรียมระบบระบายน้ำ"
    }