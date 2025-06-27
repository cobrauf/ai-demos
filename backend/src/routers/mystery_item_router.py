import logging
from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from src.services import mystery_item_service
import re

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/mystery-item",
    tags=["mystery-item"],
)

class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str
    
    
# @router.post("/") # for general chat
# def chat_mystery_item(request: ChatRequest):
#     chat_message = HumanMessage(content=request.message)    
#     result = mystery_item_service.general_chat([chat_message])
#     ai_message = AIMessage(content=result)
#     return {"message_history": [ai_message]}


@router.post("/invoke")
def invoke_mystery_item(request: ChatRequest):
    messages = mystery_item_service.invoke_mystery_item_graph(
        session_id=request.session_id,
        user_message=request.message
    )
    
    ai_response = "Sorry, I couldn't generate a response."
    # Look for the most recent ToolMessage and extract AIMessage content from it
    for msg in reversed(messages):
        if isinstance(msg, ToolMessage):
            # The ToolMessage content contains a dictionary-like string representation
            # Try multiple approaches to extract the AI response
            try:
                import ast
                # Try to parse as a Python dictionary literal
                tool_data = ast.literal_eval(msg.content)
                if 'messages' in tool_data and tool_data['messages']:
                    ai_message = tool_data['messages'][0]  # Get the first message
                    if hasattr(ai_message, 'content'):
                        ai_response = ai_message.content.strip()
                        break
            except:
                pass
            
            # Fallback: Extract using regex for content within AIMessage
            # Look for patterns like content='...' or content="..."
            patterns = [
                r"AIMessage\(content='([^']+)'",
                r'AIMessage\(content="([^"]+)"',
                r"content='([^']+)'",
                r'content="([^"]+)"'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, msg.content)
                if match:
                    ai_response = match.group(1).strip()
                    # Remove any trailing characters like \n
                    ai_response = ai_response.replace('\\n', '').strip()
                    break
            
            if ai_response != "Sorry, I couldn't generate a response.":
                break
                
        elif isinstance(msg, AIMessage) and msg.content.strip():
            ai_response = msg.content.strip()
            break
    
    return {"response": ai_response}

