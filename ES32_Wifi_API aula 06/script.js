// ============================================================
// CONFIGURAÇÕES
// ============================================================

const MQTT_BROKER =
    "wss://broker.hivemq.com:8884/mqtt";


const TOPIC_TEMPERATURA =
    "esp32/clima/temperatura";

const TOPIC_UMIDADE =
    "esp32/clima/umidade";

const TOPIC_CIDADE_ATUAL =
    "esp32/clima/cidadeAtual";

const TOPIC_CIDADE =
    "esp32/clima/cidade";


const STORAGE_HISTORICO =
    "dashboardHistorico";

const STORAGE_FAVORITO =
    "dashboardFavorito";

const STORAGE_TEMA =
    "dashboardTema";


// ============================================================
// VARIÁVEIS
// ============================================================

let cidadeAtual = "";

let mqttClient = null;

let chart = null;

let ultimaConsulta = null;


// ============================================================
// ELEMENTOS DO HTML
// ============================================================

const cidadeInput =
    document.getElementById("cidade");

const paisSelect =
    document.getElementById("pais");

const btnBuscar =
    document.getElementById("btnBuscar");

const mensagem =
    document.getElementById("mensagem");

const loading =
    document.getElementById("loading");

const localTitulo =
    document.getElementById("localTitulo");

const ultimaAtualizacao =
    document.getElementById("ultimaAtualizacao");

const temperatura =
    document.getElementById("temperatura");

const minMax =
    document.getElementById("minMax");

const umidade =
    document.getElementById("umidade");

const sensacao =
    document.getElementById("sensacao");

const vento =
    document.getElementById("vento");

const direcaoVento =
    document.getElementById("direcaoVento");

const pressao =
    document.getElementById("pressao");

const condicao =
    document.getElementById("condicao");

const descricao =
    document.getElementById("descricao");

const nascerSol =
    document.getElementById("nascerSol");

const porSol =
    document.getElementById("porSol");

const alertaClima =
    document.getElementById("alertaClima");

const historicoLista =
    document.getElementById("historicoLista");

const limparHistoricoBtn =
    document.getElementById("limparHistorico");

const favoritoConteudo =
    document.getElementById("favoritoConteudo");

const favoriteButton =
    document.getElementById("favoriteButton");

const themeToggle =
    document.getElementById("themeToggle");

const mqttStatus =
    document.getElementById("mqttStatus");

const mqttDot =
    document.getElementById("mqttDot");

const mqttTexto =
    document.getElementById("mqttTexto");


// ============================================================
// API KEY
// ============================================================

function apiEstaConfigurada() {

    if (
        typeof OPENWEATHER_API_KEY ===
        "undefined"
    ) {
        return false;
    }


    if (
        !OPENWEATHER_API_KEY ||
        OPENWEATHER_API_KEY.trim() === ""
    ) {
        return false;
    }


    if (
        OPENWEATHER_API_KEY ===
        "COLE_SUA_CHAVE_AQUI"
    ) {
        return false;
    }


    return true;
}


// ============================================================
// FORMATAÇÕES
// ============================================================

function formatarTemperatura(valor) {

    if (
        valor === undefined ||
        valor === null ||
        Number.isNaN(Number(valor))
    ) {
        return "--";
    }


    return (
        Number(valor).toFixed(1) +
        " °C"
    );
}


function formatarHora(timestamp) {

    if (!timestamp) {
        return "--";
    }


    return new Date(
        timestamp * 1000
    ).toLocaleTimeString(
        "pt-BR",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatarDataHora(data) {

    return data.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function converterDirecaoVento(graus) {

    if (
        graus === undefined ||
        graus === null
    ) {
        return "--";
    }


    const direcoes = [
        "N",
        "NE",
        "L",
        "SE",
        "S",
        "SO",
        "O",
        "NO"
    ];


    const indice =
        Math.round(graus / 45) % 8;


    return (
        direcoes[indice] +
        " (" +
        Math.round(graus) +
        "°)"
    );
}


// ============================================================
// MENSAGENS
// ============================================================

function mostrarMensagem(
    texto,
    tipo = "info"
) {

    if (!mensagem) {
        return;
    }


    mensagem.textContent =
        texto;

    mensagem.className =
        `message ${tipo}`;
}


function limparMensagem() {

    if (!mensagem) {
        return;
    }


    mensagem.textContent = "";

    mensagem.className =
        "message";
}


// ============================================================
// LOADING
// ============================================================

function mostrarLoading() {

    if (loading) {
        loading.hidden = false;
    }


    if (btnBuscar) {
        btnBuscar.disabled = true;
    }
}


function esconderLoading() {

    if (loading) {
        loading.hidden = true;
    }


    if (btnBuscar) {
        btnBuscar.disabled = false;
    }
}


// ============================================================
// TEMA VISUAL BASEADO NO CLIMA
// ETAPA 2 - DESAFIO ADICIONAL
// ============================================================

function atualizarTemaClimatico(dados) {

    document.body.classList.remove(
        "weather-rain",
        "weather-cloud",
        "weather-clear",
        "weather-night"
    );


    const grupo =
        dados.weather?.[0]?.main
            ?.toLowerCase() || "";


    const agora =
        Number(dados.dt);

    const nascer =
        Number(dados.sys.sunrise);

    const porSol =
        Number(dados.sys.sunset);


    const noite =
        agora < nascer ||
        agora > porSol;


    if (noite) {

        document.body.classList.add(
            "weather-night"
        );

        return;
    }


    if (
        grupo.includes("rain") ||
        grupo.includes("drizzle") ||
        grupo.includes("thunderstorm")
    ) {

        document.body.classList.add(
            "weather-rain"
        );

        return;
    }


    if (
        grupo.includes("cloud")
    ) {

        document.body.classList.add(
            "weather-cloud"
        );

        return;
    }


    document.body.classList.add(
        "weather-clear"
    );
}


// ============================================================
// ALERTA CLIMÁTICO
// NOVA FUNCIONALIDADE
// ============================================================

function gerarAlertaClimatico(dados) {

    if (!alertaClima) {
        return;
    }


    const temp =
        Number(dados.main.temp);

    const velocidadeVento =
        Number(dados.wind.speed);

    const umidadeAtual =
        Number(dados.main.humidity);


    let texto = "";

    let classe = "normal";


    if (temp >= 35) {

        texto =
            "🌡️ Atenção: temperatura muito elevada.";

        classe = "danger";

    } else if (temp <= 5) {

        texto =
            "🥶 Atenção: temperatura muito baixa.";

        classe = "danger";

    } else if (velocidadeVento >= 15) {

        texto =
            "💨 Atenção: velocidade do vento elevada.";

        classe = "warning";

    } else if (umidadeAtual >= 90) {

        texto =
            "💧 Atenção: umidade muito elevada.";

        classe = "warning";

    } else if (umidadeAtual <= 20) {

        texto =
            "🏜️ Atenção: umidade muito baixa.";

        classe = "warning";

    } else {

        texto =
            "✅ Condições meteorológicas dentro dos parâmetros normais.";

        classe = "normal";
    }


    alertaClima.textContent =
        texto;

    alertaClima.className =
        `climate-alert ${classe}`;
}


// ============================================================
// GRÁFICO
// ============================================================

function criarGrafico() {

    const canvas =
        document.getElementById("chart");


    if (!canvas) {

        console.error(
            "Canvas do gráfico não encontrado."
        );

        return;
    }


    // Evita duplicação
    if (chart) {
        chart.destroy();
    }


    chart = new Chart(
        canvas,
        {
            type: "line",

            data: {

                labels: [],

                datasets: [

                    {
                        label:
                            "Temperatura (°C)",

                        data: [],

                        borderColor:
                            "#ef4444",

                        backgroundColor:
                            "rgba(239, 68, 68, 0.10)",

                        borderWidth: 3,

                        pointRadius: 4,

                        pointHoverRadius: 6,

                        tension: 0.35,

                        fill: true,

                        yAxisID: "y"
                    },


                    {
                        label:
                            "Umidade (%)",

                        data: [],

                        borderColor:
                            "#2563eb",

                        backgroundColor:
                            "rgba(37, 99, 235, 0.10)",

                        borderWidth: 3,

                        pointRadius: 4,

                        pointHoverRadius: 6,

                        tension: 0.35,

                        fill: true,

                        yAxisID: "y1"
                    }

                ]
            },


            options: {

                responsive: true,

                maintainAspectRatio: false,


                interaction: {

                    mode: "index",

                    intersect: false
                },


                plugins: {

                    title: {

                        display: true,

                        text:
                            "Histórico meteorológico",

                        font: {

                            size: 18,

                            weight: "bold"
                        }
                    },


                    legend: {

                        display: true,

                        position: "top"
                    }
                },


                scales: {

                    x: {

                        title: {

                            display: true,

                            text:
                                "Horário das consultas"
                        }
                    },


                    y: {

                        type: "linear",

                        position: "left",

                        title: {

                            display: true,

                            text:
                                "Temperatura (°C)"
                        }
                    },


                    y1: {

                        type: "linear",

                        position: "right",

                        min: 0,

                        max: 100,

                        title: {

                            display: true,

                            text:
                                "Umidade (%)"
                        },


                        grid: {

                            drawOnChartArea: false
                        }
                    }
                }
            }
        }
    );


    console.log(
        "Gráfico criado com sucesso."
    );
}


// ============================================================
// LIMPAR GRÁFICO
// ============================================================

function limparGrafico() {

    if (!chart) {

        criarGrafico();

        return;
    }


    chart.data.labels = [];


    chart.data.datasets.forEach(
        dataset => {
            dataset.data = [];
        }
    );


    chart.update();
}


// ============================================================
// ATUALIZAR GRÁFICO
// ============================================================

function atualizarGrafico(
    temperaturaValor,
    umidadeValor,
    cidade
) {

    if (!chart) {
        criarGrafico();
    }


    if (!chart) {
        return;
    }


    const temperaturaNumerica =
        Number(temperaturaValor);

    const umidadeNumerica =
        Number(umidadeValor);


    if (
        Number.isNaN(
            temperaturaNumerica
        ) ||
        Number.isNaN(
            umidadeNumerica
        )
    ) {

        console.error(
            "Valores inválidos para o gráfico.",
            {
                temperaturaValor,
                umidadeValor
            }
        );

        return;
    }


    const agora =
        new Date();


    const horario =
        agora.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    // IMPORTANTE:
    // Os dois valores são adicionados
    // no MESMO ponto do gráfico.

    chart.data.labels.push(
        horario
    );


    chart.data.datasets[0].data.push(
        temperaturaNumerica
    );


    chart.data.datasets[1].data.push(
        umidadeNumerica
    );


    // Máximo de 30 consultas
    if (
        chart.data.labels.length > 30
    ) {

        chart.data.labels.shift();

        chart.data.datasets[0]
            .data.shift();

        chart.data.datasets[1]
            .data.shift();
    }


    chart.options.plugins.title.text =
        `Histórico meteorológico - ${cidade}`;


    chart.update();


    console.log(
        "Ponto adicionado ao gráfico:",
        {
            cidade,
            horario,
            temperatura:
                temperaturaNumerica,
            umidade:
                umidadeNumerica
        }
    );
}


// ============================================================
// ATUALIZAR INTERFACE
// ============================================================

function atualizarInterface(dados) {

    const cidade =
        dados.name;


    // Detectar troca de cidade
    if (
        cidadeAtual &&
        cidadeAtual.toLowerCase() !==
        cidade.toLowerCase()
    ) {

        limparGrafico();
    }


    cidadeAtual =
        cidade;


    // Localização
    if (localTitulo) {

        localTitulo.textContent =
            `${dados.name}, ${dados.sys.country}`;
    }


    // Temperatura
    if (temperatura) {

        temperatura.textContent =
            formatarTemperatura(
                dados.main.temp
            );
    }


    // Mínima e máxima
    if (minMax) {

        minMax.textContent =
            `Mín: ${formatarTemperatura(
                dados.main.temp_min
            )} | Máx: ${formatarTemperatura(
                dados.main.temp_max
            )}`;
    }


    // Umidade
    if (umidade) {

        umidade.textContent =
            `${dados.main.humidity}%`;
    }


    // Sensação
    if (sensacao) {

        sensacao.textContent =
            formatarTemperatura(
                dados.main.feels_like
            );
    }


    // Vento
    if (vento) {

        vento.textContent =
            `${(
                Number(dados.wind.speed) * 3.6
            ).toFixed(1)} km/h`;
    }


    // Direção
    if (direcaoVento) {

        direcaoVento.textContent =
            `Direção: ${converterDirecaoVento(
                dados.wind.deg
            )}`;
    }


    // Pressão
    if (pressao) {

        pressao.textContent =
            `${dados.main.pressure} hPa`;
    }


    // Condição
    if (condicao) {

        condicao.textContent =
            dados.weather[0].main;
    }


    // Descrição
    if (descricao) {

        descricao.textContent =
            dados.weather[0].description;
    }


    // Nascer do sol
    if (nascerSol) {

        nascerSol.textContent =
            formatarHora(
                dados.sys.sunrise
            );
    }


    // Pôr do sol
    if (porSol) {

        porSol.textContent =
            formatarHora(
                dados.sys.sunset
            );
    }


    // Data/hora
    ultimaConsulta =
        new Date();


    if (ultimaAtualizacao) {

        ultimaAtualizacao.textContent =
            `Última atualização: ${formatarDataHora(
                ultimaConsulta
            )}`;
    }


    // Alerta
    gerarAlertaClimatico(
        dados
    );


    // Tema baseado no clima
    atualizarTemaClimatico(
        dados
    );


    // GRÁFICO
    atualizarGrafico(
        dados.main.temp,
        dados.main.humidity,
        cidade
    );


    // Favorito
    atualizarFavoritoVisual();
}


// ============================================================
// CONSULTAR OPENWEATHERMAP
// ============================================================

async function buscarClima(
    cidade,
    pais
) {

    if (!apiEstaConfigurada()) {

        throw new Error(
            "API Key não configurada. Coloque sua chave do OpenWeatherMap no index.html."
        );
    }


    const url =
        "https://api.openweathermap.org/data/2.5/weather" +
        `?q=${encodeURIComponent(cidade)},${encodeURIComponent(pais)}` +
        `&appid=${OPENWEATHER_API_KEY}` +
        "&units=metric" +
        "&lang=pt_br";


    let resposta;


    try {

        resposta =
            await fetch(url);

    } catch (erro) {

        throw new Error(
            "Não foi possível consultar os dados. Verifique sua conexão com a internet."
        );
    }


    if (resposta.status === 401) {

        throw new Error(
            "Não foi possível acessar o serviço meteorológico. Verifique sua API Key."
        );
    }


    if (resposta.status === 404) {

        throw new Error(
            "Cidade não encontrada. Verifique o nome informado e tente novamente."
        );
    }


    if (resposta.status === 429) {

        throw new Error(
            "Limite de consultas da API atingido. Tente novamente mais tarde."
        );
    }


    if (!resposta.ok) {

        throw new Error(
            `Erro na API meteorológica. Código: ${resposta.status}.`
        );
    }


    const dados =
        await resposta.json();


    return dados;
}


// ============================================================
// CONSULTAR
// ============================================================

async function consultar() {

    if (!cidadeInput) {
        return;
    }


    const cidade =
        cidadeInput.value.trim();


    const pais =
        paisSelect
            ? paisSelect.value
            : "BR";


    // Campo vazio
    if (!cidade) {

        mostrarMensagem(
            "Informe uma cidade antes de realizar a consulta.",
            "error"
        );

        cidadeInput.focus();

        return;
    }


    limparMensagem();

    mostrarLoading();


    try {

        const dados =
            await buscarClima(
                cidade,
                pais
            );


        atualizarInterface(
            dados
        );


        salvarHistorico(
            dados
        );


        publicarMQTT(
            dados
        );


        mostrarMensagem(
            `Clima de ${dados.name} atualizado com sucesso!`,
            "success"
        );


    } catch (erro) {

        console.error(
            "Erro na consulta:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Não foi possível consultar os dados.",
            "error"
        );


    } finally {

        esconderLoading();
    }
}


// ============================================================
// HISTÓRICO
// ============================================================

function obterHistorico() {

    try {

        const dados =
            localStorage.getItem(
                STORAGE_HISTORICO
            );


        if (!dados) {
            return [];
        }


        return JSON.parse(
            dados
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar histórico:",
            erro
        );

        return [];
    }
}


function salvarHistorico(dados) {

    try {

        let historico =
            obterHistorico();


        const registro = {

            cidade:
                dados.name,

            pais:
                dados.sys.country,

            temperatura:
                dados.main.temp,

            umidade:
                dados.main.humidity,

            data:
                new Date().toISOString()
        };


        historico.unshift(
            registro
        );


        // Mantém apenas 10
        historico =
            historico.slice(0, 10);


        localStorage.setItem(
            STORAGE_HISTORICO,
            JSON.stringify(
                historico
            )
        );


        renderizarHistorico();


    } catch (erro) {

        console.error(
            "Erro ao salvar histórico:",
            erro
        );
    }
}


function renderizarHistorico() {

    if (!historicoLista) {
        return;
    }


    const historico =
        obterHistorico();


    historicoLista.innerHTML =
        "";


    if (historico.length === 0) {

        historicoLista.innerHTML =
            "<p>Nenhuma consulta realizada ainda.</p>";

        return;
    }


    historico.forEach(
        item => {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "history-item";


            const data =
                new Date(
                    item.data
                ).toLocaleString(
                    "pt-BR",
                    {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                    }
                );


            elemento.innerHTML = `

                <strong>
                    ${escapeHTML(
                        item.cidade
                    )},
                    ${escapeHTML(
                        item.pais
                    )}
                </strong>

                <span>
                    ${Number(
                        item.temperatura
                    ).toFixed(1)} °C
                    ·
                    ${item.umidade}%
                </span>

                <small>
                    ${data}
                </small>

            `;


            historicoLista.appendChild(
                elemento
            );
        }
    );
}


// ============================================================
// LIMPAR HISTÓRICO
// ============================================================

function limparHistorico() {

    localStorage.removeItem(
        STORAGE_HISTORICO
    );


    renderizarHistorico();


    mostrarMensagem(
        "Histórico apagado.",
        "success"
    );
}


// ============================================================
// SEGURANÇA
// ============================================================

function escapeHTML(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto;


    return div.innerHTML;
}


// ============================================================
// FAVORITO
// ============================================================

function obterFavorito() {

    return localStorage.getItem(
        STORAGE_FAVORITO
    );
}


function salvarFavorito(
    cidade
) {

    localStorage.setItem(
        STORAGE_FAVORITO,
        cidade
    );


    renderizarFavorito();


    mostrarMensagem(
        `${cidade} foi adicionada aos favoritos.`,
        "success"
    );
}


function removerFavorito() {

    localStorage.removeItem(
        STORAGE_FAVORITO
    );


    renderizarFavorito();


    mostrarMensagem(
        "Cidade removida dos favoritos.",
        "success"
    );


    atualizarFavoritoVisual();
}


function renderizarFavorito() {

    if (!favoritoConteudo) {
        return;
    }


    const favorito =
        obterFavorito();


    if (!favorito) {

        favoritoConteudo.innerHTML = `

            <p>
                Nenhuma cidade favorita cadastrada.
            </p>

        `;

        return;
    }


    favoritoConteudo.innerHTML = `

        <div class="favorite-city">

            <strong>
                ⭐ ${escapeHTML(
                    favorito
                )}
            </strong>

            <button
                type="button"
                id="consultarFavorito"
                class="secondary-button"
            >
                🔄 Consultar novamente
            </button>

            <button
                type="button"
                id="removerFavorito"
                class="secondary-button"
            >
                🗑️ Remover
            </button>

        </div>

    `;


    const consultarFavorito =
        document.getElementById(
            "consultarFavorito"
        );


    const removerFavoritoBtn =
        document.getElementById(
            "removerFavorito"
        );


    if (consultarFavorito) {

        consultarFavorito.addEventListener(
            "click",
            () => {

                if (cidadeInput) {

                    cidadeInput.value =
                        favorito;
                }


                consultar();
            }
        );
    }


    if (removerFavoritoBtn) {

        removerFavoritoBtn.addEventListener(
            "click",
            removerFavorito
        );
    }
}


function atualizarFavoritoVisual() {

    if (!favoriteButton) {
        return;
    }


    const favorito =
        obterFavorito();


    if (
        favorito &&
        cidadeAtual &&
        favorito.toLowerCase() ===
        cidadeAtual.toLowerCase()
    ) {

        favoriteButton.textContent =
            "⭐ Cidade favorita";

    } else {

        favoriteButton.textContent =
            "☆ Favoritar cidade";
    }
}


function alternarFavorito() {

    if (!cidadeAtual) {

        mostrarMensagem(
            "Consulte uma cidade antes de favoritar.",
            "error"
        );

        return;
    }


    const favorito =
        obterFavorito();


    if (
        favorito &&
        favorito.toLowerCase() ===
        cidadeAtual.toLowerCase()
    ) {

        removerFavorito();

    } else {

        salvarFavorito(
            cidadeAtual
        );
    }


    atualizarFavoritoVisual();
}


// ============================================================
// TEMA CLARO / ESCURO
// ============================================================

function carregarTema() {

    const tema =
        localStorage.getItem(
            STORAGE_TEMA
        );


    if (tema === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

    } else {

        document.body.classList.remove(
            "dark-mode"
        );
    }


    atualizarBotaoTema();
}


function alternarTema() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const escuro =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        STORAGE_TEMA,
        escuro
            ? "dark"
            : "light"
    );


    atualizarBotaoTema();
}


function atualizarBotaoTema() {

    if (!themeToggle) {
        return;
    }


    const escuro =
        document.body.classList.contains(
            "dark-mode"
        );


    if (escuro) {

        themeToggle.textContent =
            "☀️ Modo claro";

        themeToggle.setAttribute(
            "aria-label",
            "Ativar modo claro"
        );

    } else {

        themeToggle.textContent =
            "🌙 Modo escuro";

        themeToggle.setAttribute(
            "aria-label",
            "Ativar modo escuro"
        );
    }
}


// ============================================================
// MQTT - STATUS
// ============================================================

function atualizarStatusMQTT(
    status,
    texto
) {

    if (mqttStatus) {

        mqttStatus.setAttribute(
            "aria-label",
            texto
        );
    }


    if (mqttTexto) {

        mqttTexto.textContent =
            texto;
    }


    if (mqttDot) {

        mqttDot.className =
            `mqtt-dot ${status}`;
    }
}


// ============================================================
// MQTT - CONEXÃO
// ============================================================

function conectarMQTT() {

    if (
        typeof mqtt ===
        "undefined"
    ) {

        console.error(
            "Biblioteca MQTT não encontrada."
        );


        atualizarStatusMQTT(
            "error",
            "MQTT indisponível"
        );


        return;
    }


    atualizarStatusMQTT(
        "connecting",
        "Conectando MQTT..."
    );


    try {

        mqttClient =
            mqtt.connect(
                MQTT_BROKER,
                {
                    reconnectPeriod:
                        5000,

                    connectTimeout:
                        10000
                }
            );


        mqttClient.on(
            "connect",
            () => {

                console.log(
                    "MQTT conectado."
                );


                atualizarStatusMQTT(
                    "connected",
                    "MQTT conectado"
                );


                mqttClient.subscribe(
                    [
                        TOPIC_TEMPERATURA,
                        TOPIC_UMIDADE,
                        TOPIC_CIDADE_ATUAL,
                        TOPIC_CIDADE
                    ],
                    erro => {

                        if (erro) {

                            console.error(
                                "Erro ao assinar MQTT:",
                                erro
                            );

                        } else {

                            console.log(
                                "Tópicos MQTT assinados."
                            );
                        }
                    }
                );
            }
        );


        mqttClient.on(
            "reconnect",
            () => {

                atualizarStatusMQTT(
                    "connecting",
                    "Reconectando MQTT..."
                );
            }
        );


        mqttClient.on(
            "close",
            () => {

                atualizarStatusMQTT(
                    "offline",
                    "MQTT desconectado"
                );
            }
        );


        mqttClient.on(
            "error",
            erro => {

                console.error(
                    "Erro MQTT:",
                    erro
                );


                atualizarStatusMQTT(
                    "error",
                    "Erro no MQTT"
                );
            }
        );


        mqttClient.on(
            "message",
            (
                topic,
                payload
            ) => {

                console.log(
                    "MQTT:",
                    topic,
                    payload.toString()
                );
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao iniciar MQTT:",
            erro
        );


        atualizarStatusMQTT(
            "error",
            "Falha no MQTT"
        );
    }
}


// ============================================================
// MQTT - PUBLICAR
// ============================================================

function publicarMQTT(dados) {

    if (
        !mqttClient ||
        !mqttClient.connected
    ) {

        console.warn(
            "MQTT não conectado."
        );

        return;
    }


    try {

        mqttClient.publish(
            TOPIC_TEMPERATURA,
            String(
                dados.main.temp
            )
        );


        mqttClient.publish(
            TOPIC_UMIDADE,
            String(
                dados.main.humidity
            )
        );


        mqttClient.publish(
            TOPIC_CIDADE_ATUAL,
            String(
                dados.name
            )
        );


        mqttClient.publish(
            TOPIC_CIDADE,
            `${dados.name},${dados.sys.country}`
        );


        console.log(
            "Dados publicados no MQTT."
        );


    } catch (erro) {

        console.error(
            "Erro ao publicar MQTT:",
            erro
        );
    }
}


// ============================================================
// EVENTOS
// ============================================================


// Botão Buscar

if (btnBuscar) {

    btnBuscar.addEventListener(
        "click",
        consultar
    );
}


// Enter

if (cidadeInput) {

    cidadeInput.addEventListener(
        "keydown",
        evento => {

            if (
                evento.key ===
                "Enter"
            ) {

                evento.preventDefault();

                consultar();
            }
        }
    );
}


// Favorito

if (favoriteButton) {

    favoriteButton.addEventListener(
        "click",
        alternarFavorito
    );
}


// Tema

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        alternarTema
    );
}


// Limpar histórico

if (limparHistoricoBtn) {

    limparHistoricoBtn.addEventListener(
        "click",
        limparHistorico
    );
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

function iniciarDashboard() {

    console.log(
        "Dashboard meteorológico iniciado."
    );


    // Criar gráfico imediatamente
    criarGrafico();


    // Histórico
    renderizarHistorico();


    // Favorito
    renderizarFavorito();


    // Tema
    carregarTema();


    // MQTT
    conectarMQTT();


    // Verificar API
    if (!apiEstaConfigurada()) {

        mostrarMensagem(
            "Configure sua chave do OpenWeatherMap no index.html.",
            "error"
        );
    }
}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarDashboard
    );

} else {

    iniciarDashboard();
}