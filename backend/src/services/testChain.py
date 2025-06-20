import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_MODEL=os.getenv("GOOGLE_MODEL")


try:
    llm = ChatGoogleGenerativeAI(
    google_api_key=GOOGLE_API_KEY,
    model=GOOGLE_MODEL,
    temperature=0.0,
    )
except Exception as e:
    print(f"Error initializing Google Generative AI: {e}")
    raise e

def test_llm_call() -> str:
    response = llm.invoke("Write a haiku about a random topic.")
    return response.content

if __name__ == "__main__":
    print(test_llm_call())




