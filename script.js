const DEVICE_TOKEN = "2f7b3984-6543-4e0c-b8cf-6b9d2bd6382e";
const TAGO_ENDPOINT = "https://api.tago.io/data";
const variableName = "temperature";

const tempAtualElem = document.getElementById("temp");
const tempMaxElem = document.getElementById("temp-max");
const tempMinElem = document.getElementById("temp-min");
const tempMediaElem = document.getElementById("temp-media");

let chart;
let ultimosValores = []; // [{value: x, time: y}]

async function fetchValoresDoMinuto() {
  const agora = (new Date()).toISOString();
  // Pega 61 últimos segundos para garantir 60 pontos
  const umMinAtras = new Date(Date.now() - 60000).toISOString();
  const res = await fetch(`${TAGO_ENDPOINT}?variable=${variableName}&start_date=${umMinAtras}&end_date=${agora}&order=desc&qty=61`, {
    headers: {
      "Device-Token": DEVICE_TOKEN
    }
  });
  const dados = await res.json();
  // Filtra resultado para garantir ordem e só valores com timestamp
  let result = dados.result.filter(x => typeof x.value === 'number' && x.time).sort((a,b) => new Date(a.time) - new Date(b.time));
  return result;
}

async function atualizarDashboard() {
  try {
    // Busca valores do último minuto
    const valores = await fetchValoresDoMinuto();
    ultimosValores = valores;

    // Atual (último ponto)
    const atual = valores.length ? valores[valores.length - 1].value : "--";

    // Máximo, mínimo e média
    const todosValores = valores.map(v => v.value);
    let max = "--", min = "--", media = "--";
    if (todosValores.length) {
      max = Math.max(...todosValores).toFixed(2);
      min = Math.min(...todosValores).toFixed(2);
      media = (todosValores.reduce((a,b) => a+b,0)/todosValores.length).toFixed(2);
    }

    // Unidade
    const unidade = (valores.length && valores[0].unit) ? " " + valores[0].unit : "";

    // Exibe valores
    tempAtualElem.textContent = atual !== "--" ? atual + unidade : "--";
    tempMaxElem.textContent = max !== "--" ? max + unidade : "--";
    tempMinElem.textContent = min !== "--" ? min + unidade : "--";
    tempMediaElem.textContent = media !== "--" ? media + unidade : "--";

    // Atualiza o gráfico
    atualizarGrafico();

  } catch (err) {
    tempAtualElem.textContent = tempMaxElem.textContent = tempMinElem.textContent = tempMediaElem.textContent = "--";
    if (chart) chart.data.labels = chart.data.datasets[0].data = [];
    //console.error("Erro ao buscar dados do TagoIO:", err);
  }
}

function atualizarGrafico() {
  const labels = ultimosValores.map(x =>
    new Date(x.time).toLocaleTimeString('pt-BR', {hour12:false, hour: '2-digit', minute:'2-digit', second:'2-digit'})
  );
  const data = ultimosValores.map(x => x.value);

  if (!chart) {
    // Inicializa o gráfico
    const ctx = document.getElementById("grafico-temperatura").getContext('2d');
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temperatura (último minuto)',
          data,
          borderColor: '#326bf3',
          backgroundColor: 'rgba(50,107,243,0.1)',
          pointBackgroundColor: '#1542a0',
          fill: true,
          tension: 0.2
        }]
      },
      options: {
        responsive: true,
        animation: false,
        scales: {
          x: { display: true, title: { display: true, text: 'Hora' } },
          y: { display: true, title: { display: true, text: 'Temperatura' } }
        }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
  }
}

// Notificações fake
function simulateAction(mode) {
  const msgbox = document.getElementById("action-message");
  msgbox.textContent = "";
  setTimeout(() => {
    if (mode === "sms") {
      msgbox.textContent = "Simulação: SMS enviado (crie uma Action no TagoIO para tornar isso real!)";
    }
    if (mode === "email") {
      msgbox.textContent = "Simulação: E-mail enviado (configure uma Action para envio real!)";
    }
  }, 800);
}

document.getElementById("sms-btn").onclick = () => simulateAction("sms");
document.getElementById("email-btn").onclick = () => simulateAction("email");

// INICIALIZA - remove botão manual
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh");
  if (refreshBtn) refreshBtn.remove(); // remove botão de atualizar manual
  atualizarDashboard();
  setInterval(atualizarDashboard, 1000); // Real time: 1 segundo
});