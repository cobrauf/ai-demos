import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from src.config.llm_config import llm
from typing import Annotated, TypedDict, Sequence 
from langchain_core.messages import BaseMessage, HumanMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, END




class AgentState(TypedDict):
    session_id: str
    message_history: Annotated[Sequence[BaseMessage], add_messages]

def node_agent(state: AgentState) -> AgentState:
    '''
    Orchestrate flow of Mystery Item Game:
    - User chooses a category (eg, "things", "places", "people", or "custom").
    - Agent generates a mystery item that is the answer.
    - User has some number of questions to ask the agent, the agent responds with "yes", "no", or "irrelevant".
    - User has some number of attempts to guess the item, the agent provides feedback on each guess.
    '''
    # make above a system message
    print(f"--- message history start ---")
    print(f"state: {state}")
    print(f"message_history: {state['message_history']}")
    response = llm.invoke(state["message_history"])
    print(f"--- response.content ---")
    print(response.content)
    return {"message_history": [response]}

graph = StateGraph(AgentState)
graph.add_node("agent", node_agent)
graph.set_entry_point("agent")
graph.add_edge("agent", END)
app = graph.compile()

# output to a png
graph_png_bytes = app.get_graph().draw_mermaid_png()
output_filename = "./services/mystery_item_graph.png"
try:
    with open(output_filename, "wb") as f:
        f.write(graph_png_bytes)
    print(f"Graph saved successfully to {output_filename}")
except IOError as e:
    print(f"Error saving graph to file: {e}")


# if __name__ == "__main__":
#     node_agent(AgentState(session_id="test", message_history=[HumanMessage(content="Hello, how are you?")]))




