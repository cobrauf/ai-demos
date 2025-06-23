import React, { useState, useEffect, useRef } from "react";
import styles from "./MysteryItemView.module.css";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";
import TopBar from "../../components/TopBar/TopBar";

const WELCOME_MESSAGE: Message = {
  sender: "ai",
  text: "Welcome to the Mystery Item Game! I'm thinking of an object. Try to guess what it is!",
};

interface Message {
  sender: "ai" | "user";
  text: string;
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

  const handleSendMessage = (text: string) => {
    if (isLoading) return;

    const userMessage: Message = { sender: "user", text };
    setConversation((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API response
    setTimeout(() => {
      const aiResponse: Message = {
        sender: "ai",
        text: "That's an interesting guess! But not quite. Try again!",
      };
      setConversation((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleNewGame = () => {
    setConversation([WELCOME_MESSAGE]);
    setIsLoading(false);
  };

  return (
    <div className={styles.chatContainer}>
      <TopBar title="Mystery Item Game" onMenuClick={onMenuClick} />
      <main className={styles.messageArea} ref={messageAreaRef}>
        {conversation.map((msg, index) => (
          <ChatMessage key={index} sender={msg.sender} text={msg.text} />
        ))}
        {isLoading && <ChatMessage sender="loading" text="Thinking..." />}
      </main>
      <footer className={styles.inputArea}>
        <button onClick={handleNewGame} className={styles.newGameButton}>
          New Game
        </button>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default MysteryItemView;
