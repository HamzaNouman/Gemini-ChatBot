from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import os
import json

app = Flask(__name__)

# --- Initial configuration ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # Levanta um erro se a chave API não for encontrada, impedindo que o app inicie sem ela.
    raise ValueError("GEMINI_API_KEY not found in environment variables. "
                     "Ensure it is in the .env file and you are running the script with `pipenv run`.")

# Configurações de CORS para permitir requisições do frontend (localhost:3000)
# resources={r"/*": {"origins": "*"}} permite requisições de qualquer origem.
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
genai.configure(api_key=api_key)

# --- Here we load and build a system instruction to JSON file ---
def build_system_instruction(instruction_data: dict) -> str:
    """
    Build a complete string of instruction system from the dict in JSON.
    This function processes a dictionary to create a structured system instruction string
    for the generative AI model, including role definition, core rules, and advanced behaviors.
    """
    instruction_parts = []

    if "role_definition" in instruction_data:
        role = instruction_data["role_definition"]
        instruction_parts.append(f"{role.get('purpose', '')}")

    instruction_parts.append("\nIMPORTANT Rules:")
    if "core_rules" in instruction_data:
        # Itera sobre as regras principais, adicionando-as e seus exemplos.
        for key, rule_data in instruction_data["core_rules"].items():
            # Usa len(instruction_parts) para numerar as regras dinamicamente.
            instruction_parts.append(f"{len(instruction_parts)}. {rule_data.get('title', key)}: {rule_data.get('instruction', '')}")
            if "examples" in rule_data and rule_data["examples"]:
                instruction_parts.append("    Examples:")
                for example in rule_data["examples"]:
                    instruction_parts.append(f"    - {example}")

    instruction_parts.append("\nAdvanced Behaviors:")
    if "advanced_behaviors" in instruction_data:
        # Itera sobre os comportamentos avançados.
        for key, rule_data in instruction_data["advanced_behaviors"].items():
            instruction_parts.append(f"{len(instruction_parts)}. {rule_data.get('title', key)}: {rule_data.get('instruction', '')}")

    return "\n".join(instruction_parts)

# Carrega e constrói a instrução do sistema a partir de um arquivo JSON.
# Inclui tratamento de erros para FileNotFoundError, JSONDecodeError e outros.
@app.route("/answer", methods=["POST"])
def answer():
    data = request.get_json()
    answer = data.get("answer", "No answer provided.")
    setId = data.get("setId", "default_set")
    with open(f"data/answers/{setId}.json", "w", encoding="utf-8") as f:
        # Salva a resposta em um arquivo JSON, usando o setId como nome do arquivo.
        json.dump({"answer": answer}, f, ensure_ascii=False, indent=2)
        instruction_json_data = json.load(f)  # Lê o arquivo para garantir que foi salvo corretamente.
    return jsonify({"status": "success", "received": {"answer": answer, "setId": setId}})

try:
    with open("data/system_instruction.json", "r", encoding="utf-8") as f:
        instruction_json_data = json.load(f)
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = build_system_instruction(answer.instruction_json_data)

    if not SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT.strip():
        raise ValueError("System instruction built from JSON is empty.")

except FileNotFoundError:
    print("Error: 'data/system_instruction.json' not found. Please create this file with the system instruction.")
    # Fallback para uma instrução padrão se o arquivo não for encontrado.
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = "You are an AI assistant for Hamza's resume. Please provide relevant information."
except json.JSONDecodeError:
    print("Error: 'data/system_instruction.json' contains invalid JSON.")
    # Fallback se o JSON for inválido.
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = "You are an AI assistant for Hamza's resume. Please provide relevant information."
except Exception as e:
    print(f"Error loading or building system_instruction.json: {e}")
    # Fallback para qualquer outro erro.
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = "You are an AI assistant for Hamza's resume. Please provide relevant information."

# Inicialização do modelo Gemini com a instrução do sistema.
chat_model = genai.GenerativeModel(
    "gemini-1.5-flash-latest",
    system_instruction=SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT
)



# --- Main Endpoint (POST /chat) ---
@app.route("/chat", methods=["POST"])
def chat():
    # Obtém os dados JSON da requisição do frontend.
    data = request.get_json()
    question = data.get("question", "").strip()
    history = data.get("history", []) # O histórico é um array de {role: "user"|"model", parts: [{text: "..."}]}

    if not question:
        # Retorna erro se a pergunta estiver vazia.
        return jsonify({"answer": "Please provide your question."}), 400

    try:
        # ---  Load the curriculo content---
        # Tenta carregar o conteúdo do currículo de um arquivo JSON.
        try:
            with open("data/curriculo.json", "r", encoding="utf-8") as f:
                curriculo_data = json.load(f)
            curriculo_json_string = json.dumps(curriculo_data, indent=2, ensure_ascii=False)

        except FileNotFoundError:
            print("Error: 'data/curriculo.json' not found. Check the path.")
            return jsonify({"answer": "Sorry, Hamza's résumé is not available at the moment. Please try again later."}), 500
        except json.JSONDecodeError:
            print("Error: 'data/curriculo.json' contains invalid JSON.")
            return jsonify({"answer": "Sorry, there's a problem with Hamza's résumé data. Please try again later."}), 500
        except Exception as e:
            print(f"Error reading or processing 'data/curriculo.json': {e}")
            return jsonify({"answer": "An issue occurred while loading Hamza's résumé information. Please try again later."}), 500

        # --- Here we prepare the historic (context) for Gemini---
        gemini_history = []

        if not history: # Se é o início de uma conversa, injeta o currículo como contexto inicial.
            gemini_history.append({
                "role": "user",
                "parts": [{"text": f"Here is the detailed résumé information in JSON format. Use this as your primary knowledge base for all responses about Hamza:\n{curriculo_json_string}"}]
            })
            # Adiciona a pergunta inicial do usuário ao histórico.
            gemini_history.append({"role": "user", "parts": [{"text": question}]})

        else: # Se já tem histórico, adiciona as mensagens anteriores ao contexto do Gemini.
            for msg in history:
                # CORREÇÃO AQUI: msg["parts"] já é um array de objetos {text: "..."}.
                # Precisamos verificar se ele é um array e pegar o conteúdo de texto.
                if isinstance(msg.get("parts"), list) and msg["parts"]:
                    # Assume que há pelo menos um objeto com a chave 'text'
                    content_text = ""
                    for part in msg["parts"]:
                        if isinstance(part, dict) and "text" in part:
                            content_text += part["text"] + " " # Concatena textos se houver múltiplas partes
                    gemini_history.append({"role": msg["role"], "parts": [{"text": content_text.strip()}]})
                else:
                    # Fallback caso a estrutura seja inesperada (e.g., se for apenas uma string)
                    gemini_history.append({"role": msg["role"], "parts": [{"text": str(msg.get("parts", ""))}]})


        # Inicia a sessão de chat com o histórico preparado.
        chat_session = chat_model.start_chat(history=gemini_history)

        # Envia a pergunta atual para o modelo.
        response = chat_session.send_message(question)
        answer = response.text

    except Exception as e:
        print(f"Unexpected error in /chat endpoint: {e}")
        answer = "An internal error occurred while processing your question. Please try again later."
        return jsonify({"answer": answer}), 500

    # Retorna a resposta do modelo como JSON.
    return jsonify({"answer": answer})

# --- Application execution ---
if __name__ == "__main__":
    # Inicia o servidor Flask na porta 5000, acessível de qualquer IP (0.0.0.0).
    # debug=True habilita o modo de depuração (recarregamento automático, mensagens de erro detalhadas).
    app.run(debug=True, host="0.0.0.0", port=5000)