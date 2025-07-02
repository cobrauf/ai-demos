import React, { useState, useEffect, useRef } from "react";
import styles from "./MysteryItemView.module.css";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";
import TopBar from "../../components/TopBar/TopBar";
import NewChatIcon from "../../components/ChatInput/NewChatIcon";
import SharedModal from "../../components/SharedModal/SharedModal";
import {
  invokeMysteryItemGraph,
  resetMysteryItemSession,
} from "../../services/api";
import { Button } from "../../components/Button/Button";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  sender: "ai",
  text: `Welcome to The Guessing Game! I'll pick a mystery thing, place, or person as the secret answer.

You can ask me questions to help you narrow down the secret answer. If you get stuck, you can ask for a hint.

Let me know when you're ready to start!`,
};

const getToolDisplayName = (toolName: string): string => {
  switch (toolName) {
    case "general_chat":
      return "general_chat";
    case "answer_question":
      return "answer_question";
    case "check_guess":
      return "check_guess";
    case "give_hint":
      return "give_hint";
    case "generate_mystery_item":
      return "generate_secret_answer";
    case "reset_game":
      return "reset_game";
    default:
      return `No tool call`;
  }
};

interface Message {
  id?: string;
  sender: "ai" | "user" | "tool";
  text: string;
  type?: "human" | "ai" | "tool";
  content?: string;
}

interface MysteryItemViewProps {
  onMenuClick: () => void;
}

const MysteryItemView: React.FC<MysteryItemViewProps> = ({ onMenuClick }) => {
  const [conversation, setConversation] = useState<Message[]>([
    WELCOME_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    // Get or create a persistent session ID for today
    const today = new Date().toDateString();
    const sessionKey = `mystery_game_session_${today}`;

    const existingSession = localStorage.getItem(sessionKey);
    if (existingSession) {
      console.log("Resuming existing session:", existingSession);
      return existingSession;
    }

    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem(sessionKey, newSessionId);
    console.log("Created new daily session:", newSessionId);

    for (let i = 1; i <= 7; i++) {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - i);
      const oldSessionKey = `mystery_game_session_${oldDate.toDateString()}`;
      localStorage.removeItem(oldSessionKey);
    }

    return newSessionId;
  });
  const messageAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the message area
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    setConversation((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const aiLoadingMessage: Message = {
      id: "loading",
      sender: "ai",
      text: "...",
    };
    setConversation((prev) => [...prev, aiLoadingMessage]);

    try {
      const response = await invokeMysteryItemGraph(
        sessionId, // Use the persistent daily session ID
        text
      );

      const aiMessageText =
        response.response ||
        "Sorry, I didn't get a valid response. Please try again.";
      const toolName = response.tool_name;

      console.log("AI response:", aiMessageText);
      console.log("Tool name:", toolName);

      setConversation((prev) => {
        const newConversation = prev.filter(
          (msg) => msg.id !== aiLoadingMessage.id
        );

        if (toolName) {
          newConversation.push({
            id: `tool-${Date.now()}`,
            sender: "tool",
            text: `Tool call: ${toolName}`,
          });
        }

        newConversation.push({
          id: `ai-${Date.now()}-response`,
          sender: "ai",
          text: aiMessageText,
        });

        return newConversation;
      });
    } catch (error) {
      console.error("Failed to get AI response: ", error);
      const errorMessage =
        "I'm having trouble connecting to the server right now. Please try again in a moment.";
      setConversation((prev) =>
        prev.map((msg) =>
          msg.id === aiLoadingMessage.id
            ? { ...msg, text: errorMessage, id: `ai-${Date.now()}-error` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewGame = async () => {
    // First reset the backend state for the current session
    try {
      await resetMysteryItemSession(sessionId);
      console.log("Backend session reset successfully");
    } catch (error) {
      console.error("Failed to reset backend session:", error);
    }

    // Generate a completely new session ID and update storage
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const today = new Date().toDateString();
    const sessionKey = `mystery_game_session_${today}`;

    localStorage.setItem(sessionKey, newSessionId);
    setSessionId(newSessionId);
    setConversation([WELCOME_MESSAGE]);
    setIsLoading(false);
    console.log("New game started with fresh session ID:", newSessionId);
  };

  const handleNewChatClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    handleNewGame();
  };

  return (
    <div className={styles.chatContainer}>
      <TopBar title="The Guessing Game" onMenuClick={onMenuClick} />
      <main className={styles.messageArea} ref={messageAreaRef}>
        {conversation.map((msg, index) => (
          <ChatMessage
            key={msg.id || index}
            sender={msg.sender}
            text={msg.text}
          />
        ))}
        {/* <Button variant="cancel">cancel</Button> */}
        {/* <Button variant="disabled">disabled</Button> */}
        {/* <Button variant="icon">icon</Button> */}
        {/* <Button variant="iconCircle">iconCircle</Button> */}
      </main>
      <div className={styles.newGameButtonContainer}>
        <div className={styles.buttonAndLabel}>
          <Button
            variant="iconCircle"
            onClick={handleNewChatClick}
            disabled={isLoading}
            type="button"
            className={styles.newGameButton}
          >
            <NewChatIcon />
          </Button>
          <span className={styles.newGameButtonLabel}>New Chat</span>
        </div>
      </div>
      <footer className={styles.inputArea}>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>

      <SharedModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        message="Start new chat? This will also reset your game."
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default MysteryItemView;
