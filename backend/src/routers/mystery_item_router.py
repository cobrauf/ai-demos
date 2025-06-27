import logging
from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from src.services import mystery_item_service
import re
import json

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
    for msg in reversed(messages):
        if isinstance(msg, ToolMessage):
            # Try JSON first
            try:
                tool_data = json.loads(msg.content)
                if 'messages' in tool_data and tool_data['messages']:
                    ai_message = tool_data['messages'][0]
                    if isinstance(ai_message, dict) and 'content' in ai_message:
                        ai_response = ai_message['content'].strip()
                        break
            except Exception:
                pass
            # Fallback: match content='...' or content="..." across newlines and apostrophes
            import re
            # First try single quotes, then double quotes
            match = re.search(r"content='((?:[^'\\]|\\.)*)'", msg.content, re.DOTALL)
            if not match:
                match = re.search(r'content="((?:[^"\\]|\\.)*)"', msg.content, re.DOTALL)
            if match:
                # Unescape the captured content
                ai_response = match.group(1).replace("\\'", "'").replace('\\"', '"').replace("\\\\", "\\").strip()
                break
        elif isinstance(msg, AIMessage) and msg.content.strip():
            ai_response = msg.content.strip()
            break
    return {"response": ai_response}

