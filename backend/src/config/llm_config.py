import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "mistralai/mistral-7b-instruct:free")

def get_llm():
    """
    Initializes and returns the language model instance.
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not set in the environment variables.")

    try:
        llm = ChatOpenAI(
            model=OPENROUTER_MODEL,
            api_key=OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
            temperature=0.0,
        )
        return llm
    except Exception as e:
        print(f"Error initializing the LLM: {e}")
        raise e

# if __name__ == "__main__":
#     print("Attempting to initialize LLM...")
#     llm_instance = get_llm()
#     print("LLM Initialized successfully!")
#     print(f"Model: {llm_instance.model_name}")
#     print("Testing LLM call...")
#     response = llm_instance.invoke("Say hello.")
#     print(f"Response: {response.content}") 