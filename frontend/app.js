document.addEventListener("DOMContentLoaded", () => {
  inicializarPaginaInicial();
  inicializarCriarAnuncio();
  inicializarDetalheAnuncio();
  inicializarMeusAnuncios();
  inicializarSimuladorFinanciamento();
  inicializarLogin();
  inicializarCriarUsuario();
  inicializarDetalheAnuncio();
  inicializarLogout();
});

function converterParaNumero(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;

  let normalizado = String(valor)
    .trim()
    .replace(/[^\d,.-]/g, "");

  if (normalizado.includes(",") && normalizado.includes(".")) {
    if (normalizado.lastIndexOf(",") > normalizado.lastIndexOf(".")) {
      normalizado = normalizado.replace(/\./g, "").replace(",", ".");
    } else {
      normalizado = normalizado.replace(/,/g, "");
    }
  } else if (normalizado.includes(",")) {
    normalizado = normalizado.replace(",", ".");
  }

  const numero = parseFloat(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function mostrarMensagemTemporaria(texto) {
  const mensagem = document.createElement("div");
  mensagem.className = "mensagem-flutuante";
  mensagem.setAttribute("role", "status");
  mensagem.setAttribute("aria-live", "polite");
  mensagem.textContent = texto;

  document.body.appendChild(mensagem);

  window.setTimeout(() => {
    mensagem.classList.add("saindo");
  }, 1000);

  window.setTimeout(() => {
    mensagem.remove();
  }, 1400);
}

async function inicializarPaginaInicial() {
  const container = document.getElementById("lista-casas");
  if (!container) return;

  const grupoCasas = document.getElementById("grupo-casas");
  const grupoApartamentos = document.getElementById("grupo-apartamentos");
  const grupoFlat = document.getElementById("grupo-flat");

  const res = await fetch("http://127.0.0.1:5000/casas");
  const casas = await res.json();

  container.innerHTML = "";
  grupoCasas.innerHTML = "";
  grupoApartamentos.innerHTML = "";
  grupoFlat.innerHTML = "";

  casas.forEach((casa) => {
    const card = `
      <article>
          <img src="${casa.imagem}" onerror="this.src='https://via.placeholder.com/300'">
          <h3>${casa.titulo}</h3>
          <p>${casa.localizacao}</p>
          <p>R$ ${casa.preco}</p>
          <a href="anuncio.html?id=${casa.id}">Ver detalhes</a>
      </article>
    `;

    const cardGrupo = card.replace(
      "<article>",
      '<article class="card-sequencia">',
    );

    container.innerHTML += card;

    const texto = `${casa.titulo} ${casa.descricao || ""}`.toLowerCase();
    if (texto.includes("apart")) {
      grupoApartamentos.innerHTML += cardGrupo;
    } else if (texto.includes("flat")) {
      grupoFlat.innerHTML += cardGrupo;
    } else {
      grupoCasas.innerHTML += cardGrupo;
    }
  });

  document.querySelectorAll(".seta").forEach((seta) => {
    seta.onclick = () => {
      const trilho = document.getElementById(seta.dataset.target);
      if (!trilho) return;
      const direcao = seta.dataset.dir === "right" ? 1 : -1;
      trilho.scrollBy({
        left: direcao * Math.round(trilho.clientWidth * 0.85),
        behavior: "smooth",
      });
    };
  });

  document.querySelectorAll(".trilho-sequencia").forEach((trilho) => {
    const setaEsquerda = document.querySelector(
      `.seta[data-target="${trilho.id}"][data-dir="left"]`,
    );
    const setaDireita = document.querySelector(
      `.seta[data-target="${trilho.id}"][data-dir="right"]`,
    );

    if (!setaEsquerda || !setaDireita) return;

    const atualizarSetas = () => {
      const limite = trilho.scrollWidth - trilho.clientWidth;
      const semScroll = limite <= 1;

      setaEsquerda.disabled = semScroll || trilho.scrollLeft <= 1;
      setaDireita.disabled = semScroll || trilho.scrollLeft >= limite - 1;
    };

    atualizarSetas();
    trilho.addEventListener("scroll", atualizarSetas);
    window.addEventListener("resize", atualizarSetas);
  });
}

function inicializarCriarAnuncio() {
  const form = document.querySelector(".form-anuncio");
  if (!form) return;

  const botaoPublicar = form.querySelector('button[type="submit"]');
  const camposObrigatorios = form.querySelectorAll("[required]");

  const atualizarEstadoBotao = () => {
    const formularioValido = Array.from(camposObrigatorios).every(
      (campo) => campo.value.trim() !== "",
    );
    botaoPublicar.disabled = !formularioValido;
  };

  camposObrigatorios.forEach((campo) => {
    campo.addEventListener("input", atualizarEstadoBotao);
  });

  atualizarEstadoBotao();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const localizacao = document.getElementById("localizacao").value;
    const preco = document.getElementById("preco").value;
    const descricao = document.getElementById("descricao").value;
    const imagemInput = document.getElementById("imagem");

    const formData = new FormData();

    formData.append("titulo", titulo);
    formData.append("localizacao", localizacao);
    formData.append("preco", preco);
    formData.append("descricao", descricao);

    if (imagemInput.files.length > 0) {
      formData.append("imagem", imagemInput.files[0]);
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/casas", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro no servidor");
      }

      alert("Anúncio criado com sucesso!");
      window.location.href = "meus-anuncios.html";
    } catch (erro) {
      console.error("ERRO:", erro);
      alert("Erro ao enviar anúncio. Veja o console (F12).");
    }
  });
}

async function inicializarDetalheAnuncio() {
  const img = document.getElementById("img");
  if (!img) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const res = await fetch("http://127.0.0.1:5000/casas");
  const casas = await res.json();

  const casa = casas.find((c) => c.id == id);
  if (!casa) return;

  document.getElementById("img").src = casa.imagem;
  document.getElementById("titulo").innerText = casa.titulo;
  document.getElementById("local").innerText = casa.localizacao;
  document.getElementById("preco").innerText = "R$ " + casa.preco;
  document.getElementById("desc").innerText = casa.descricao;

  const botaoComprar = document.querySelector(".botao-comprar");
  if (!botaoComprar) return;

  botaoComprar.addEventListener("click", () => {
    const precoNumerico = converterParaNumero(casa.preco);
    const params = new URLSearchParams({
      id: String(casa.id),
      titulo: casa.titulo,
      preco: String(precoNumerico),
    });
    window.location.href = `financiamento.html?${params.toString()}`;
  });
}

function inicializarSimuladorFinanciamento() {
  const form = document.getElementById("form-financiamento");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const titulo = params.get("titulo");

  const infoImovel = document.getElementById("financiamento-imovel");
  const precoInput = document.getElementById("preco-imovel");
  const entradaInput = document.getElementById("entrada");
  const prazoInput = document.getElementById("prazo");
  const taxaInput = document.getElementById("taxa");

  const cardResultado = document.getElementById("resultado-financiamento");
  const valorFinanciado = document.getElementById("valor-financiado");
  const parcelaMensal = document.getElementById("parcela-mensal");
  const totalPago = document.getElementById("total-pago");
  const totalJuros = document.getElementById("total-juros");

  if (titulo && infoImovel) {
    infoImovel.textContent = `Imóvel selecionado: ${titulo}`;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const preco = converterParaNumero(precoInput.value);
    const entrada = converterParaNumero(entradaInput.value);
    const prazo = Math.max(parseInt(prazoInput.value, 10) || 0, 1);
    const taxaMensal = converterParaNumero(taxaInput.value) / 100;

    const valorBase = Math.max(preco - entrada, 0);
    let parcela = 0;

    if (taxaMensal === 0) {
      parcela = valorBase / prazo;
    } else {
      const fator = Math.pow(1 + taxaMensal, prazo);
      parcela = valorBase * ((taxaMensal * fator) / (fator - 1));
    }

    const total = parcela * prazo;
    const juros = total - valorBase;

    valorFinanciado.textContent = formatarMoeda(valorBase);
    parcelaMensal.textContent = formatarMoeda(parcela);
    totalPago.textContent = formatarMoeda(total);
    totalJuros.textContent = formatarMoeda(juros);
    cardResultado.classList.remove("oculto");
  });
}

async function inicializarMeusAnuncios() {
  const container = document.getElementById("lista");
  const modal = document.getElementById("modal-confirmacao");
  if (!container || !modal) return;

  const botaoCancelar = document.getElementById("cancelar-remocao");
  const botaoConfirmar = document.getElementById("confirmar-remocao");
  let idParaRemover = null;

  async function carregar() {
    const res = await fetch("http://127.0.0.1:5000/casas");
    const casas = await res.json();

    container.innerHTML = "";

    casas.forEach((casa) => {
      container.innerHTML += `
        <article>
            <img src="${casa.imagem}" onerror="this.src='https://via.placeholder.com/300'">
            <h3>${casa.titulo}</h3>
            <p>${casa.localizacao}</p>
            <p>R$ ${casa.preco}</p>

            <div class="botoes-anuncio">
              <button class="botao-detalhes" data-acao="detalhes" data-id="${casa.id}">Mais detalhes</button>
              <button class="botao-remover" data-acao="remover" data-id="${casa.id}">Remover anúncio</button>
            </div>
        </article>
      `;
    });
  }

  function abrirModal(id) {
    idParaRemover = id;
    modal.classList.remove("oculto");
  }

  function fecharModal() {
    idParaRemover = null;
    modal.classList.add("oculto");
  }

  async function confirmarRemocao() {
    if (idParaRemover === null) return;

    const res = await fetch(`http://127.0.0.1:5000/casas/${idParaRemover}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Erro ao remover anúncio. Tente novamente.");
      return;
    }

    fecharModal();
    mostrarMensagemTemporaria("Anúncio removido com sucesso!");
    carregar();
  }

  container.addEventListener("click", (e) => {
    const botao = e.target.closest("button[data-acao]");
    if (!botao) return;

    const id = botao.dataset.id;
    if (botao.dataset.acao === "detalhes") {
      window.location.href = `anuncio.html?id=${id}`;
      return;
    }

    if (botao.dataset.acao === "remover") {
      abrirModal(id);
    }
  });

  botaoCancelar.addEventListener("click", fecharModal);
  botaoConfirmar.addEventListener("click", confirmarRemocao);

  modal.addEventListener("click", (e) => {
    if (e.target.id === "modal-confirmacao") {
      fecharModal();
    }
  });

  carregar();
}
function inicializarLogin() {
  const form = document.getElementById("form-login");
  if (!form) return;

  const email = document.getElementById("login-email");
  const senha = document.getElementById("login-senha");
  const estado = document.getElementById("estado-login");
  const botao = form.querySelector("button");

  // Verifica se usuário já está logado
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (usuarioLogado) {
    estado.style.color = "green";
    estado.textContent = "Você já está logado!";
    botao.disabled = true;
    botao.innerHTML = "✔ Logado";

    // Se houver botão de logout, mostra e habilita
    const btnLogout = document.getElementById("logout-btn");
    if (btnLogout) btnLogout.style.display = "inline-block";

    return; // não precisa mais logar
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    estado.textContent = "";
    botao.disabled = true;
    botao.innerHTML = `<span class="spinner"></span> Entrando...`;

    if (!email.value.trim() || !senha.value.trim()) {
      botao.disabled = false;
      botao.innerHTML = "Entrar";
      estado.style.color = "red";
      estado.textContent = "Preencha todos os campos.";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.value, senha: senha.value })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "E-mail ou senha incorretos.");

      // Salva no localStorage
      localStorage.setItem("usuarioLogado", JSON.stringify({ email: email.value }));

      estado.style.color = "green";
      estado.textContent = data.msg;
      botao.innerHTML = "✔ Sucesso!";

      // Mostra botão de logout
      const btnLogout = document.getElementById("logout-btn");
      if (btnLogout) btnLogout.style.display = "inline-block";

      const params = new URLSearchParams(window.location.search);
      if (params.has("titulo")) {
        setTimeout(() => window.location.href = `financiamento.html?${params.toString()}`, 1200);
      } else {
        setTimeout(() => window.location.href = "index.html", 1200);
      }

    } catch (erro) {
      estado.style.color = "red";
      estado.textContent = erro.message;
      botao.disabled = false;
      botao.innerHTML = "Entrar";
    }
  });
}

// Função de logout
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}
// Função de logout
function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// Inicializa o botão de logout, se existir
function inicializarLogout() {
  const btnLogout = document.getElementById("logout-btn");
  if (!btnLogout) return;

  // Mostra botão somente se usuário estiver logado
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  btnLogout.style.display = usuarioLogado ? "inline-block" : "none";

  btnLogout.addEventListener("click", logout);
}

function inicializarCriarUsuario() {
  const form = document.getElementById("form-criar-usuario");
  if (!form) return;

  const nome = document.getElementById("nome");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirmar = document.getElementById("confirmar");
  const estado = document.getElementById("estado-register");
  const botao = form.querySelector("button");

  form.addEventListener("submit", async (e) => { // <-- async adicionado
    e.preventDefault();

    estado.textContent = "";
    botao.disabled = true;
    botao.innerHTML = `<span class="spinner"></span> Criando conta...`;

    if (
      !nome.value.trim() ||
      !email.value.trim() ||
      !senha.value.trim() ||
      !confirmar.value.trim()
    ) {
      estado.style.color = "red";
      estado.textContent = "Preencha todos os campos.";
      botao.disabled = false;
      botao.innerHTML = "Criar Conta";
      return;
    }

    if (senha.value !== confirmar.value) {
      estado.style.color = "red";
      estado.textContent = "As senhas não coincidem.";
      botao.disabled = false;
      botao.innerHTML = "Criar Conta";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/criar-usuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.value,
          email: email.value,
          senha: senha.value
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Erro ao criar usuário");

      estado.style.color = "green";
      estado.textContent = data.msg;
      botao.innerHTML = "✔ Sucesso!";

      setTimeout(() => window.location.href = "login.html", 1500);

    } catch (erro) {
      estado.style.color = "red";
      estado.textContent = erro.message;
      botao.disabled = false;
      botao.innerHTML = "Criar Conta";
    }
  });
}
async function inicializarDetalheAnuncio() {
  const img = document.getElementById("img");
  if (!img) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const res = await fetch("http://127.0.0.1:5000/casas");
  const casas = await res.json();

  const casa = casas.find((c) => c.id == id);
  if (!casa) return;

  document.getElementById("img").src = casa.imagem;
  document.getElementById("titulo").innerText = casa.titulo;
  document.getElementById("local").innerText = casa.localizacao;
  document.getElementById("preco").innerText = "R$ " + casa.preco;
  document.getElementById("desc").innerText = casa.descricao;

  const botaoComprar = document.querySelector(".botao-comprar");
  if (!botaoComprar) return;

  botaoComprar.addEventListener("click", () => {
    const usuarioLogado = localStorage.getItem("usuarioLogado");

    if (!usuarioLogado) {
      // Se não estiver logado, redireciona para login e mantém dados do imóvel
      const loginParams = new URLSearchParams({
        redirect: "financiamento.html",
        id: casa.id,
        titulo: casa.titulo,
        preco: casa.preco
      });
      window.location.href = `login.html?${loginParams.toString()}`;
      return;
    }

    // Se estiver logado, vai direto para financiamento
    const precoNumerico = converterParaNumero(casa.preco);
    const financiamentoParams = new URLSearchParams({
      id: casa.id,
      titulo: casa.titulo,
      preco: precoNumerico
    });
    window.location.href = `financiamento.html?${financiamentoParams.toString()}`;
  });
}