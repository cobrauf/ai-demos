import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# You can set your preferred model in the .env file, or it will default here.
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct:free")


try:
    llm = ChatOpenAI(
        model=OPENROUTER_MODEL,
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1",
        temperature=0.0,
    )
except Exception as e:
    print(f"Error initializing the LLM: {e}")
    raise e

def test_llm_call() -> str:
    print(f"calling model: {OPENROUTER_MODEL}")
    response = llm.invoke("Write a haiku about a random food. Return only the haiku")
    return response.content

if __name__ == "__main__":
    print(test_llm_call())




