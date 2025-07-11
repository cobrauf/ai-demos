import React from "react";
import clsx from "clsx";
import styles from "./ChatMessage.module.css";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "../Button/Button";

interface ChatMessageProps {
  sender: "ai" | "user" | "tool";
  text: string;
  onExplainClick?: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  text,
  onExplainClick,
}) => {
  const isLoading = sender === "ai" && text === "...";
  const isWelcomeMessage = text.includes("Welcome to");

  return (
    <div
      className={clsx(styles.messageContainer, {
        [styles.ai]: sender === "ai" && !isLoading,
        [styles.user]: sender === "user",
        [styles.tool]: sender === "tool",
        [styles.loading]: isLoading,
      })}
    >
      <div className={styles.bubble}>
        {isLoading ? (
          <div className={styles.dots}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <div>
            <div>{text}</div>
            {isWelcomeMessage && onExplainClick && (
              <div style={{ marginTop: "12px" }}>
                <Button variant="insidechat" onClick={onExplainClick}>
                  How this was built
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
