import React, { useState, useEffect, useRef } from "react";
import styles from "./MysteryItemView.module.css";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";
import TopBar from "../../components/TopBar/TopBar";
import {
  invokeMysteryItemGraph,
  resetMysteryItemSession,
} from "../../services/api";
import { Button } from "../../components/Button/Button";

const WELCOME_MESSAGE: Message = {
  sender: "ai",
  text: `Welcome detective! I'll pick a mystery thing, place, or person.

Ask me questions to narrow it down until you can guess it. Let me know when you're ready to start!`,
};

interface Message {
  id?: string;
  sender: "ai" | "user";
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
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: "...",
    };
    setConversation((prev) => [...prev, aiLoadingMessage]);

    try {
      const response = await invokeMysteryItemGraph(
        sessionId, // Use the persistent daily session ID
        text
      );

      // Backend now returns a simple {response: "..."} format
      const aiMessageText =
        response.response ||
        "Sorry, I didn't get a valid response. Please try again.";

      console.log("AI response:", aiMessageText);

      setConversation((prev) =>
        prev.map((msg) =>
          msg.id === aiLoadingMessage.id
            ? { ...msg, text: aiMessageText, id: `ai-${Date.now()}-response` }
            : msg
        )
      );
    } catch (error) {
      console.error("Failed to get AI response: ", error);
      const errorMessage =
        "I'm having trouble connecting to the game server right now. Please try again in a moment.";
      setConversation((prev) =>
        prev.map((msg) =>
          msg.id === aiLoadingMessage.id ? { ...msg, text: errorMessage } : msg
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
      <footer className={styles.inputArea}>
        <ChatInput
          onSendMessage={handleSendMessage}
          onNewGame={handleNewGame}
          isLoading={isLoading}
        />
      </footer>
    </div>
  );
};

export default MysteryItemView;
