# 🏠 Projeto LarDoceLar

## 🚀 Como rodar o projeto localmente

### 1. Acessar a pasta do backend

```bash
cd Projeto_IHC/backend
```

### 2. Criar ambiente virtual

```bash
python3 -m venv .venv
```

Ativar:

```bash
source .venv/bin/activate
```

### 3. Instalar dependências

```bash
pip install flask flask-cors
```

### 4. Rodar o backend

```bash
python app.py
```

Saída esperada:

```
Running on http://127.0.0.1:5000
```

---

### 5. Rodar o frontend

Abra outro terminal:

```bash
cd Projeto_IHC/frontend
python3 -m http.server 5500
```

---

### 6. Acessar no navegador

```
http://localhost:5500
```

---

## 🧠 Lógica do sistema

### 🏗️ Arquitetura

O sistema é dividido em:

* Frontend (HTML, CSS, JavaScript)
* Backend (Flask)
* Armazenamento (JSON)

Fluxo:

```
Frontend → Backend → JSON
```

---

### 🔌 Comunicação

O frontend usa requisições HTTP:

```javascript
fetch("http://127.0.0.1:5000/casas")
```

---

### 📡 Rotas da API

#### Listar casas

```python
GET /casas
```

#### Criar anúncio

```python
POST /casas
```

#### Deletar anúncio

```python
DELETE /casas/<id>
```

---

### 💾 Armazenamento

Os dados são salvos em:

```
casas.json
```

Exemplo:

```json
[
  {
    "id": 1,
    "titulo": "Casa",
    "imagem": "http://127.0.0.1:5000/uploads/img.jpg"
  }
]
```

---

### 🖼️ Upload de imagem

1. Usuário seleciona imagem
2. Envio via FormData
3. Backend salva em `uploads/`
4. Retorna URL da imagem

---

### 🎨 Renderização dinâmica

O JavaScript monta os elementos na tela:

```javascript
container.innerHTML += `
  <article>
    <img src="${casa.imagem}">
    <h3>${casa.titulo}</h3>
  </article>
`
```

---

### 🔄 Navegação

Links entre páginas usam parâmetros:

```html
<a href="anuncio.html?id=1">
```

Leitura do ID:

```javascript
const id = new URLSearchParams(window.location.search).get("id");
```

---

## 🎯 Resumo geral

* Frontend envia dados com `fetch`
* Backend processa com Flask
* Dados são salvos em JSON
* Imagens ficam no servidor
* Interface é atualizada dinamicamente

---

## ✅ Funcionalidades implementadas

* Criar anúncios
* Listar anúncios
* Ver detalhes
* Excluir anúncios
* Upload de imagem
* Simulação de financiamento
* Tela de Login
* Criação de Usuário

---