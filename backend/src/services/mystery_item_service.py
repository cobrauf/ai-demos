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
    question_count: int = 0
    guess_count: int = 0
    messages: Annotated[Sequence[BaseMessage], add_messages]
    
# tools ------------------------------------------------------------
@tool
def general_chat(user_message: str, game_context: str) -> dict:
    '''Use this tool for chat messages unrelated to the game.'''
    
    system_message = SystemMessage(content=general_chat_system_prompt + f"""
    
    Current Game Context (for your information):
    {game_context}
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
def check_guess(user_guess: str, mystery_item: str, game_context: str) -> dict:
    '''Use this tool to check if the user's guess is correct.'''
    
    system_message = SystemMessage(content=check_guess_system_prompt + f"""
    The user's guess is: {user_guess}.
    
    {game_context}
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
        "guess_count": 1,  # increment guess count
        "messages": [message]
    }

@tool
def answer_question(user_question: str, game_context: str) -> dict:
    '''Use this tool to answer questions about the mystery item without revealing what it is.'''
    
    system_message = SystemMessage(content=answer_question_system_prompt + f"""
    The user's question is: {user_question}.
    
    {game_context}
    
    INSTRUCTIONS: If the user has asked many questions or made several incorrect guesses, 
    consider providing a subtle hint to help them get closer to the answer.
    """)
    
    response = llm.invoke([system_message])
    logger.info(f"--- answer_question ---")
    logger.info(f"user_question: {user_question}")
    logger.info(f"response.content: {response.content}")
    
    return {
        "question_count": 1,  # increment question count
        "messages": [response]
    }

@tool
def reset_game() -> dict:
    """Call this tool when the user wants to play again or start a new game, but wants to continue the conversation."""
    return {
        "mystery_item": None,
        "guess_correct": None,
        "question_count": 0,
        "guess_count": 0,
        "game_started": False,
        "messages": [AIMessage(content="Okay, let's play again! I've cleared the board. Say 'start game' to get a new item.")]
    }

tools = [generate_mystery_item, check_guess, answer_question, general_chat, reset_game]
tool_node = ToolNode(tools)
llm_w_tools = llm.bind_tools(tools, tool_choice="any") # force it to choose a tool
# END tools ------------------------------------------------------------

# Helper functions ------------------------------------------------------------
def construct_game_state(state: AgentState) -> dict:
    """
    Construct the game state from the current state. Filter for AI and Human messages.
    """
    return {
        "game_started": state["game_started"],
        "mystery_item": state["mystery_item"],
        "guess_correct": state["guess_correct"],
        "question_count": state["question_count"],
        "guess_count": state["guess_count"],
        "messages": [
            msg for msg in state["messages"] 
            if isinstance(msg, (HumanMessage, AIMessage))
        ]
    }

def format_game_context(state: AgentState) -> str:
    """
    Format game state and conversation history for tools to use as context.
    """
    game_state = construct_game_state(state)
    
    # Format recent conversation history
    recent_messages = game_state["messages"][-5:] if game_state["messages"] else []
    conversation_history = "\n".join([
        f"{msg.__class__.__name__}: {msg.content}" 
        for msg in recent_messages
    ])
    
    context = f"""
    Game State:
    - Mystery Item: {game_state['mystery_item']}
    - Game Started: {game_state['game_started']}
    - Questions Asked: {game_state['question_count']}
    - Guesses Made: {game_state['guess_count']}
    - Last Guess Result: {game_state['guess_correct']}

    Recent Conversation:
    {conversation_history}
    """
    return context.strip()
# End helper functions ------------------------------------------------------------

def node_game_agent(state: AgentState) -> AgentState:
    '''
    This node is responsible for the game logic, it only calls tools.
    '''
    system_message_content = game_agent_system_prompt
    
    # Include formatted game context if game is started
    if state.get("mystery_item"):
        game_context = format_game_context(state)
        mystery_item = state.get('mystery_item')
        system_message_content += f"""
        Here is the current game context. Use it to inform your tool calls.
        ---
        {game_context}
        ---

        When calling a tool, provide all required parameters.
- For `check_guess`, the `mystery_item` is "{mystery_item}".
- For `check_guess`, `answer_question`, and `general_chat`, use the full game context provided above for the `game_context` parameter.
        """
     
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
    
    # The input to stream is the input for the entry point node (`agent`).
    # The `add_messages` reducer will add our new message to the existing ones.
    initial_state = {"messages": []}
    if user_message:
        initial_state["messages"].append(HumanMessage(content=user_message))
        
    # print(f"--- initial_state ---")
    # print(initial_state)

    # The graph will end with the tool_node, which is the last step.
    # We can get the final state from the stream.
    # The `stream` method returns an iterator of all states. We just want the final one.
    final_state = None
    for chunk in app.stream(initial_state, config=config):
        # chunk is a dictionary with the node name as key and the output as value
        # logger.info(f"--- streaming chunk ---")
        # logger.info(chunk)
        final_state = chunk

    # The last chunk will be the output of the 'tool_node'
    if final_state and "tool_node" in final_state:
        # The tool node updates the state, including messages.
        # We need to get the full state from the checkpointer to get the accumulated messages.
        current_state = app.get_state(config)
        logger.info(f"--- final_state (from tool_node) ---")
        # logger.info(current_state.values)
        logger.info(f"--- final_state (from tool_node) messages     ---")
        # logger.info(current_state.values["messages"])
        return current_state.values["messages"]

    # Fallback to get the current state if the last chunk wasn't the tool node
    current_state = app.get_state(config)
    logger.info(f"--- current_state (fallback) ---")
    logger.info(current_state)
    return current_state.values["messages"]

# output to a png
# graph_png_bytes = app.get_graph().draw_mermaid_png()
# output_filename = "./mystery_item_graph.png"
# try:
#     with open(output_filename, "wb") as f:
#         f.write(graph_png_bytes)
#     print(f"Graph saved successfully to {output_filename}")
# except IOError as e:
#     print(f"Error saving graph to file: {e}")