import React, { useState } from "react";
import styles from "./ChatInput.module.css";
import SendIcon from "./SendIcon";
import { Button } from "../Button/Button";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
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
      <Button variant="iconCircle" type="submit" disabled={isLoading}>
        <SendIcon />
      </Button>
    </form>
  );
};

export default ChatInput;
