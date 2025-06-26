import logging
from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, AIMessage
from src.services import mystery_item_service

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
    
    # Extract the final AI response from the general_chat tool
    ai_response = "Sorry, I couldn't generate a response."
    
    for msg in reversed(messages):
        if hasattr(msg, 'name') and msg.name == 'general_chat' and hasattr(msg, 'content'):
            # Parse the AI response from the tool content
            import re
            match = re.search(r"AIMessage\(content='([^']+)'", msg.content)
            if match:
                ai_response = match.group(1).replace('\\n', '\n')
                break
    
    logger.info(f"--- extracted AI response: {ai_response} ---")
    return {"response": ai_response}

