from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# 📁 Pasta de upload
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 📄 Arquivo JSON
ARQUIVO = "casas.json"

# 📥 Carregar dados
def carregar():
    if not os.path.exists(ARQUIVO):
        return []
    with open(ARQUIVO, "r") as f:
        return json.load(f)

# 💾 Salvar dados
def salvar(dados):
    with open(ARQUIVO, "w") as f:
        json.dump(dados, f, indent=4)

# 🖼️ SERVIR IMAGENS (CORREÇÃO PRINCIPAL)
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# 📋 LISTAR CASAS
@app.route("/casas", methods=["GET"])
def listar():
    return jsonify(carregar())

# ➕ CRIAR CASA (COM IMAGEM)
@app.route("/casas", methods=["POST"])
def criar():
    dados = carregar()

    titulo = request.form.get("titulo")
    localizacao = request.form.get("localizacao")
    preco = request.form.get("preco")
    descricao = request.form.get("descricao")

    imagem = request.files.get("imagem")

    nome_arquivo = ""
    if imagem:
        nome_arquivo = secure_filename(imagem.filename)
        caminho = os.path.join(UPLOAD_FOLDER, nome_arquivo)
        imagem.save(caminho)

    nova = {
        "id": max([c["id"] for c in dados], default=0) + 1,
        "titulo": titulo,
        "localizacao": localizacao,
        "preco": preco,
        "descricao": descricao,
        "imagem": f"http://127.0.0.1:5000/uploads/{nome_arquivo}" if nome_arquivo else ""
    }

    dados.append(nova)
    salvar(dados)

    return jsonify(nova)

# ❌ DELETAR CASA
@app.route("/casas/<int:id>", methods=["DELETE"])
def deletar(id):
    dados = carregar()
    dados = [c for c in dados if c["id"] != id]
    salvar(dados)
    return jsonify({"msg": "ok"})

# =============================
# 📌 SISTEMA DE USUÁRIOS
# =============================

USUARIOS_ARQUIVO = "usuarios.json"

# Carregar usuários
def carregar_usuarios():
    if not os.path.exists(USUARIOS_ARQUIVO):
        return []
    with open(USUARIOS_ARQUIVO, "r") as f:
        return json.load(f)

# Salvar usuários
def salvar_usuarios(dados):
    with open(USUARIOS_ARQUIVO, "w") as f:
        json.dump(dados, f, indent=4)


# =============================
# 🔐 LOGIN
# =============================
@app.route("/login", methods=["POST"])
def login():
    usuarios = carregar_usuarios()
    body = request.json

    email = body.get("email")
    senha = body.get("senha")

    # procura o usuário
    for u in usuarios:
        if u["email"] == email and u["senha"] == senha:
            return jsonify({"status": "ok", "msg": "Login realizado!"}), 200

    return jsonify({"status": "erro", "msg": "Usuário não encontrado!"}), 401


# =============================
# ➕ CRIAR USUÁRIO
# =============================            
@app.route("/criar-usuario", methods=["POST"])
def criar_usuario():
    usuarios = carregar_usuarios()
    body = request.json

    nome = body.get("nome")
    email = body.get("email")
    senha = body.get("senha")

    # verifica se já existe
    for u in usuarios:
        if u["email"] == email:
            return jsonify({"status": "erro", "msg": "E-mail já cadastrado!"}), 400

    novo = {
        "id": max([u["id"] for u in usuarios], default=0) + 1,
        "nome": nome,
        "email": email,
        "senha": senha
    }

    usuarios.append(novo)
    salvar_usuarios(usuarios)

    return jsonify({"status": "ok", "msg": "Usuário criado!"}), 200

# ▶️ RODAR SERVIDOR
if __name__ == "__main__":
    app.run(debug=True)