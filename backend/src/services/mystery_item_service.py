import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import logging
from src.config.llm_config import llm
from typing import Annotated, TypedDict, Sequence 
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, ToolMessage, AIMessage
from langgraph.graph.message import add_messages

from langgraph.graph import StateGraph, END
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from src.utils.mystery_item_helpers import format_history_for_prompt
from src.utils.mystery_item_prompts import (
    generate_mystery_item_system_prompt,
    general_chat_system_prompt,
    check_guess_system_prompt,
    answer_question_system_prompt,
    game_agent_system_prompt,
    give_hint_system_prompt
)

logger = logging.getLogger(__name__)

class AgentState(TypedDict):
    session_id: str
    game_started: bool = False
    secret_answer: str | None = None
    guess_correct: bool | None = None
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
# tools ------------------------------------------------------------
@tool
def general_chat(user_message: str, history: str) -> dict:
    '''Use this tool for chat messages unrelated to the game.'''
    
    system_message = SystemMessage(content=general_chat_system_prompt + f"""
    
    Here's the conversation history for your reference:
    {history}
    
    Here is the user's current message:
    {user_message}
    """)
 
    logger.info(f"--- general_chat_tool ---")
    prompt = [system_message, HumanMessage(content=user_message)]
    response = llm.invoke(prompt)
    # logger.info(f"--- general_chat_tool response.content ---") 
    # logger.info(f"response.content: {response.content}")
    return {"messages": [response]}
    
@tool
def generate_mystery_item() -> dict:
    '''Use this tool to generate a secret answer for a guess-the-thing game.'''
    
    system_message = SystemMessage(content=generate_mystery_item_system_prompt)
    response = llm.invoke([system_message])
    logger.info(f"--- generate_mystery_item response.content ---")
    logger.info(response.content)
    return {
        "secret_answer": response.content.strip(),
        "game_started": True,
        "messages": [AIMessage(content="I've thought of a new secret answer! You can start asking questions or try to guess what it is.")]
    }

@tool
def check_guess(user_guess: str, secret_answer: str, history: str) -> dict:
    '''Use this tool to check if the user's guess is correct.'''
    
    system_message = SystemMessage(content=check_guess_system_prompt + f"""
    Here's the conversation history for your reference:
    {history}
    
    Here are the secret answer and user's guess, respond accordingly:
    The secret answer is: {secret_answer}.
    The user's guess is: {user_guess}.
    """)
    
    response = llm.invoke([system_message])
    logger.info(f"--- check_guess ---")
    logger.info(response.content)
    
    is_correct = response.content.upper().startswith("CORRECT:")
    
    message_content = response.content.replace("CORRECT:", "").replace("INCORRECT:", "").strip()
    message = AIMessage(content=message_content)
        
    if is_correct:
        return {
            "secret_answer": None,
            "game_started": False,
            "guess_correct": False,
            "messages": [message]
        }
    else:
        return {
            "guess_correct": False,
            "messages": [message]
        }

@tool
def answer_question(user_question: str, secret_answer: str, history: str) -> dict:
    '''Use this tool to answer questions about the secret answer without revealing what it is.'''
    
    system_message = SystemMessage(content=answer_question_system_prompt + f"""
    Here's the conversation history for your reference:
    {history}
    
    Here are the secret answer and user's question, respond accordingly:
    The secret answer is: {secret_answer}.
    The user's question is: {user_question}.
    """)
    
    response = llm.invoke([system_message])
    logger.info(f"--- answer_question ---")
    # logger.info(f"user_question: {user_question}")
    # logger.info(f"response.content: {response.content}")
    return {"messages": [response]}

@tool
def give_hint(user_message: str, secret_answer: str, history: str) -> dict:
    '''
    Use this tool to give hints about the secret answer without revealing what it is.
    Use it if the user is asking for a hint, or is frustrated, or has asked 4+ questions.
    '''
    
    system_message = SystemMessage(content=give_hint_system_prompt + f"""
    Here's the conversation history for your reference:
    {history}
    
    Here are the secret answer and user's message, respond accordingly:
    The secret answer is: {secret_answer}.
    The user's message is: {user_message}.
    """)
    
    response = llm.invoke([system_message])
    logger.info(f"--- give_hint ---")
    logger.info(f"response.content: {response.content}")
    
    return {"messages": [response]}

@tool
def reset_game(secret_answer: str | None = None) -> dict:
    """Call this tool when the user wants to play again or start a new game, but wants to continue the conversation."""
    
    logger.info(f"--- reset_game ---")
    
    if secret_answer:
        message = f"Sure, the secret answer was '{secret_answer}'. I've cleared the board. Let me know when you're ready to play again."
    else:
        message = "Sure, I've cleared the board. Let me know when you're ready to play again."
        
    return {
        "secret_answer": None,
        "guess_correct": None,
        "game_started": False,
        "messages": [AIMessage(content=message)]
    }

tools = [generate_mystery_item, check_guess, answer_question, general_chat, reset_game, give_hint]
tool_node = ToolNode(tools)
llm_w_tools = llm.bind_tools(tools, tool_choice="any") # force it to choose a tool
# END tools ------------------------------------------------------------

def node_game_agent(state: AgentState) -> AgentState:
    '''
    This node is responsible for the game logic, it only calls tools.
    '''
    system_message_content = game_agent_system_prompt
    
    history = format_history_for_prompt(state["messages"])
    
    system_message_content += f"""

    Here is the conversation history:
    {history}
    """

    if state.get("secret_answer"):
        secret_answer = state.get('secret_answer')
        system_message_content += f"""

        The current secret answer is: {secret_answer}. Use this when calling tools that require it.
        """
    
    # print(f"system_message_content: {system_message_content}")
    system_message = SystemMessage(content=system_message_content)
    prompt = [system_message] + state["messages"] 
    response = llm_w_tools.invoke(prompt)
    return {"messages": [response]}

graph = StateGraph(AgentState)
graph.add_node("agent", node_game_agent)
graph.add_node("tool_node", tool_node)

graph.set_entry_point("agent")
graph.add_edge("agent", "tool_node")
graph.add_edge("tool_node", END)

app = graph.compile()

def invoke_mystery_item_graph(session_id: str, user_message: str | None = None) -> list[BaseMessage]:
    """
    Invokes the guessing game graph.
    Args:
        session_id: The session ID for the conversation.
        user_message: The user's message to inject into the graph.
    Returns:
        The updated list of messages from the graph state.
    """
    logger.info(f"--- invoke_graph ---")
    config = {"configurable": {"thread_id": session_id}}
    
    initial_state = {"messages": []}
    if user_message:
        initial_state["messages"].append(HumanMessage(content=user_message))

    final_state = None
    for chunk in app.stream(initial_state, config=config):
        final_state = chunk

    # The last chunk will be the output of the 'tool_node'
    if final_state and "tool_node" in final_state:
        current_state = app.get_state(config)
        return current_state.values["messages"]

    # Fallback to get the current state if the last chunk wasn't the tool node
    current_state = app.get_state(config)
    logger.info(f"--- current_state (fallback) ---")
    logger.info(current_state)
    return current_state.values["messages"]

def reset_session_state(session_id: str) -> bool:
    """
    Resets the session state by clearing it from memory.
    Args:
        session_id: The session ID to reset.
    Returns:
        True if reset was successful, False otherwise.
    """
    try:
        logger.info(f"--- reset_session_state for session: {session_id} ---")
        config = {"configurable": {"thread_id": session_id}}
        
        # Clear the session state by putting an empty state
        empty_state = {
            "session_id": session_id,
            "game_started": False,
            "secret_answer": None,
            "guess_correct": None,
            "messages": []
        }
        
        # Put the empty state to effectively reset the session
        app.update_state(config, empty_state)
        logger.info(f"Session {session_id} reset successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to reset session {session_id}: {e}")
        return False

# output to a png ---------------------------------------------------
# graph_png_bytes = app.get_graph().draw_mermaid_png()
# output_filename = "./mystery_item_graph.png"
# try:
#     with open(output_filename, "wb") as f:
#         f.write(graph_png_bytes)
#     print(f"Graph saved successfully to {output_filename}")
# except IOError as e:
#     print(f"Error saving graph to file: {e}")