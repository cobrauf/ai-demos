import logging
from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from src.services import mystery_item_service
from src.utils.mystery_item_helpers import extract_last_ai_response
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

class ResetRequest(BaseModel):
    session_id: str
    
    
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
    
    ai_response = extract_last_ai_response(messages)
    return {"response": ai_response}

@router.post("/reset")
def reset_mystery_item_session(request: ResetRequest):
    """Reset the mystery item game session, clearing all backend state."""
    success = mystery_item_service.reset_session_state(request.session_id)
    return {"success": success, "message": "Session reset successfully"}

