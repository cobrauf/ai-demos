import React, { useState } from "react";
import styles from "./ChatInput.module.css";
import SendIcon from "./SendIcon";
import NewChatIcon from "./NewChatIcon";
import { Button } from "../Button/Button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onNewGame: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onNewGame,
  isLoading,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.textInput}
        placeholder="Type your guess..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
      />
      <div className={styles.buttonContainer}>
        <Button
          variant="iconCircle"
          onClick={onNewGame}
          disabled={isLoading}
          type="button"
        >
          <NewChatIcon />
        </Button>
        <Button variant="iconCircle" type="submit" disabled={isLoading}>
          <SendIcon />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
