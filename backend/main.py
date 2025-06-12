from flask import Flask , request, jsonify
import google.generativeai as genai
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

api_key = os.getenv("GEMINI_API_KEY")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.5-flash-preview-05-20")

@app.route("/chat", methods=["POST"])

def chat():
    data = request.get_json()
    question = data.get("question", "")
    answer = ""
    
    if question:
        
        try:
            response = model.generate_content(question)
            answer = response.text

        except Exception as e:
            answer = f"Error: {e}"

    return jsonify({"answer": answer})

#"start": "react-scripts start", => this for package.json in scripts if any errors happend


if __name__ == "__main__":
    app.run(debug=True)
