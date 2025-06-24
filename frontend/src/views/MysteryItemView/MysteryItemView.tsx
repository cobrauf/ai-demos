import React, { useState, useEffect, useRef } from "react";
import styles from "./MysteryItemView.module.css";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";
import TopBar from "../../components/TopBar/TopBar";
import { Button } from "../../components/Button/Button";
import { chatMysteryItem, invokeMysteryItemGraph } from "../../services/api";

const WELCOME_MESSAGE: Message = {
  sender: "ai",
  text: "Welcome to the Mystery Item Game! I'm thinking of an object. Try to guess what it is!",
};

interface Message {
  id?: string;
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

  const handleApiCall = async (
    apiCall: () => Promise<any>,
    userMessage?: Message
  ) => {
    if (isLoading) return;

    const aiLoadingMessage: Message = {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: "...",
    };

    setConversation((prev) => [
      ...prev,
      ...(userMessage ? [userMessage] : []),
      aiLoadingMessage,
    ]);
    setIsLoading(true);

    try {
      const response = await apiCall();
      const aiMessageText =
        response?.message_history?.[0]?.content ??
        "Sorry, I didn't get a valid response. Please try again.";

      setConversation((prev) =>
        prev.map((msg) =>
          msg.id === aiLoadingMessage.id ? { ...msg, text: aiMessageText } : msg
        )
      );
    } catch (error) {
      console.error("Failed to get AI response: ", error);
      const errorMessage =
        "I'm having trouble connecting to an LLM model right now. Please try again in a moment.";
      setConversation((prev) =>
        prev.map((msg) =>
          msg.id === aiLoadingMessage.id ? { ...msg, text: errorMessage } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };
    await handleApiCall(
      () => chatMysteryItem("test_session", text),
      userMessage
    );
  };

  const handleStartGame = async () => {
    await handleApiCall(() =>
      invokeMysteryItemGraph("test_session_invoke", "start game")
    );
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
          <ChatMessage
            key={msg.id || index}
            sender={msg.sender}
            text={msg.text}
          />
        ))}
        <Button variant="base" onClick={handleStartGame}>
          Start Game
        </Button>
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
