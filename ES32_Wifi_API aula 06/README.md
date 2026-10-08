# 🌦️ Dashboard Meteorológico

## 📌 Nome do projeto

**Dashboard Meteorológico**

Projeto desenvolvido para o **Desafio de Melhoria 05.1 — Dashboard Meteorológico**, utilizando dados meteorológicos da API OpenWeatherMap e comunicação MQTT.

---

## 🎯 Objetivo

O objetivo do projeto é desenvolver um dashboard capaz de consultar e apresentar informações meteorológicas de diferentes cidades de forma clara, organizada e responsiva.

O sistema permite visualizar informações como temperatura, umidade, sensação térmica, pressão atmosférica, vento, condição climática e horários do nascer e pôr do sol.

Também foram implementadas funcionalidades adicionais para melhorar a experiência do usuário, como histórico de consultas, cidade favorita, modo claro e escuro, gráfico meteorológico, alertas climáticos e tratamento de erros.

---

## 🛠️ Tecnologias utilizadas

As principais tecnologias utilizadas no desenvolvimento foram:

* **HTML5** — estrutura da aplicação;
* **CSS3** — estilização e responsividade;
* **JavaScript** — lógica da aplicação e integração com a API;
* **OpenWeatherMap API** — fornecimento dos dados meteorológicos;
* **MQTT** — comunicação e publicação dos dados;
* **Chart.js** — criação do gráfico meteorológico;
* **LocalStorage** — armazenamento do histórico, cidade favorita e preferência de tema.

---

## 🚀 Como executar

### 1. Baixar o projeto

Faça o download ou clone o repositório do projeto.

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Abrir o projeto

Abra a pasta do projeto no **Visual Studio Code**.

A estrutura principal deve ser:

```text
dashboard-meteorologico/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

### 3. Configurar a API Key

Antes de executar o projeto, configure a chave da API OpenWeatherMap no arquivo `index.html`.

### 4. Executar

O projeto pode ser executado abrindo o arquivo `index.html` no navegador.

Também é recomendado utilizar a extensão **Live Server** do Visual Studio Code para executar a aplicação localmente.

---

## 🔑 Como configurar a API Key

O projeto utiliza a API **OpenWeatherMap** para obter os dados meteorológicos.

No arquivo `index.html`, localize:

```javascript
const OPENWEATHER_API_KEY = "COLE_SUA_CHAVE_AQUI";
```

Substitua `"COLE_SUA_CHAVE_AQUI"` pela sua chave da OpenWeatherMap:

```javascript
const OPENWEATHER_API_KEY = "SUA_API_KEY";
```

Depois de inserir a chave, salve o arquivo e execute novamente o projeto.

### ⚠️ Segurança

A API Key não deve ser publicada em um repositório público do GitHub.

Antes de publicar o código, substitua a chave real por:

```javascript
const OPENWEATHER_API_KEY = "COLE_SUA_CHAVE_AQUI";
```

---

## 📡 Como funciona o MQTT

O projeto utiliza o protocolo **MQTT** para realizar a comunicação e publicação de informações meteorológicas.

Foi utilizado o broker público:

```text
broker.hivemq.com
```

A conexão utilizada pelo dashboard é feita através de WebSocket seguro:

```text
wss://broker.hivemq.com:8884/mqtt
```

O sistema publica informações nos seguintes tópicos:

```text
esp32/clima/temperatura
esp32/clima/umidade
esp32/clima/cidadeAtual
esp32/clima/cidade
```

Quando uma cidade é consultada, o JavaScript obtém os dados da OpenWeatherMap e publica algumas dessas informações através do MQTT.

O dashboard também apresenta na interface o **status da conexão MQTT**, permitindo verificar se a comunicação está conectada ou não.

---

# ⚙️ Funcionalidades implementadas

O projeto possui as seguintes funcionalidades:

### 🔎 Consulta de cidades

Permite pesquisar uma cidade informando também o país.

A consulta pode ser realizada através do botão de pesquisa ou pressionando a tecla **Enter**.

### 🌡️ Informações meteorológicas

São apresentados diversos dados obtidos através da API:

* Temperatura atual;
* Temperatura mínima;
* Temperatura máxima;
* Sensação térmica;
* Umidade;
* Pressão atmosférica;
* Velocidade do vento;
* Direção do vento;
* Condição climática;
* Descrição do clima;
* Horário do nascer do sol;
* Horário do pôr do sol.

### 📊 Gráfico meteorológico

Foi implementado um gráfico utilizando **Chart.js** para apresentar os dados de temperatura e umidade.

O gráfico é atualizado conforme novas consultas são realizadas.

### 📡 Status MQTT

O sistema apresenta o estado da conexão MQTT e realiza a publicação dos dados meteorológicos.

### 🗂️ Histórico

As cidades consultadas são armazenadas no histórico utilizando `localStorage`.

### ⭐ Cidade favorita

O usuário pode salvar uma cidade como favorita para facilitar uma nova consulta.

### 🌙 Modo claro e escuro

O usuário pode alternar entre o modo claro e o modo escuro.

A preferência é armazenada no navegador.

### 🚨 Alerta climático

Foi implementada uma funcionalidade adicional de alerta climático.

O sistema analisa algumas condições meteorológicas e apresenta mensagens de atenção ao usuário, como situações de temperatura elevada, chuva ou vento forte.

Essa funcionalidade pode auxiliar na tomada de decisões relacionadas a atividades externas e planejamento operacional.

### ⏳ Indicador de carregamento

Durante a consulta dos dados meteorológicos, o sistema apresenta um indicador de carregamento para informar que a requisição está sendo processada.

### ⚠️ Tratamento de erros

O sistema apresenta mensagens para situações como:

* Campo de cidade vazio;
* Cidade não encontrada;
* API Key inválida;
* Erro de conexão;
* Problemas na requisição da API.

### 📱 Responsividade

A interface foi desenvolvida para funcionar em:

* Computadores;
* Notebooks;
* Tablets;
* Smartphones.

### ♿ Acessibilidade

Foram implementadas melhorias de acessibilidade, incluindo:

* Identificação dos campos através de labels;
* Navegação utilizando teclado;
* Indicadores de foco;
* Uso de elementos semânticos;
* Recursos `aria` para informações atualizadas dinamicamente.

---

# 🔧 Melhorias realizadas

O projeto original foi aprimorado com diversas modificações.

### 🎨 Interface

Foi desenvolvido um novo layout com:

* Cabeçalho;
* Área de pesquisa;
* Cards meteorológicos;
* Área de gráfico;
* Área de MQTT;
* Histórico;
* Favorito;
* Rodapé;
* Modo claro e escuro.

### 🌦️ Dados meteorológicos

Foram adicionadas novas informações provenientes da API, incluindo:

* Sensação térmica;
* Temperatura mínima e máxima;
* Pressão atmosférica;
* Velocidade e direção do vento;
* Condição e descrição do clima;
* Nascer e pôr do sol.

### 📈 Gráfico

O gráfico foi aprimorado utilizando Chart.js, com:

* Título;
* Legenda;
* Eixos identificados;
* Temperatura;
* Umidade;
* Atualização conforme as consultas.

### 👤 Experiência do usuário

Foram adicionados:

* Histórico de pesquisas;
* Cidade favorita;
* Modo claro e escuro;
* Indicador de carregamento;
* Mensagens de erro;
* Pesquisa utilizando Enter;
* Data e horário da última atualização.

### 📱 Responsividade e acessibilidade

A interface foi adaptada para diferentes tamanhos de tela e recebeu melhorias para facilitar a utilização por teclado e tecnologias assistivas.

### 🚨 Nova funcionalidade

Como funcionalidade original, foi desenvolvido um **sistema de alerta climático**, que utiliza os dados meteorológicos para identificar condições que podem exigir atenção.

Essa funcionalidade também apresenta uma aplicação prática no ambiente empresarial, podendo auxiliar no planejamento de atividades externas, transporte, eventos e outras operações influenciadas pelas condições climáticas.