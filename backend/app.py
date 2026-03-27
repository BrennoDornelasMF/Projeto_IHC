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

# ▶️ RODAR SERVIDOR
if __name__ == "__main__":
    app.run(debug=True)