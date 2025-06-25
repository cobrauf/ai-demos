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

class AgentState(TypedDict):
    session_id: str
    mystery_item: str | None = None
    guess_correct: str | None = None
    question_count: int = 0
    guess_count: int = 0
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
# tools ------------------------------------------------------------
@tool
def general_chat(user_message: str) -> str:
    '''Use this tool for chat messages, whether the user is asking a question or making a guess, or just chatting about something unrelated to the game.'''
    
    system_message = SystemMessage(content='''
    You are a friendly host of a Mystery Item Game. The goal of the game is for the user to guess the mystery item.
    Your goal is to guide the user to play the game, if they chat about something unrelated to the game, you should still answer but also remind them to play.
    Respond in concise and friendly matter, no more than 100 words.
    ''')
 
    logger.info(f"--- general_chat_tool ---")
    logger.info(f"user_message: {user_message}")
    prompt = [system_message, HumanMessage(content=user_message)]
    response = llm.invoke(prompt)
    logger.info(f"--- general_chat_tool response.content ---") 
    logger.info(f"response.content: {response.content}")
    return response.content
    
@tool
def generate_mystery_item() -> dict:
    '''Use this tool to generate a mystery answer for a guess-the-thing game.'''
    
    system_message = SystemMessage(content='''
    You are a helpful assistant, your only job is to generate a mystery "answer" for a guess-the-thing game. 
    Choose from the following categories: things, places, or people.
    Your response will only include the mystery item and should be a single word or short phrase of no more than 50 characters.
    Choose an answer that a 5 year old would know. Try to randomize the answer, even if you had just gotten the same request.
    ''')
    response = llm.invoke([system_message])
    logger.info(f"--- generate_mystery_item response.content ---")
    logger.info(response.content)
    return {"mystery_item": response.content}

@tool
def check_guess(user_guess: str, mystery_item: str) -> str:
    '''Use this tool to check if the user's guess is correct.'''
    
    system_message = SystemMessage(content=f'''
    You are a helpful assistant, your job is to check if the user's guess is correct.
    The mystery item is: {mystery_item}.
    The user's guess is: {user_guess}.
    Use judgement to determine if the user's guess is correct, don't be too strict. (Eg, piano player is correct for the mystery item "pianist")
    IMPORTANT: Your response can only be one of the following: "correct" or "incorrect".
    ''')
    
    response = llm.invoke([system_message])
    logger.info(f"--- check_guess ---")
    logger.info(f"state: {state}")
    logger.info(f"response: {response}")
    logger.info(f"--- check_guess response.content ---")    
    logger.info(response.content)
    return {"guess_correct": response.content}

tools = [generate_mystery_item, check_guess, general_chat]
tool_node = ToolNode(tools)
llm_w_tools = llm.bind_tools(tools, tool_choice="any") # force it to choose a tool

def node_agent(state: AgentState) -> AgentState:
    system_message_content = '''
    You are a friendly host of a Mystery Item Game. The goal of the game is for the user to guess the mystery item.
    The user has a limited number of questions to ask you, and a limited number of attempts to guess the item.
    You have the following tools to help you:
    - `generate_mystery_item`: Call this to start the game and get a new item.
    - `check_question`: Call this when the user asks a question about the mystery item.
    - `check_guess`: Call this when the user tries to guess the item.
    - `general_chat`: Call this for any conversational messages that are not part of the game.
    Reminder: Use good judgement to determine if the user is asking a question or making a guess.
    IMPORTANT: You must choose a tool to use, if you are not sure, default to `general_chat`.
    '''
     
    if state.get("mystery_item") is None:
        system_message_content += "\nThere is no mystery item yet. Your job is to generate one now by calling the `generate_mystery_item` tool."
    else:
        system_message_content += f"\nThe mystery item has been set. The user can now ask yes/no questions or try to guess it. Do not reveal the item: {state['mystery_item']}"
     
    system_message = SystemMessage(content=system_message_content)
    prompt = [system_message] + state["messages"] 
    
    # logger.info(f"--- agent node, state before invoking llm ---")
    # logger.info(f"state: {state}")
    # logger.info(f"messages: {state['messages']}")
    response = llm_w_tools.invoke(prompt)
    # logger.info(f"--- agent node response ---")
    # logger.info(response)
    return {"messages": [response]}

router_cnt = 0
def router(state: AgentState) -> str:
    global router_cnt
    router_cnt += 1
    logger.info(f"--- router cnt {router_cnt} ---")
    if router_cnt > 3:
        return END
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        logger.info(f"--- router, tool_calls = {last_message.tool_calls} ---")
        return "tool_node"
    logger.info(f"--- router, END ---")
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
    logger.info(f"--- response from graph ---")
    logger.info(response)
    logger.info(f"--- final state ---")
    logger.info(state)
    return state

# output to a png
# graph_png_bytes = app.get_graph().draw_mermaid_png()
# output_filename = "./mystery_item_graph.png"
# try:
#     with open(output_filename, "wb") as f:
#         f.write(graph_png_bytes)
#     print(f"Graph saved successfully to {output_filename}")
# except IOError as e:
#     print(f"Error saving graph to file: {e}")






