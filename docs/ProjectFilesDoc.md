## General structure

```
.
├── backend/
│   ├── src/
│   │   ├── routers/                   # <--- API route handlers
│   │   │   ├── mystery_item_router.py
│   │   │   └── (more routers...)
│   │   │
│   │   ├── services/                  # <--- Business logic & LangGraph agents
│   │   │   ├── mystery_item_service.py
│   │   │   └── (more services...)
│   │   │
│   │   ├── utils/                     # <--- Helper functions & prompts
│   │   │   ├── mystery_item_helpers.py
│   │   │   └── (more utils...)
│   │   │
│   │   └── config/                    # <--- Configuration files
│   │       └── llm_config.py
│   │
│   ├── main.py                        # <--- FastAPI app with router includes
│   └── langgraph.json                 # <--- LangGraph configuration
│
└── frontend/
    └── src/
        ├── views/                     # <--- Page-level components
        │   ├── MysteryItemView/
        │   │   ├── MysteryItemView.tsx
        │   │   └── MysteryItemView.module.css
        │   └── (more views...)
        │
        ├── components/                # <--- Reusable React components
        │   ├── Button/
        │   │   ├── Button.tsx
        │   │   └── Button.module.css
        │   └── (and more...)
        │
        ├── services/
        │   └── api.ts                 # <--- Centralized API client
        │
        ├── hooks/                     # <--- Custom React hooks
        │   ├── useTheme.ts
        │   └── (more hooks...)
        │
        └── App.tsx                    # <--- Main router & layout
```

## Workflow for Adding a New Demo

1.  **Backend:** Create `backend/src/routers/rag_router.py` and `backend/src/services/rag_service.py`.
2.  **Backend:** In `main.py`, add one line: `app.include_router(rag_router.router)`.
3.  **Frontend:** Create the `frontend/src/views/RAGView/` directory with component and styles.
4.  **Frontend:** Add a new function like `fetchRAGResponse()` to `src/services/api.ts`.
5.  **Frontend:** In `App.tsx`, add a new `<Route>` for `/demos/rag`.
6.  **Frontend:** Update navigation components to include the new demo link.
