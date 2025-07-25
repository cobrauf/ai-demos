import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.services import testChain # for dev
from src.routers import mystery_item_router

logging.getLogger("httpx").setLevel(logging.WARNING)

logging.basicConfig(level=logging.INFO, format='%(levelname)s:     %(message)s')
logger = logging.getLogger(__name__)

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

app.include_router(mystery_item_router.router)

#test endpoints -------------------------------- # for dev
@app.get("/")
def read_root():
    logger.info("--- testChain.test_llm_call() ---")
    result = testChain.test_llm_call()
    logger.info(f"result: {result}")
    return result