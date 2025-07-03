# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a full-stack AI demos project with a React + TypeScript frontend and Python FastAPI backend. The project contains LangGraph-based AI agents, particularly a mystery item guessing game.

### Backend Architecture
- **FastAPI** server with **LangGraph** state management
- **LangChain** for LLM integration (OpenAI, Google GenAI)
- **LangGraph** for conversational AI workflows with memory persistence
- State-based agent architecture using TypedDict for type safety

### Frontend Architecture  
- **React 19** with **TypeScript** and **Vite**
- **React Router** for navigation between demo pages
- **CSS Modules** for component-specific styling
- **Axios** for API communication

### Key Components
- **Mystery Item Game**: LangGraph-based guessing game with tools for generating secrets, checking guesses, answering questions, and giving hints
- **State Management**: LangGraph MemorySaver for persistent conversations across sessions
- **Theme System**: Dark/light mode toggle with CSS custom properties

## Common Development Commands

### Backend
```bash
# Start backend server
cd backend
python main.py

# Install dependencies
pip install -r requirements.txt

# Run LangGraph server (if needed)
langgraph up
```

### Frontend
```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Development Notes

### Cursor Rules
- Always refer to `docs/ProjectDoc.md` for project structure
- Preserve all `//for dev` comments and development/testing code
- Don't remove development imports or test endpoints

### Backend Specifics
- **Main entry**: `backend/main.py` includes routers
- **LangGraph config**: `backend/langgraph.json` defines the mystery game graph
- **Agent state**: Uses TypedDict with game_started, secret_answer, and messages
- **Tools**: 6 main tools including generate_mystery_item, check_guess, answer_question, general_chat, reset_game, give_hint
- **Memory**: MemorySaver for session persistence

### Frontend Specifics
- **Routing**: App.tsx defines routes with default redirect to /demos/mystery-item
- **Components**: CSS Modules pattern with separate .module.css files
- **API**: Centralized in `src/services/api.ts`
- **Views**: MysteryItemView is the main game interface

### Session Management
- Backend uses session IDs for LangGraph state persistence
- Frontend manages session state for chat history
- Reset functionality available through both UI and API

## File Organization
- `backend/src/routers/` - FastAPI route handlers
- `backend/src/services/` - LangGraph agents and business logic  
- `backend/src/utils/` - Helper functions and prompts
- `frontend/src/components/` - Reusable React components
- `frontend/src/views/` - Page-level components
- `frontend/src/services/` - API client code