import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import logging
from src.config.llm_config import llm
from typing import Annotated, TypedDict, Sequence 
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode



logger = logging.getLogger(__name__)

#for general chat ---------------------
def general_chat(chat_message: list[HumanMessage]) -> str:
    system_message = SystemMessage(content='''
    You are a helpful assistant. Respond in concise and friendly matter, no more than 100 words.
    ''')
 
    logger.info(f"--- general chat ---")
    logger.info(f"chat_message: {chat_message}")
    prompt = [system_message] + chat_message
    response = llm.invoke(prompt)
    logger.info(f"--- response.content ---") 
    logger.info(f"response.content: {response.content}")
    return response.content
#-------------------------------------


class AgentState(TypedDict):
    session_id: str
    mystery_item: str | None = None
    guess: str | None = None
    guess_correct: str | None = None
    question_count: int = 0
    guess_count: int = 0
    message_history: Annotated[Sequence[BaseMessage], add_messages]
    
@tool
def generate_mystery_item(state: AgentState) -> AgentState:
    '''Generate a mystery item for a guess-the-thing game.'''
    
    system_message = SystemMessage(content='''
    You are a helpful assistant, your only job is to generate a mystery "answer" for a guess-the-thing game. 
    Choose from the following categories: things, places, or people.
    Your response will only include the mystery item and should be a single word or short phrase of no more than 50 characters.
    ''')
    # prompt = [system_message]
    response = llm.invoke([system_message])
    logger.info(f"--- generate_mystery_item ---")
    logger.info(f"state: {state}")
    logger.info(f"response: {response}")
    logger.info(f"--- generate_mystery_item response.content ---")
    logger.info(response.content)
    return {"mystery_item": response.content}

@tool
def check_guess(state: AgentState) -> AgentState:
    '''Check if the user's guess is correct.'''
    
    system_message = SystemMessage(content=f'''
    You are a helpful assistant, your only job is to check if the user's guess is correct.
    The mystery item is: {state['mystery_item']}.
    The user's guess is: {state['guess']}.
    IMPORTANT: Your response can only be one of the following: "correct" or "incorrect".
    ''')
    # prompt = [system_message]
    response = llm.invoke([system_message])
    logger.info(f"--- check_guess ---")
    logger.info(f"state: {state}")
    logger.info(f"response: {response}")
    logger.info(f"--- check_guess response.content ---")    
    logger.info(response.content)
    return {"guess_correct": response.content}

tools = [generate_mystery_item, check_guess]
tool_node = ToolNode(tools)
llm_w_tools = llm.bind_tools(tools)


def node_agent(state: AgentState) -> AgentState:
    system_message_content = '''
    You are a friendly host of a Mystery Item Game. 
    The goal of the game is for the user to guess the mystery item.
    The user has a limited number of questions to ask you, and a limited number of attempts to guess the item.
    '''
    
    # if state.get("mystery_item") is None:
    #     system_message_content += "\nThere is no mystery item yet. Your job is to generate one now by calling the `generate_mystery_item` tool."
    
    system_message = SystemMessage(content=system_message_content)
    messages = [system_message] + state["message_history"]
    
    logger.info(f"--- agent node ---")
    logger.info(f"state: {state}")
    logger.info(f"messages: {messages}")
    response = llm_w_tools.invoke(messages)
    logger.info(f"--- agent response ---")
    logger.info(response)
    return {"message_history": [response]}


def router(state: AgentState) -> str:
    last_message = state["message_history"][-1]
    if last_message.tool_calls:
        return "tool_node"
    return END


graph = StateGraph(AgentState)
graph.add_node("agent", node_agent)
graph.add_node("tool_node", tool_node)

graph.set_entry_point("agent")
graph.add_conditional_edges(
    "agent",
    router,
    {
        "tool_node": "tool_node",
        END: END,
    },
)
graph.add_edge("tool_node", "agent")


app = graph.compile()

def invoke_mystery_item_graph(state: AgentState) -> AgentState:
    logger.info(f"--- invoke_graph ---")
    response = app.invoke(state)
    logger.info(f"--- response ---")
    logger.info(response)
    return state

# output to a png
graph_png_bytes = app.get_graph().draw_mermaid_png()
output_filename = "./mystery_item_graph.png"
try:
    with open(output_filename, "wb") as f:
        f.write(graph_png_bytes)
    print(f"Graph saved successfully to {output_filename}")
except IOError as e:
    print(f"Error saving graph to file: {e}")


# if __name__ == "__main__":
#     node_agent(AgentState(session_id="test", message_history=[HumanMessage(content="Hello, how are you?")]))




