import re
import logging
import time
import threading
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage, SystemMessage
from typing import Sequence

logger = logging.getLogger(__name__)

def _parse_content_from_string(content_str: str) -> str | None:
    """
    Parses a string that may contain an AIMessage representation
    to extract the conversational content. This handles escaped quotes.
    """
    match = re.search(r"content='((?:[^'\\]|\\.)*)'", content_str, re.DOTALL)
    if not match:
        match = re.search(r'content="((?:[^"\\]|\\.)*)"', content_str, re.DOTALL)
    
    if match:
        content = match.group(1)
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

def trim_message_history(messages: Sequence[BaseMessage], max_messages: int = 100) -> Sequence[BaseMessage]:
    """
    Trim message history to keep only the most recent messages.
    Always preserve the first message if it's a system message.
    """
    if len(messages) <= max_messages:
        return messages
    
    system_messages = []
    other_messages = []
    
    for msg in messages:
        if isinstance(msg, SystemMessage):
            system_messages.append(msg)
        else:
            other_messages.append(msg)
    
    remaining_slots = max_messages - len(system_messages)
    if remaining_slots > 0:
        trimmed_other = other_messages[-remaining_slots:]
        return system_messages + trimmed_other
    else:
        return system_messages[:1] + other_messages[-(max_messages-1):]

def cleanup_inactive_sessions(memory, max_age_days: int = 7):
    """
    Remove sessions that haven't been active for more than max_age_days.
    """
    try:
        cutoff_time = time.time() - (max_age_days * 24 * 60 * 60)
        removed_count = 0
        
        if hasattr(memory, 'storage') and hasattr(memory.storage, 'data'):
            sessions_to_remove = []
            
            for session_key, session_data in memory.storage.data.items():
                try:
                    if isinstance(session_data, dict) and 'last_activity' in session_data:
                        if session_data['last_activity'] < cutoff_time:
                            sessions_to_remove.append(session_key)
                    elif isinstance(session_data, dict) and 'values' in session_data:
                        values = session_data['values']
                        if isinstance(values, dict) and 'last_activity' in values:
                            if values['last_activity'] < cutoff_time:
                                sessions_to_remove.append(session_key)
                except (KeyError, TypeError, AttributeError):
                    continue
            
            for session_key in sessions_to_remove:
                del memory.storage.data[session_key]
                removed_count += 1
            
            logger.info(f"Cleaned up {removed_count} inactive sessions older than {max_age_days} days")
        else:
            logger.warning("Unable to access memory storage for cleanup")
            
    except Exception as e:
        logger.error(f"Error during session cleanup: {e}")

def schedule_cleanup(memory):
    """
    Schedule periodic cleanup of inactive sessions.
    Runs every 24 hours.
    """
    def run_cleanup():
        while True:
            time.sleep(24 * 60 * 60)  # Sleep for 24 hours
            cleanup_inactive_sessions(memory)
    
    cleanup_thread = threading.Thread(target=run_cleanup, daemon=True)
    cleanup_thread.start()
    logger.info("Scheduled periodic cleanup thread started")
