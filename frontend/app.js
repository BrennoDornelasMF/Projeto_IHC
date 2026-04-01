document.addEventListener("DOMContentLoaded", () => {
  inicializarPaginaInicial();
  inicializarCriarAnuncio();
  inicializarDetalheAnuncio();
  inicializarMeusAnuncios();
});

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

    await fetch(`http://127.0.0.1:5000/casas/${idParaRemover}`, {
      method: "DELETE",
    });

    fecharModal();
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
