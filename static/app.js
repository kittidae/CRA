let province = "";
let priceChart, weatherChart, waterChart;
let prevPrice = null;
let refreshIntervalId = null;
let countdownIntervalId = null;
let secondsToRefresh = 60 * 60;
 
const REFRESH_MS = 60 * 60 * 1000; // 1 hour
 
/* OPEN / START */
function openModal() {
  document.getElementById("modal").style.display = "flex";
}
 
function start() {
  province = document.getElementById("province").value;
 
  document.getElementById("modal").style.display = "none";
  document.getElementById("dashboard").classList.remove("hidden");
 
  document.getElementById("provName").innerText = province;
  document.getElementById("provName2").innerText = province;
 
  if (!priceChart) {
    initCharts();
  }
 
  loadData();
  startClock();
 
  if (!refreshIntervalId) {
    secondsToRefresh = REFRESH_MS / 1000;
    refreshIntervalId = setInterval(() => {
      loadData();
      secondsToRefresh = REFRESH_MS / 1000;
    }, REFRESH_MS);
 
    countdownIntervalId = setInterval(() => {
      secondsToRefresh = Math.max(0, secondsToRefresh - 1);
      updateRefreshLabel();
    }, 1000);
  }
}
 
/* CLOCK + COUNTDOWN */
function startClock() {
  tickClock();
  setInterval(tickClock, 1000);
}
 
function tickClock() {
  const el = document.getElementById("clock");
  if (el) el.innerText = new Date().toLocaleTimeString();
}
 
function updateRefreshLabel() {
  const m = Math.floor(secondsToRefresh / 60).toString().padStart(2, "0");
  const s = Math.floor(secondsToRefresh % 60).toString().padStart(2, "0");
  const el = document.getElementById("nextRefresh");
  if (el) el.innerText = `${m}:${s}`;
}
 
/* COLOR HELPERS */
function hexToRgba(hex, alpha) {
  const v = hex.replace("#", "");
  const r = parseInt(v.substring(0, 2), 16);
  const g = parseInt(v.substring(2, 4), 16);
  const b = parseInt(v.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
 
function fadeGradient(canvasId, hex, topAlpha, bottomAlpha) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.clientHeight || 150);
  gradient.addColorStop(0, hexToRgba(hex, topAlpha));
  gradient.addColorStop(1, hexToRgba(hex, bottomAlpha));
  return gradient;
}
 
/* CHART SETUP */
function baseGridOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#5B665F", font: { size: 10 } } },
      y: { grid: { color: "#E5E7DD" }, ticks: { color: "#5B665F", font: { size: 10 } } }
    }
  };
}
 
function initCharts() {
  priceChart = new Chart(document.getElementById("priceChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Price",
        data: [],
        borderColor: "#E2962E",
        backgroundColor: fadeGradient("priceChart", "#E2962E", 0.28, 0.02),
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      }]
    },
    options: baseGridOptions()
  });
 
  weatherChart = new Chart(document.getElementById("weatherChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperature",
          data: [],
          borderColor: "#BC5A2E",
          backgroundColor: fadeGradient("weatherChart", "#BC5A2E", 0.18, 0.01),
          borderWidth: 2.5,
          pointRadius: 0,
          fill: true,
          tension: 0.4
        },
        {
          label: "Rain",
          data: [],
          borderColor: "#2E7CA6",
          backgroundColor: fadeGradient("weatherChart", "#2E7CA6", 0.18, 0.01),
          borderWidth: 2.5,
          pointRadius: 0,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      ...baseGridOptions(),
      plugins: { legend: { display: true, position: "top", labels: { boxWidth: 10, font: { size: 11 }, color: "#5B665F" } } }
    }
  });
 
  waterChart = new Chart(document.getElementById("waterChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Reservoir",
        data: [],
        borderColor: "#2E7CA6",
        backgroundColor: fadeGradient("waterChart", "#2E7CA6", 0.22, 0.02),
        borderWidth: 2.5,
        pointRadius: 0,
        fill: true,
        tension: 0.4
      }]
    },
    options: baseGridOptions()
  });
}
 
/* ICONS FOR NOTICE BOARD */
const ICONS = {
  rain: `<svg class="icon" viewBox="0 0 24 24"><path d="M7 16a4 4 0 0 1 .7-7.95A5.5 5.5 0 0 1 18 9.5 3.5 3.5 0 0 1 17.5 16H7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><line x1="9" y1="19" x2="9" y2="21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="13" y1="19" x2="13" y2="21.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="17" y1="19" x2="17" y2="21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  price: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 11.5V5a1 1 0 0 1 1-1h6.5a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-6.5 6.5a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="7.2" cy="7.2" r="1.2" fill="currentColor" stroke="none"/></svg>`,
  advisory: `<svg class="icon" viewBox="0 0 24 24"><path d="M3 10v4a1 1 0 0 0 1 1h2l4.5 3.2a1 1 0 0 0 1.5-.8V6.6a1 1 0 0 0-1.5-.8L6 9H4a1 1 0 0 0-1 1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M16 9a3 3 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
};
 
/* FETCH + RENDER */
async function loadData() {
  // Backend hook: replace the randomized values below with `data` once
  // the /analyze endpoint returns real readings.
  try {
    await fetch("/analyze", { method: "POST" });
  } catch (err) {
    console.warn("Backend /analyze not reachable, using simulated data.", err);
  }
 
  const now = new Date().toLocaleTimeString();
 
  /* PRICE */
  let price = 18 + Math.random() * 12;
 
  priceChart.data.labels.push(now);
  priceChart.data.datasets[0].data.push(price);
  trim(priceChart);
  priceChart.update();
 
  document.getElementById("priceValue").innerText = price.toFixed(2);
  document.getElementById("priceLog").innerHTML = `Latest reading at ${now}`;
 
  const deltaEl = document.getElementById("priceDelta");
  if (prevPrice !== null) {
    const diff = price - prevPrice;
    const sign = diff >= 0 ? "+" : "";
    deltaEl.innerText = `${sign}${diff.toFixed(2)}`;
    deltaEl.className = "price-delta " + (diff >= 0 ? "up" : "down");
  } else {
    deltaEl.innerText = "baseline";
    deltaEl.className = "price-delta";
  }
  prevPrice = price;
 
  /* WEATHER */
  let temp = 25 + Math.random() * 10;
  let rain = Math.random() * 100;
 
  weatherChart.data.labels.push(now);
  weatherChart.data.datasets[0].data.push(temp);
  weatherChart.data.datasets[1].data.push(rain);
  trim(weatherChart);
  weatherChart.update();
 
  document.getElementById("tempValue").innerText = `${temp.toFixed(1)}°C`;
  document.getElementById("tempBar").style.width = `${clamp((temp - 20) / 20 * 100, 0, 100)}%`;
 
  document.getElementById("rainValue").innerText = `${rain.toFixed(0)}%`;
  document.getElementById("rainBar").style.width = `${clamp(rain, 0, 100)}%`;
 
  document.getElementById("weatherLog").innerHTML =
    `Avg temp ${avg(weatherChart.data.datasets[0].data).toFixed(1)}°C · Avg rain ${avg(weatherChart.data.datasets[1].data).toFixed(1)}%`;
 
  /* WATER / RESERVOIR */
  let water = 60 + Math.random() * 25;
 
  waterChart.data.labels.push(now);
  waterChart.data.datasets[0].data.push(water);
  trim(waterChart);
  waterChart.update();
 
  document.getElementById("tankFill").style.height = `${clamp(water, 0, 100)}%`;
  document.getElementById("tankReadout").innerText = `${water.toFixed(0)}%`;
  document.getElementById("waterLog").innerHTML = `Reservoir level ${water.toFixed(1)}% · stable trend`;
 
  /* NEWS */
  document.getElementById("newsBox").innerHTML = `
    <div class="news-item news-rain">
      <span class="news-icon">${ICONS.rain}</span>
      <div>
        Rainfall pattern changing in ${province} this week
        <small>${now}</small>
      </div>
    </div>
    <div class="news-item news-price">
      <span class="news-icon">${ICONS.price}</span>
      <div>
        Crop price fluctuation detected in regional market
        <small>${now}</small>
      </div>
    </div>
    <div class="news-item news-advisory">
      <span class="news-icon">${ICONS.advisory}</span>
      <div>
        Agricultural advisory update issued by local office
        <small>${now}</small>
      </div>
    </div>
  `;
}
 
/* UTIL */
function trim(chart) {
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => ds.data.shift());
  }
}
 
function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
 
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}