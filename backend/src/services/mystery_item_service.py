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
    
# START tools ------------------------------------------------------------
@tool
def general_chat(state: AgentState) -> AgentState:
    '''Use this tool for chat messages, whether the user is asking a question or making a guess, or just chatting about something unrelated to the game.'''
    
    mystery_item_context = ""
    if state.get("mystery_item"):
        mystery_item_context = f"\nThe current mystery item is: {state['mystery_item']}."
    
    system_message = SystemMessage(content=f'''
    You are a friendly host of a Mystery Item Game. The goal of the game is for the user to guess the mystery item by asking questions.
    The user can ask questions about the mystery item, or try to guess the item. You have to discern if the user is asking a question or making a guess.
    Your goal is to guide the user to play the game, by providing helpful responses to their questions, or prompting them to ask a question.
    If they chat about something unrelated to the game, you should still answer but then remind them to keep playing.
    Respond in concise and friendly matter, no more than 50 words.{mystery_item_context}
    ''')
 
    logger.info(f"--- general_chat_tool ---")
    
    # Filter messages to only include Human and AI messages and not tool messages
    filtered_messages = [
        msg for msg in state["messages"] 
        if isinstance(msg, (HumanMessage, AIMessage))
    ]
    
    prompt = [system_message] + filtered_messages
    response = llm.invoke(prompt)
    logger.info(f"--- general_chat_tool response.content ---") 
    logger.info(f"response.content: {response.content}")
    return {"messages": [response]}
    
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
    return {
        "mystery_item": response.content,
        "game_started": True,
        "messages": [AIMessage(content="I've thought of a new mystery item! You can start asking questions or try to guess what it is.")]
    }

@tool
def check_guess(user_guess: str, mystery_item: str) -> dict:
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
    logger.info(f"response: {response}")
    logger.info(f"--- check_guess response.content ---")    
    logger.info(response.content)
    
    is_correct = "correct" in response.content.lower()
    
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
def answer_question(user_question: str, mystery_item: str) -> dict:
    '''Use this tool to answer yes/no questions about the mystery item without revealing what it is.'''
    
    system_message = SystemMessage(content=f'''
    You are a helpful assistant running a mystery item guessing game. Your job is to answer the user's question about the mystery item.
    The mystery item is: {mystery_item}.
    The user's question is: {user_question}.
    
    Answer the question honestly with "yes" or "no" (you can add a brief explanation). Do not reveal the mystery item.
    Keep your response concise and helpful for the guessing game.
    Examples:
    - Question: "Is it bigger than a car?" Answer: "Yes, it's much bigger than a car."
    - Question: "Is it something you can eat?" Answer: "No, you cannot eat it."
    ''')
    
    response = llm.invoke([system_message])
    logger.info(f"--- answer_question ---")
    logger.info(f"user_question: {user_question}")
    logger.info(f"mystery_item: {mystery_item}")
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

def node_game_agent(state: AgentState) -> AgentState:
    '''
    This node is responsible for the game logic, it only calls tools.
    '''
    
    system_message_content = '''You are a Mystery Item Game agent. Your only job is to decide which tool to use based on the user's message. You must always choose one tool.
- If the user wants to start a new game, use `generate_mystery_item`.
- If the user wants to start over or stop playing while a game is in progress, use the `reset_game` tool.
- If the user is making a direct guess about what the item is (e.g., "is it a car?", "is it a dog?", "car", "dog"), use `check_guess`.
- If the user is asking a question about properties of the item (e.g., "is it bigger than a house?", "can you eat it?", "does it have wheels?"), use `answer_question`.
- For all other conversational turns, use `general_chat`.'''
     
    if state.get("mystery_item"):
        system_message_content += f"\nThe current mystery item is: {state['mystery_item']}. Do not reveal it."
     
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
        
    print(f"--- initial_state ---")
    print(initial_state)

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
        logger.info(current_state.values["messages"])
        return current_state.values["messages"]

    # Fallback to get the current state if the last chunk wasn't the tool node
    current_state = app.get_state(config)
    logger.info(f"--- current_state (fallback) ---")
    logger.info(current_state)
    return current_state.values["messages"]

# output to a png
graph_png_bytes = app.get_graph().draw_mermaid_png()
output_filename = "./mystery_item_graph.png"
try:
    with open(output_filename, "wb") as f:
        f.write(graph_png_bytes)
    print(f"Graph saved successfully to {output_filename}")
except IOError as e:
    print(f"Error saving graph to file: {e}")