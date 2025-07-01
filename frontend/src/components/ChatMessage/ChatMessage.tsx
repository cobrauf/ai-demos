import React from "react";
import clsx from "clsx";
import styles from "./ChatMessage.module.css";
import { useTheme } from "../../hooks/useTheme";

interface ChatMessageProps {
  sender: "ai" | "user" | "tool";
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text }) => {
  const isLoading = sender === "ai" && text === "...";

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
          text
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
