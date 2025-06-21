import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from ..config.llm_config import llm


def test_llm_call() -> str:
    """
    Makes a test call to the LLM and returns the content of the response.
    """
    print(f"Calling model: {llm.model_name}")
    response = llm.invoke("Write a haiku about a random food. Return only the haiku")
    return response.content

if __name__ == "__main__":
    print(test_llm_call())




