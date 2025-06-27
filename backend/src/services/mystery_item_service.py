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
from langgraph.checkpoint.memory import MemorySaver
from src.prompts.mystery_item_prompts import (
    generate_mystery_item_system_prompt,
    general_chat_system_prompt,
    check_guess_system_prompt,
    answer_question_system_prompt,
    game_agent_system_prompt
)

logger = logging.getLogger(__name__)

memory = MemorySaver()

class AgentState(TypedDict):
    session_id: str
    game_started: bool = False
    mystery_item: str | None = None
    guess_correct: str | None = None
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
# tools ------------------------------------------------------------
@tool
def general_chat(user_message: str, history: str) -> dict:
    '''Use this tool for chat messages unrelated to the game.'''
    
    system_message = SystemMessage(content=general_chat_system_prompt + f"""
    
    Current Conversation History (for your information):
    {history}
    """)
 
    logger.info(f"--- general_chat_tool ---")
    prompt = [system_message, HumanMessage(content=user_message)]
    response = llm.invoke(prompt)
    logger.info(f"--- general_chat_tool response.content ---") 
    logger.info(f"response.content: {response.content}")
    return {"messages": [response]}
    
@tool
def generate_mystery_item() -> dict:
    '''Use this tool to generate a mystery answer for a guess-the-thing game.'''
    
    system_message = SystemMessage(content=generate_mystery_item_system_prompt)
    response = llm.invoke([system_message])
    logger.info(f"--- generate_mystery_item response.content ---")
    logger.info(response.content)
    return {
        "mystery_item": response.content.strip(),
        "game_started": True,
        "messages": [AIMessage(content="I've thought of a new mystery item! You can start asking questions or try to guess what it is.")]
    }

@tool
def check_guess(user_guess: str, mystery_item: str, history: str) -> dict:
    '''Use this tool to check if the user's guess is correct.'''
    
    system_message = SystemMessage(content=check_guess_system_prompt + f"""
    The user's guess is: {user_guess}.
    
    Conversation History:
    {history}
    """)
    
    response = llm.invoke([system_message])
    logger.info(f"--- check_guess ---")
    logger.info(f"response: {response}")
    logger.info(f"--- check_guess response.content ---")    
    logger.info(response.content)
    
    is_correct = "right" in response.content.lower()
    
    if is_correct:
        message = AIMessage(content=f"You guessed it! The mystery item was '{mystery_item}'. Congratulations!")
    else:
        message = AIMessage(content="That's not it. Keep trying or ask another question!")
        
    return {
        "guess_correct": "correct" if is_correct else "incorrect",
        "messages": [message]
    }

@tool
def answer_question(user_question: str, mystery_item: str, history: str) -> dict:
    '''Use this tool to answer questions about the mystery item without revealing what it is.'''
    
    system_message = SystemMessage(content=answer_question_system_prompt + f"""
    The user's question is: {user_question}.
    
    Conversation History:
    {history}
    """)
    
    response = llm.invoke([system_message])
    logger.info(f"--- answer_question ---")
    logger.info(f"user_question: {user_question}")
    logger.info(f"response.content: {response.content}")
    
    return {"messages": [response]}

@tool
def reset_game() -> dict:
    """Call this tool when the user wants to play again or start a new game, but wants to continue the conversation."""
    
    logger.info(f"--- reset_game ---")
    
    return {
        "mystery_item": None,
        "guess_correct": None,
        "game_started": False,
        "messages": [AIMessage(content="Okay, let's play again! I've cleared the board. Say 'start game' to get a new item.")]
    }

tools = [generate_mystery_item, check_guess, answer_question, general_chat, reset_game]
tool_node = ToolNode(tools)
llm_w_tools = llm.bind_tools(tools, tool_choice="any") # force it to choose a tool
# END tools ------------------------------------------------------------

# Helper functions ------------------------------------------------------------
def format_history(messages: Sequence[BaseMessage]) -> str:
    """
    Format conversation history for tools to use as context.
    Filters for HumanMessages and parses content from ToolMessages.
    """
    import re
    
    logger.info(f"--- DEBUG: Total messages in state: {len(messages)} ---")
    for i, msg in enumerate(messages):
        logger.info(f"Message {i}: Type={type(msg).__name__}, Content={getattr(msg, 'content', 'NO_CONTENT')[:100]}...")
    
    filtered_messages = []
    
    for msg in messages:
        if isinstance(msg, HumanMessage):
            filtered_messages.append(msg)
        elif isinstance(msg, ToolMessage):
            # The AI response from a tool is inside a ToolMessage
            if hasattr(msg, 'content') and isinstance(msg.content, str):
                content_str = msg.content.strip()
                
                # Regex to find content inside AIMessage(content='...')
                match = re.search(r"content=['\"](.*?)['\"]", content_str, re.DOTALL)
                
                if match:
                    extracted_content = match.group(1)
                    # Clean up common escape sequences
                    extracted_content = extracted_content.replace('\\n', '\n').replace('\\"', '"').replace("\\'", "'")
                    filtered_messages.append(AIMessage(content=extracted_content))

    # Format recent conversation history (last 20 messages)
    recent_messages = filtered_messages[-20:] if filtered_messages else []
    conversation_history = "\n".join([
        f"{msg.__class__.__name__}: {msg.content}" 
        for msg in recent_messages
    ])
    logger.info(f"--- conversation_history ---")
    logger.info(conversation_history)
    return conversation_history.strip()
# End helper functions ------------------------------------------------------------

def node_game_agent(state: AgentState) -> AgentState:
    '''
    This node is responsible for the game logic, it only calls tools.
    '''
    system_message_content = game_agent_system_prompt
    
    # Include formatted history and mystery item if game is started
    # if state.get("mystery_item"):
    #     history = format_history(state["messages"])
    #     mystery_item = state.get('mystery_item')
    #     system_message_content += f"""
    #     Here is the current mystery item and conversation history. Use them to inform your tool calls.
    #     Mystery Item: {mystery_item}
        
    #     Conversation History:
    #     {history}
    #     """

    history = format_history(state["messages"])
    system_message_content += f"""
    Conversation History:
    {history}
    """
    
    print(f"system_message_content: {system_message_content}")
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

app = graph.compile(checkpointer=memory)

def invoke_mystery_item_graph(session_id: str, user_message: str | None = None) -> list[BaseMessage]:
    """
    Invokes the mystery item graph.
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

# output to a png ---------------------------------------------------
# graph_png_bytes = app.get_graph().draw_mermaid_png()
# output_filename = "./mystery_item_graph.png"
# try:
#     with open(output_filename, "wb") as f:
#         f.write(graph_png_bytes)
#     print(f"Graph saved successfully to {output_filename}")
# except IOError as e:
#     print(f"Error saving graph to file: {e}")