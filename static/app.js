async function load() {

  const res = await fetch("/analyze", {
    method: "POST"
  });

  const data = await res.json();

  document.getElementById("risk").innerText =
    data.risk.risk_score + " (" + data.risk.level + ")";

  document.getElementById("weather").innerText =
    `Rain: ${data.weather.rain} mm | Temp: ${data.weather.temp}°C`;

  document.getElementById("advice").innerText =
    data.risk.advice;

  const alertBox = document.getElementById("alerts");
  alertBox.innerHTML = "";

  if (data.risk.alerts.length === 0) {
    alertBox.innerHTML = "✅ ไม่มีความเสี่ยงตอนนี้";
  } else {
    data.risk.alerts.forEach(a => {
      const div = document.createElement("div");
      div.className = "alert";
      div.innerText = a;
      alertBox.appendChild(div);
    });
  }
}

load();
setInterval(load, 5000);