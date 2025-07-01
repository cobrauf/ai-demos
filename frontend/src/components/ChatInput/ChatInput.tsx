import React, { useState, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const prevIsLoading = useRef<boolean>(isLoading);

  useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(/Mobi|Android/i.test(userAgent));
  }, []);

  useEffect(() => {
    if (prevIsLoading.current && !isLoading && !isMobile) {
      textareaRef.current?.focus();
    }
    prevIsLoading.current = isLoading;
  }, [isLoading, isMobile]);

  const doSubmit = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (isMobile) {
      // On mobile, Enter is a newline (default), and Cmd/Ctrl+Enter sends.
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        doSubmit();
      }
    } else {
      // On PC, Enter sends the message. Shift+Enter creates a newline.
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        doSubmit();
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [inputValue]);

  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        rows={1}
        className={styles.textInput}
        placeholder=""
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
      />
      <div className={styles.buttonContainer}>
        {/* <Button
          variant="iconCircle"
          onClick={onNewGame}
          disabled={isLoading}
          type="button"
        >
          <NewChatIcon />
        </Button> */}
        <Button variant="iconCircle" type="submit" disabled={isLoading}>
          <SendIcon />
        </Button>
        <div className={styles.resetButtonContainer}>
          <Button
            variant="iconCircle"
            onClick={onNewGame}
            disabled={isLoading}
            type="button"
            className={styles.resetButton}
          >
            <NewChatIcon />
          </Button>
          {/* <span className={styles.resetButtonLabel}>New</span> */}
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
