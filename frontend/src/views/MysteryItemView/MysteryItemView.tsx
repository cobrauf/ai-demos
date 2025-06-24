import React, { useState, useEffect, useRef } from "react";
import styles from "./MysteryItemView.module.css";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";
import TopBar from "../../components/TopBar/TopBar";
import { Button } from "../../components/Button/Button";
import { invokeMysteryItem } from "../../services/api";

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

  const handleSendMessage = async (text: string) => {
    if (isLoading) return;

    const userMessage: Message = { sender: "user", text };
    setConversation((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await invokeMysteryItem("test_session", text); // for dev
      const aiMessage =
        response?.message_history?.[0]?.content ??
        "Sorry, I didn't get a valid response. Please try again.";
      const aiResponse: Message = {
        sender: "ai",
        text: aiMessage,
      };
      setConversation((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Failed to get AI response: ", error);
      setConversation((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
        {/* <Button variant="base">base</Button> */}
        {/* <Button variant="secondary">secondary</Button> */}
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
