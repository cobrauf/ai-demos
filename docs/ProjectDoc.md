## General structure

```
.
├── backend/
│   ├── src/
│   │   ├── demos/                     # <--- Central hub for backend demos
│   │   │   ├── simple_chat/           # <--- Module for Demo 1
│   │   │   │   ├── router.py          #      - Defines API endpoints for this demo
│   │   │   │   └── chain.py           #      - Contains the specific logic
│   │   │   │
│   │   │   └── langgraph_agent/       # <--- Module for Demo 2
│   │   │       ├── router.py
│   │   │       └── agent.py
│   │   │
│   │   └── core/                      # <--- (Optional) For shared logic like LLM clients
│   │       └── clients.py
│   │
│   └── main.py                        # <--- Imports and includes routers from `src/demos`
│
└── frontend/
    └── src/
        ├── demos/                     # <--- Central hub for frontend demo pages
        │   ├── SimpleChatPage.tsx     # <--- UI and state for Demo 1
        │   └── AgentDemoPage.tsx      # <--- UI and state for Demo 2
        │
        ├── components/                # <--- Shared, reusable React components
        │   └── NavBar.tsx             #      - For navigating between demos
        │
        ├── services/
        │   └── api.ts                 # <--- Central API client with functions for all demos
        │
        └── App.tsx                    # <--- Main layout and router configuration
```

## Workflow for Adding a New Demo

With this structure, adding a new "RAG Demo" (as an example) becomes a clear, repeatable process:

1.  **Backend:** Create `backend/src/demos/rag_demo/` with its `router.py` and `logic.py`.
2.  **Backend:** In `main.py`, add one line: `app.include_router(rag_demo.router)`.
3.  **Frontend:** Create the `frontend/src/demos/RAGDemoPage.tsx` component.
4.  **Frontend:** Add a new function like `fetchRAGResponse()` to `src/services/api.ts`.
5.  **Frontend:** In `App.tsx`, add a new `<Route>` for `/demos/rag-demo`.
6.  **Frontend:** In `NavBar.tsx`, add a new `<Link>` to `/demos/rag-demo`.
