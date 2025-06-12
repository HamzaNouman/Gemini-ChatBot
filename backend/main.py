# backend/main.py

from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import os
# import random # Não é mais necessário, pois o Gemini vai variar a resposta

app = Flask(__name__)

# --- Configuração Inicial ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY não encontrada nas variáveis de ambiente. "
                     "Certifique-se de que está no arquivo .env "
                     "e que você está executando o script com `pipenv run`.")

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
genai.configure(api_key=api_key)

# --- INSTRUÇÃO DE SISTEMA REFORÇADA PARA O CHAT_MODEL ---
# Esta instrução agora lida com tudo: o papel, o escopo, a variação e o IDIOMA.
SYSTEM_INSTRUCTION_FOR_LUCAS_CHATBOT = """
Você é um assistente de IA projetado exclusivamente para atuar como o currículo interativo do Lucas.
Sua única função é fornecer informações detalhadas e variadas sobre a trajetória profissional,
habilidades técnicas e interpessoais, formação acadêmica, projetos desenvolvidos e objetivos de carreira do Lucas.

Regras IMPORTANTES:
1.  **Idioma da Resposta**: Detecte o idioma da pergunta do usuário e responda NO MESMO IDIOMA. Por exemplo, se a pergunta for em inglês, responda em inglês; se for em português, responda em português.
2.  **Escopo Estrito**: Responda APENAS a perguntas que sejam DIRETAMENTE sobre o Lucas (seus atributos profissionais, experiência, habilidades, etc.). Não responda a perguntas gerais, sobre outros tópicos, ou perguntas pessoais que não sejam relevantes para um currículo.
3.  **Recusa Clara e Variada (Multilíngue)**: Se uma pergunta estiver FORA do escopo definido (não for sobre o Lucas ou seus atributos profissionais), recuse-se educadamente a responder. Varie sua frase de recusa a cada vez e certifique-se de que ela esteja no IDIOMA DETECTADO da pergunta do usuário.
    Exemplos de recusa (apenas para ilustrar, você deve gerar variações):
    - Português: "Desculpe, meu conhecimento é restrito a informações sobre o Lucas. Por favor, faça uma pergunta sobre ele."
    - English: "Sorry, my knowledge is limited to information about Lucas. Please ask a question about him."
    - Spanish: "Lo siento, mi conocimiento se limita a la información sobre Lucas. Por favor, haga una pregunta sobre él."
4.  **Variação de Respostas para o Escopo**: Para perguntas DENTRO do escopo, varie suas respostas. Não use sempre a mesma frase ou estrutura. Reformule as informações usando sinônimos, diferentes construções de frase e abordagens, sempre no idioma da pergunta.
5.  **Linguagem Profissional**: Mantenha um tom profissional, claro e objetivo em todas as respostas.
6.  **Não Invente**: Se você não tiver a informação específica sobre o Lucas em seu currículo, diga que não sabe ou peça para a pergunta ser mais específica, no idioma adequado.
"""

chat_model = genai.GenerativeModel(
    "gemini-1.5-flash-latest",
    system_instruction=SYSTEM_INSTRUCTION_FOR_LUCAS_CHATBOT
)

# --- REMOVIDOS: scope_validation_model e CHATBOT_SCOPE e OUT_OF_SCOPE_RESPONSES
# A lógica de validação de escopo e variação de recusa será feita pelo chat_model.
# Você não precisa mais do scope_validation_model nem das listas CHATBOT_SCOPE e OUT_OF_SCOPE_RESPONSES aqui.

# --- Main Endpoint (POST /chat) ---
@app.route("/chat", methods=["POST"])
def chat():
    # 1. Recebe a pergunta do usuário.
    data = request.get_json()
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"answer": "Por favor, digite sua pergunta."}), 400

    # 2. Implementa o tratamento de erros e exceções para o endpoint.
    try:
        # --- Importante: Carregar e Injetar o conteúdo do currículo ---
        # Certifique-se de que 'lucas_curriculum.md' está na mesma pasta que main.py
        try:
            with open("lucas_curriculum.md", "r", encoding="utf-8") as f:
                lucas_curriculum_data = f.read()
        except FileNotFoundError:
            print("Erro: Arquivo 'lucas_curriculum.md' não encontrado. Crie este arquivo com as informações do currículo do Lucas.")
            # Resposta de erro para o usuário, no idioma padrão (Português, neste caso)
            return jsonify({"answer": "Desculpe, o currículo do Lucas não está disponível no momento. Por favor, tente novamente mais tarde."}), 500
        except Exception as e:
            print(f"Erro ao ler 'lucas_curriculum.md': {e}")
            # Resposta de erro para o usuário, no idioma padrão (Português, neste caso)
            return jsonify({"answer": "Ocorreu um problema ao carregar as informações do Lucas. Por favor, tente novamente mais tarde."}), 500

        # Combina a instrução de sistema (já configurada no modelo) com o contexto do currículo e a pergunta do usuário.
        # O modelo usará este contexto para responder a perguntas, e sua SYSTEM_INSTRUCTION
        # para lidar com o idioma, variação e recusa de escopo.
        combined_question = f"Contexto sobre Lucas:\n{lucas_curriculum_data}\n\nPergunta do recrutador: {question}"

        # 3. Chama a Gemini API.
        response = chat_model.generate_content(combined_question)
        answer = response.text

        # 4. A validação/filtragem pós-Gemini não precisa mais de um cheque de frases fixas.
        # O modelo, por sua system_instruction, é quem decide se a pergunta está fora de escopo e gera a recusa adequada.
        # Se o modelo está bem instruído, ele fará o trabalho de recusa e variação no idioma correto.
        # Não precisamos mais do: if any(phrase in answer for phrase in OUT_OF_SCOPE_RESPONSES):

    except Exception as e:
        print(f"Erro inesperado no endpoint /chat: {e}")
        # Resposta de erro para o usuário, no idioma padrão (Português, neste caso)
        answer = "Ocorreu um erro interno ao processar sua pergunta. Por favor, tente novamente mais tarde."
        return jsonify({"answer": answer}), 500

    # 5. Retorna a resposta final formatada para o frontend.
    return jsonify({"answer": answer})

# --- Execução da Aplicação ---
if __name__ == "__main__":
    app.run(debug=True, port=5000)