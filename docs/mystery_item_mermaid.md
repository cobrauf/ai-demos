# Mystery Item Game - LangGraph Flow

```mermaid
graph TD
    A[Start] --> B[Game Agent Node]
    B --> C[Tool Node]
    C --> D[End]

    subgraph "Available Tools"
        direction TB
        T1[generate_mystery_item<br/>Creates new secret answer]
        T1 --> T2[general_chat<br/>Handles non-game conversation]
        T2 --> T3[check_guess<br/>Validates user guesses]
        T3 --> T4[answer_question<br/>Answers without revealing secret]
        T4 --> T5[give_hint<br/>Provides hints when stuck]
        T5 --> T6[reset_game<br/>Clears game state]
    end

    subgraph "AgentState"
        S1[secret_answer: str | None]
        S2[last_activity: float]
        S3[messages: Sequence[BaseMessage]]
    end

    subgraph "Memory & Session"
        M1[MemorySaver<br/>Persistent state]
        M2[Session ID<br/>Thread management]
        M3[Automatic cleanup<br/>Inactive sessions]
    end
```

```
graph TD
    subgraph "Available Tools"
        direction TB
        T1[generate_mystery_item<br/>Creates new secret answer]
        T2[general_chat<br/>Handles non-game conversation]
        T3[check_guess<br/>Validates user guesses]
        T4[answer_question<br/>Answers without revealing secret]
        T5[give_hint<br/>Provides hints when stuck]
        T6[reset_game<br/>Clears game state]

        %% Invisible links to force vertical layout
        T1 --- T2
        T2 --- T3
        T3 --- T4
        T4 --- T5
        T5 --- T6
    end

    %% Apply a style to make these specific links invisible
    linkStyle 0 stroke: transparent, stroke-width: 0px;
    linkStyle 1 stroke: transparent, stroke-width: 0px;
    linkStyle 2 stroke: transparent, stroke-width: 0px;
    linkStyle 3 stroke: transparent, stroke-width: 0px;
    linkStyle 4 stroke: transparent, stroke-width: 0px;
```

## Flow Description

1. **Start**: User message or page load triggers the graph
2. **Game Agent Node**: Analyzes context and selects appropriate tool
3. **Tool Selection**: Based on message type and game state:
   - **generate_mystery_item**: Creates new secret when none exists
   - **general_chat**: Handles non-game conversation or ongoing game reminders
   - **check_guess**: Validates user guesses against secret answer
   - **answer_question**: Responds to questions without revealing secret
   - **give_hint**: Provides hints when user is stuck or frustrated
   - **reset_game**: Clears current game state for new game
4. **Tool Node**: Executes selected tool with LLM integration
5. **End**: Returns updated state with messages and tool metadata

## Key Features

- **Session Persistence**: State maintained across conversations via MemorySaver
- **Tool Selection**: LLM bound with `tool_choice="any"` to force tool usage
- **Message History**: Trimmed for performance, formatted for prompts
- **Page Load Handling**: Detects fresh sessions vs ongoing games
- **Cleanup**: Automatic removal of inactive sessions
