from fastapi import APIRouter
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
from src.services import mystery_item_service

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
    print(f"--- result from invoke ---")
    print(result)
    return result

@router.get("") # for postman
def read_root():
    result = mystery_item_service.node_agent({
        "session_id": "test_id",
        "message_history": [HumanMessage(content="write a haiku about a food item.")]})
    print(f"--- result from mystery-item root ---")
    print(result)
    return result 