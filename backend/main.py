from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.services import testChain, mystery_item_service # for dev
from langchain_core.messages import HumanMessage # for dev
from pydantic import BaseModel


class ChatRequest(BaseModel):
    session_id: str
    message: str


app = FastAPI()

# frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = [
    "http://localhost:5173",
    # frontend_url,
    "*", # TODO: Restrict in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#test endpoints -------------------------------- # for dev
@app.get("/")
def read_root():
    return testChain.test_llm_call()

@app.post("/mystery-item/invoke")
def invoke_mystery_item(request: ChatRequest):
    result = mystery_item_service.app.invoke({
        "session_id": request.session_id,
        "message_history": [HumanMessage(content=request.message)]
    })
    print(f"--- result from invoke ---")
    print(result)
    return result

@app.get("/mystery-item") # for postman
def read_root():
    result = mystery_item_service.node_agent({
        "session_id": "test_id",
        "message_history": [HumanMessage(content="write a haiku about a food item.")]})
    print(f"--- result ---")
    print(result)
    return result