import React, { useState, useEffect, useRef } from "react";
import styles from "./MysteryItemView.module.css";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";
import TopBar from "../../components/TopBar/TopBar";
import { invokeMysteryItemGraph } from "../../services/api";
import { Button } from "../../components/Button/Button";

const WELCOME_MESSAGE: Message = {
  sender: "ai",
  text: "Welcome to the Mystery Item Game!",
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
        "test_session_invoke",
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

  const handleNewGame = () => {
    // Note: This only resets the frontend conversation.
    // A new session ID would be needed to truly start a new game on the backend.
    // For now, we just clear the view.
    setConversation([WELCOME_MESSAGE]);
    setIsLoading(false);
  };

  return (
    <div className={styles.chatContainer}>
      <TopBar title="Mystery Item Game" onMenuClick={onMenuClick} />
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
