from flask import Flask, request, jsonify
import google.generativeai as genai
from flask_cors import CORS
import os
import json

app = Flask(__name__)

# --- Initial configuration ---
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables. "
                     "Ensure it is in the .env file and you are running the script with `pipenv run`.")

CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
genai.configure(api_key=api_key)

# --- Here we load and build a system instruction to JSON file ---
def build_system_instruction(instruction_data: dict) -> str:
    """
    
    Build a complete string of instruction system from the dict in JSON
    """
    instruction_parts = [] # <-- This little thing here 

    if "role_definition" in instruction_data:
        role = instruction_data["role_definition"]
        instruction_parts.append(f"{role.get('purpose', '')}")

    instruction_parts.append("\nIMPORTANT Rules:")
    if "core_rules" in instruction_data:
        for key, rule_data in instruction_data["core_rules"].items():
            instruction_parts.append(f"{len(instruction_parts)}. {rule_data.get('title', key)}: {rule_data.get('instruction', '')}")
            if "examples" in rule_data and rule_data["examples"]:
                instruction_parts.append("    Examples:")
                for example in rule_data["examples"]:
                    instruction_parts.append(f"    - {example}")

    instruction_parts.append("\nAdvanced Behaviors:")
    if "advanced_behaviors" in instruction_data:
        for key, rule_data in instruction_data["advanced_behaviors"].items():
            instruction_parts.append(f"{len(instruction_parts)}. {rule_data.get('title', key)}: {rule_data.get('instruction', '')}")

    return "\n".join(instruction_parts)

try: 
    with open("data/system_instruction.json", "r", encoding="utf-8") as f: 
        instruction_json_data = json.load(f)
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = build_system_instruction(instruction_json_data)

    if not SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT.strip():
        raise ValueError("System instruction built from JSON is empty.")

except FileNotFoundError: 
    print("Error: 'data/system_instruction.json' not found. Please create this file with the system instruction.")
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = "You are an AI assistant for Hamza's resume. Please provide relevant information."
except json.JSONDecodeError: 
    print("Error: 'data/system_instruction.json' contains invalid JSON.")
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = "You are an AI assistant for Hamza's resume. Please provide relevant information."
except Exception as e: 
    print(f"Error loading or building system_instruction.json: {e}")
    SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT = "You are an AI assistant for Hamza's resume. Please provide relevant information."

# Initialization with the model instrutions
chat_model = genai.GenerativeModel(
    "gemini-1.5-flash-latest", 
    system_instruction=SYSTEM_INSTRUCTION_FOR_HAMZA_CHATBOT
)

# --- Main Endpoint (POST /chat) ---
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("question", "").strip()
    history = data.get("history", [])

    if not question:
        return jsonify({"answer": "Please provide your question."}), 400

    try:
        # ---  Load the curriculo content---
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

        # --- Here we preprae the historic (context) for Gemini---
        gemini_history = []
        
        if not history: #  Is is the beginning of a conversation, injexts the curriculo as initial context
            gemini_history.append({
                "role": "user",
                "parts": [{"text": f"Here is the detailed résumé information in JSON format. Use this as your primary knowledge base for all responses about Hamza:\n{curriculo_json_string}"}]
            })
            
            gemini_history.append({"role": "user", "parts": [{"text": question}]})

        else: #  But if it already has historic (context), just add the previous message to the historic context 
            for msg in history:
                gemini_history.append({"role": msg["role"], "parts": [{"text": msg["parts"]}]})
            
        chat_session = chat_model.start_chat(history=gemini_history)

        response = chat_session.send_message(question) # here just asnwers, without the curriculo attached
        answer = response.text

    except Exception as e:
        print(f"Unexpected error in /chat endpoint: {e}")
        answer = "An internal error occurred while processing your question. Please try again later."
        return jsonify({"answer": answer}), 500

    return jsonify({"answer": answer})

# --- Aplication execution ---
if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0", port=5000)