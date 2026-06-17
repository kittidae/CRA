let province = "";
let priceChart, weatherChart, waterChart;
let prevPrice = null;
let refreshIntervalId = null;
let countdownIntervalId = null;
let secondsToRefresh = 3600; // 1 hour in seconds

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

  // Handle auto-refresh interval
  if (!refreshIntervalId) {
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
          label: "Temp",
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
  try {
    // Replace with your actual backend endpoint
    await fetch("/analyze", { method: "POST" });
  } catch (err) {
    console.warn("Backend /analyze not reachable, using simulated data.");
  }

  const now = new Date().toLocaleTimeString();

  /* PRICE LOGIC */
  let price = 18 + Math.random() * 12;
  updateChart(priceChart, now, price);
  document.getElementById("priceValue").innerText = price.toFixed(2);
  document.getElementById("priceLog").innerText = `Latest reading at ${now}`;

  const deltaEl = document.getElementById("priceDelta");
  if (prevPrice !== null) {
    const diff = price - prevPrice;
    deltaEl.innerText = (diff >= 0 ? "+" : "") + diff.toFixed(2);
    deltaEl.className = "price-delta " + (diff >= 0 ? "up" : "down");
  }
  prevPrice = price;

  /* WEATHER LOGIC */
  let temp = 25 + Math.random() * 10;
  let rain = Math.random() * 100;
  updateChart(weatherChart, now, [temp, rain]);
  
  document.getElementById("tempValue").innerText = `${temp.toFixed(1)}°C`;
  document.getElementById("tempBar").style.width = `${clamp((temp - 20) / 20 * 100, 0, 100)}%`;
  document.getElementById("rainValue").innerText = `${rain.toFixed(0)}%`;
  document.getElementById("rainBar").style.width = `${clamp(rain, 0, 100)}%`;
  document.getElementById("weatherLog").innerText = `Avg temp ${avg(weatherChart.data.datasets[0].data).toFixed(1)}°C`;

  /* WATER LOGIC */
  let water = 60 + Math.random() * 25;
  updateChart(waterChart, now, water);
  document.getElementById("tankFill").style.height = `${clamp(water, 0, 100)}%`;
  document.getElementById("tankReadout").innerText = `${water.toFixed(0)}%`;
  document.getElementById("waterLog").innerText = `Reservoir level ${water.toFixed(1)}% · stable trend`;
}

/* HELPERS */
function updateChart(chart, label, data) {
  chart.data.labels.push(label);
  if (Array.isArray(data)) {
    chart.data.datasets.forEach((ds, i) => ds.data.push(data[i]));
  } else {
    chart.data.datasets[0].data.push(data);
  }
  trim(chart);
  chart.update();
}

function trim(chart) {
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => ds.data.shift());
  }
}

function avg(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}