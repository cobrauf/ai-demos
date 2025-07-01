import re
import logging
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from typing import Sequence

logger = logging.getLogger(__name__)

def _parse_content_from_string(content_str: str) -> str | None:
    """
    Parses a string that may contain an AIMessage representation
    to extract the conversational content. This handles escaped quotes.
    """
    # Regex for content='...' with handling for escaped quotes
    match = re.search(r"content='((?:[^'\\]|\\.)*)'", content_str, re.DOTALL)
    if not match:
        # Regex for content="..." with handling for escaped quotes
        match = re.search(r'content="((?:[^"\\]|\\.)*)"', content_str, re.DOTALL)
    
    if match:
        content = match.group(1)
        # Unescape quotes and newlines for clean output
        return content.replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n").strip()
    
    return None

def format_history_for_prompt(messages: Sequence[BaseMessage]) -> str:
    """
    Formats the conversation history for use in the agent's system prompt.
    It filters for human messages and parses AI responses from tool messages.
    """
    # logger.info(f"--- DEBUG: Total messages in state: {len(messages)} ---")
    # for i, msg in enumerate(messages):
    #     logger.info(f"Message {i}: Type={type(msg).__name__}, Content={getattr(msg, 'content', 'NO_CONTENT')[:100]}...")

    filtered_messages = []
    for msg in messages:
        if isinstance(msg, HumanMessage):
            filtered_messages.append(msg)
        elif isinstance(msg, ToolMessage):
            if hasattr(msg, 'content') and isinstance(msg.content, str):
                parsed_content = _parse_content_from_string(msg.content)
                if parsed_content:
                    filtered_messages.append(AIMessage(content=parsed_content))
    
    # Format recent conversation history
    recent_messages = filtered_messages[-20:]
    conversation_history = "\n".join(
        f"{msg.__class__.__name__}: {msg.content}" for msg in recent_messages
    )
    logger.info(f"--- conversation_history ---")
    logger.info(conversation_history)
    return conversation_history.strip()

def extract_last_ai_response(messages: Sequence[BaseMessage]) -> str:
    """
    Extracts the last AI response from a list of messages for sending via the API.
    """
    for msg in reversed(messages):
        if isinstance(msg, ToolMessage):
            if hasattr(msg, 'content') and isinstance(msg.content, str):
                parsed_content = _parse_content_from_string(msg.content)
                if parsed_content:
                    return parsed_content
        elif isinstance(msg, AIMessage) and msg.content and msg.content.strip():
             # This case is for when the AIMessage is not from a tool call
            if not getattr(msg, 'tool_calls', None) and not msg.content.strip().startswith('{'):
                return msg.content.strip()

    return "Sorry, I couldn't generate a response."

def extract_last_tool_call(messages: Sequence[BaseMessage]) -> str | None:
    """
    Finds the most recent AIMessage with tool_calls and returns the tool name.
    """
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and getattr(msg, 'tool_calls', None):
            # Assumes one tool call per message, return the first one found
            if msg.tool_calls:
                return msg.tool_calls[0]['name']
    return None
