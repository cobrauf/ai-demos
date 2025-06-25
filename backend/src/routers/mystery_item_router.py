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
    
    
@router.post("/") # for general chat
def chat_mystery_item(request: ChatRequest):
    chat_message = HumanMessage(content=request.message)    
    result = mystery_item_service.general_chat([chat_message])
    ai_message = AIMessage(content=result)
    return {"message_history": [ai_message]}


@router.post("/invoke")
def invoke_mystery_item(request: ChatRequest):
    result = mystery_item_service.invoke_mystery_item_graph(
        session_id=request.session_id,
        user_message=request.message
    )
    # logger.info(f"--- result from mystery-item invoke ---")
    # logger.info(f"result: {result}")
    return result

