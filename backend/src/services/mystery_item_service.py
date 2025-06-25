import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import logging
from src.config.llm_config import llm
from typing import Annotated, TypedDict, Sequence 
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command

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
    
    system_message = SystemMessage(content='''
    You are a friendly host of a Mystery Item Game. The goal of the game is for the user to guess the mystery item by asking yes/no questions to narrow down the answer.
    Your goal is to guide the user to play the game, by providing helpful responses to their questions, or prompting them to ask a question.
    If they chat about something unrelated to the game, you should still answer but also remind them to play.
    Respond in concise and friendly matter, no more than 50 words.
    ''')
 
    logger.info(f"--- general_chat_tool ---")
    # logger.info(f"user_message: {user_message}")
    prompt = [system_message] + state["messages"]
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
    # logger.info(f"state: {state}")
    logger.info(f"response: {response}")
    logger.info(f"--- check_guess response.content ---")    
    logger.info(response.content)
    return {"guess_correct": response.content}

tools = [generate_mystery_item, check_guess, general_chat]
game_tool_node = ToolNode([generate_mystery_item, check_guess])
chat_tool_node = ToolNode([general_chat])
llm_w_tools = llm.bind_tools(tools, tool_choice="any") # force it to choose a tool
# END tools ------------------------------------------------------------

# def node_manager(state: AgentState) -> AgentState:
#     '''
#     This node is responsible for starting/ending the game and chatting with the user.
#     '''
#     if state["game_started"] is True:
#         return "game_has_started" #bypass this node and go to the managerrouter
    
#     system_message_content = '''
#     You are a friendly host of a Mystery Item Game. The goal of the game is for the user to guess the mystery item.
#     Your job is determine if the user is trying to start the game, end the game, or just chat.
#     If the user is trying to start the game, respond with "start_game" only and nothing else.
#     If the user is trying to end the game, respond with "end_game" only and nothing else.
#     If the user is just chatting, respond in concise and friendly matter, no more than 100 words.
#     '''
#     prompt = [SystemMessage(content=system_message_content)] + state["messages"]
#     response = llm.invoke(prompt)
        
#     logger.info(f"--- node_manager ---")
#     logger.info(f"state: {state}")
#     return {"messages": [response]}

def node_game_agent(state: AgentState) -> AgentState:
    '''
    This node is responsible for the game logic, it only calls tools.
    '''
    
    system_message_content = '''
    You are a Mystery Item Game tool agent. The goal of the game is for the user to guess the mystery item.
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
        system_message_content += f"\nThe mystery item has been set. Do not reveal the item: {state['mystery_item']}"
        system_message_content += f"\nRemember after other tools are called, you must call the 'general_chat' tool to respond to the user."
     
    system_message = SystemMessage(content=system_message_content)
    prompt = [system_message] + state["messages"] 
    response = llm_w_tools.invoke(prompt)
    return {"messages": [response]}

router_cnt = 0
def router(state: AgentState) -> str:
    global router_cnt
    router_cnt += 1
    logger.info(f"--- router cnt {router_cnt} ---")
    if router_cnt > 5: 
        logger.warning("Router limit reached, ending graph.")
        return END
    
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        logger.info(f"--- router, tool_calls = {last_message.tool_calls} ---")
        if last_message.tool_calls[0]['name'] == 'general_chat':
            return "chat_tool_node"
        else:
            return "game_tool_node"
    else:
        logger.info(f"!!!!!!! interrupt SHOULDN'T HAPPEN !!!!!!!")
        return "__interrupt__"
        

graph = StateGraph(AgentState)
graph.add_node("agent", node_game_agent)
graph.add_node("game_tool_node", game_tool_node)
graph.add_node("chat_tool_node", chat_tool_node)

graph.set_entry_point("agent")
graph.add_conditional_edges(
    "agent",
    router,
    {
        "game_tool_node": "game_tool_node",
        "chat_tool_node": "chat_tool_node",
        "__interrupt__": END,
    },
)
graph.add_edge("game_tool_node", "agent")
graph.add_edge("chat_tool_node", END)


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

    final_state = None
    for chunk in app.stream(initial_state, config=config):
        # chunk is a dictionary with the node name as key and the output as value
        # logger.info(f"--- streaming chunk ---")
        # logger.info(chunk)
        final_state = chunk

    # The final state is the output of the last node that ran
    # We are interested in the 'agent' node's output which is the full state
    if final_state and "agent" in final_state:
        logger.info(f"--- final_state ---")
        logger.info(final_state)
        return final_state["agent"]["messages"]

    # If the graph ended without the agent running (e.g. interruption after tool),
    # we need to fetch the current state from the checkpointer
    current_state = app.get_state(config)
    logger.info(f"--- current_state ---")
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