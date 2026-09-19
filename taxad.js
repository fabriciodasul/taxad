const INDICADORES_BCB = [
  { codigo: 432, nome: "Selic (meta)", sufixo: "% a.a.", prefixo: "" },
  { codigo: 433, nome: "IPCA (mês)", sufixo: "%", prefixo: "" },
  { codigo: 1, nome: "Dólar (PTAX)", sufixo: "", prefixo: "R$ " },
];

async function buscarIndicadorBCB(codigo) {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`;

  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error("Não foi possível buscar o indicador.");
  }

  const dados = await resposta.json();

  return {
    data: dados[0].data,
    valor: dados[0].valor,
  };
}

async function carregarIndicadores() {
  const container = document.getElementById("indicadores");
  container.innerHTML = "";

  for (const indicador of INDICADORES_BCB) {
    try {
      const resultado = await buscarIndicadorBCB(indicador.codigo);

      container.innerHTML += `
        <div class="card">
          <h3>${indicador.nome}</h3>
          <p>${indicador.prefixo || ""}${resultado.valor}${indicador.sufixo || ""}</p>
          <small>Atualizado em: ${resultado.data}</small>
        </div>
      `;
    } catch (erro) {
      container.innerHTML += `
        <div class="card">
          <p>Erro ao carregar ${indicador.nome}.</p>
        </div>
      `;
    }
  }
}

async function buscarAcoes(tickers) {
  const url = `https://brapi.dev/api/quote/${tickers}`;
  const resposta = await fetch(url);

  if (!resposta.ok) {
    throw new Error("Não foi possível buscar as ações.");
  }

  const dados = await resposta.json();
  return dados.results;
}

function renderizarAcoes(acoes) {
  const listaAcoes = document.getElementById("lista-acoes");
  listaAcoes.innerHTML = "";

  for (const acao of acoes) {
    listaAcoes.innerHTML += `
      <div class="acao">
        <strong>${acao.symbol}</strong>
        <p>${acao.shortName}</p>
        <p>R$ ${acao.regularMarketPrice}</p>
      </div>
    `;
  }
}

const inputTicker = document.getElementById("input-ticker");
const btnBuscar = document.getElementById("btn-buscar");

async function realizarBusca() {
  const tickers = inputTicker.value.trim();

  if (!tickers) return;

  try {
    const acoes = await buscarAcoes(tickers);
    renderizarAcoes(acoes);
  } catch (erro) {
    document.getElementById("lista-acoes").innerHTML =
      "<p>Não foi possível buscar as ações.</p>";
  }
}

btnBuscar.addEventListener("click", realizarBusca);

inputTicker.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    realizarBusca();
  }
});

carregarIndicadores();