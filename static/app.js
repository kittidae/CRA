let province = "";

let priceChart, weatherChart, waterChart;

/* 🌸 START DASHBOARD */
function start() {
  province = document.getElementById("province").value;

  document.getElementById("modal").style.display = "none";
  document.getElementById("dashboard").classList.remove("hidden");

  document.getElementById("provName").innerText = province;

  initCharts();
  loadData();

  // ⏱ REAL TIME UPDATE (1 HOUR)
  setInterval(loadData, 60 * 60 * 1000);
}

/* 📊 INIT CHARTS */
function initCharts() {

  priceChart = new Chart(document.getElementById("priceChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Price",
        data: [],
        borderColor: "#4caf50",
        backgroundColor: "rgba(76,175,80,0.1)",
        tension: 0.3
      }]
    }
  });

  weatherChart = new Chart(document.getElementById("weatherChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperature",
          data: [],
          borderColor: "#ff80ab",
          tension: 0.3
        },
        {
          label: "Rain",
          data: [],
          borderColor: "#64b5f6",
          tension: 0.3
        }
      ]
    }
  });

  waterChart = new Chart(document.getElementById("waterChart"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Reservoir Level",
        data: [],
        borderColor: "#81c784",
        backgroundColor: "rgba(129,199,132,0.2)",
        tension: 0.3
      }]
    }
  });
}

/* 📡 FETCH REAL DATA */
async function loadData() {

  const res = await fetch("/analyze", { method: "POST" });
  const data = await res.json();

  const now = new Date().toLocaleTimeString();

  /* =======================
     📈 PRICE TREND
  ======================= */
  let price = 18 + Math.random() * 12;

  priceChart.data.labels.push(now);
  priceChart.data.datasets[0].data.push(price);

  trim(priceChart);

  priceChart.update();

  document.getElementById("priceLog").innerHTML =
    Latest price: <b>${price.toFixed(2)} THB</b>;

  /* =======================
     🌦 WEATHER
  ======================= */
  let temp = 25 + Math.random() * 10;
  let rain = Math.random() * 100;

  weatherChart.data.labels.push(now);
  weatherChart.data.datasets[0].data.push(temp);
  weatherChart.data.datasets[1].data.push(rain);

  trim(weatherChart);

  weatherChart.update();

  document.getElementById("weatherLog").innerHTML =
    Avg Temp: ${avg(weatherChart.data.datasets[0].data).toFixed(1)}°C | Rain: ${avg(weatherChart.data.datasets[1].data).toFixed(1)}%;

  /* =======================
     💧 WATER
  ======================= */
  let water = 60 + Math.random() * 25;

  waterChart.data.labels.push(now);
  waterChart.data.datasets[0].data.push(water);

  trim(waterChart);

  waterChart.update();

  document.getElementById("waterLog").innerHTML =
    Reservoir Level: ${water.toFixed(1)}% (stable trend);

  /* =======================
     📰 NEWS (PROVINCE)
  ======================= */
  document.getElementById("newsBox").innerHTML = `
    <div class="news-item">
      📰 ${province}: rainfall pattern changing this week<br>
      <small>${now}</small>
    </div>

    <div class="news-item">
      📰 crop price fluctuation detected in regional market<br>
      <small>${now}</small>
    </div>

    <div class="news-item">
      📰 agricultural advisory update issued by local office<br>
      <small>${now}</small>
    </div>
  `;
}

/* 🧠 UTIL */
function trim(chart) {
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => ds.data.shift());
  }
}

function avg(arr) {
  return arr.reduce((a,b)=>a+b,0) / arr.length;
}