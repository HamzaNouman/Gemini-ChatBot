from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))



while True:
    meassage = input("User: ")

    if meassage.lower() == "exit":
            print("Bot: Goodbye! 👋")
            break

    response = client.models.generate_content(
    model="gemini-2.5-flash-preview-05-20", contents=meassage
     )
    

    print(response.text)