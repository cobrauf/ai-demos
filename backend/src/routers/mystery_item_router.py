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
    session_id: str
    message: str

@router.post("/invoke")
def invoke_mystery_item(request: ChatRequest):
    result = mystery_item_service.app.invoke({
        "session_id": request.session_id,
        "message_history": [HumanMessage(content=request.message)]
    })
    logger.info(f"--- result from mystery-item invoke ---")
    logger.info(AIMessage(content=result))
    return result

@router.get("") # for dev 
def read_root():
    result = mystery_item_service.node_agent({
        "session_id": "test_id",
        "message_history": [HumanMessage(content="write a haiku about a food item.")]})
    logger.info(f"--- result from mystery-item root ---")
    logger.info(result)
    return result 