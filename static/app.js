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

  loadAllData();
  startClock();

  if (!refreshIntervalId) {
    secondsToRefresh = REFRESH_MS / 1000;
    refreshIntervalId = setInterval(() => {
      loadAllData();
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

// ฟังก์ชันหลัก: โหลดข้อมูลทั้งหมดพร้อมกัน
async function loadAllData() {
  try {
    await fetch("/analyze", { method: "POST" });
  } catch (err) {
    console.warn("Backend /analyze not reachable, using simulated data.", err);
  }
  
  loadPriceData();
  loadEnvironmentData();
}

// ฟังก์ชันย่อยที่ 1: โหลดเฉพาะราคาผลผลิต
function loadPriceData() {
  const now = new Date().toLocaleTimeString();
  let price = 18 + Math.random() * 12;

  priceChart.data.labels.push(now);
  priceChart.data.datasets[0].data.push(price);
  trim(priceChart);
  priceChart.update();

  document.getElementById("priceValue").innerText = price.toFixed(2);
  document.getElementById("priceLog").innerHTML = `อัปเดตราคาล่าสุดเวลา ${now}`;

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
}

// ฟังก์ชันย่อยที่ 2: โหลดเฉพาะสภาพอากาศ น้ำ และข่าวสาร
function loadEnvironmentData() {
  const now = new Date().toLocaleTimeString();

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
    `อุณหภูมิเฉลี่ย ${avg(weatherChart.data.datasets[0].data).toFixed(1)}°C · ฝนตกเฉลี่ย ${avg(weatherChart.data.datasets[1].data).toFixed(1)}%`;

  /* WATER / RESERVOIR */
  let water = 60 + Math.random() * 25;

  waterChart.data.labels.push(now);
  waterChart.data.datasets[0].data.push(water);
  trim(waterChart);
  waterChart.update();

  document.getElementById("tankFill").style.height = `${clamp(water, 0, 100)}%`;
  document.getElementById("tankReadout").innerText = `${water.toFixed(0)}%`;
  document.getElementById("waterLog").innerHTML = `ระดับน้ำ ${water.toFixed(1)}% · แนวโน้มคงที่`;

  /* NEWS */
  document.getElementById("newsBox").innerHTML = `
    <div class="news-item">
      ประกาศเฝ้าระวังพายุในพื้นที่ ${province} สัปดาห์นี้
      <small>${now}</small>
    </div>
    <div class="news-item">
      พบความผันผวนของราคาผลผลิตในตลาดระดับภูมิภาค
      <small>${now}</small>
    </div>
    <div class="news-item">
      อัปเดตคำแนะนำการเพาะปลูกจากสำนักงานเกษตรจังหวัด
      <small>${now}</small>
    </div>
  `;
}

/* CHART SETUP */
function baseGridOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#5B665F", font: { size: 10 } } },
      y: { grid: { color: "#E1E4DA" }, ticks: { color: "#5B665F", font: { size: 10 } } }
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
        borderColor: "#D9A441",
        backgroundColor: "rgba(217,164,65,0.12)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.35
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
          backgroundColor: "rgba(188,90,46,0.08)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35
        },
        {
          label: "Rain",
          data: [],
          borderColor: "#2E7CA6",
          backgroundColor: "rgba(46,124,166,0.08)",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35
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
        backgroundColor: "rgba(46,124,166,0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.35
      }]
    },
    options: baseGridOptions()
  });
}

/* FETCH + RENDER */
async function loadData() {
  // Backend hook: replace the randomized values below with data once
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
    <div class="news-item">
      Rainfall pattern changing in ${province} this week
      <small>${now}</small>
    </div>
    <div class="news-item">
      Crop price fluctuation detected in regional market
      <small>${now}</small>
    </div>
    <div class="news-item">
      Agricultural advisory update issued by local office
      <small>${now}</small>
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
  if (!arr || arr.length === 0) return 0; // Added a safe check to prevent division by zero
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}