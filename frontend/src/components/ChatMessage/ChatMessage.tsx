import React from "react";
import clsx from "clsx";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  sender: "ai" | "user" | "loading";
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text }) => {
  return (
    <div
      className={clsx(styles.messageContainer, {
        [styles.ai]: sender === "ai",
        [styles.user]: sender === "user",
        [styles.loading]: sender === "loading",
      })}
    >
      <div className={styles.bubble}>{text}</div>
    </div>
  );
};

export default ChatMessage;
