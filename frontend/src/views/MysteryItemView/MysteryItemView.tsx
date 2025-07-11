import React, { useState, useEffect, useRef } from "react";
import styles from "./MysteryItemView.module.css";
import ChatMessage from "../../components/ChatMessage/ChatMessage";
import ChatInput from "../../components/ChatInput/ChatInput";
import TopBar from "../../components/TopBar/TopBar";
import NewChatIcon from "../../components/ChatInput/NewChatIcon";
import SharedModal from "../../components/SharedModal/SharedModal";
import {
  invokeMysteryItemGraph,
  resetMysteryItemSession,
} from "../../services/api";
import { Button } from "../../components/Button/Button";
import { getSessionId } from "../../utils/sessionUtils";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  sender: "ai",
  text: `Welcome to The Guessing Game! I'll start by picking a mystery thing, place, or person as the SECRET ANSWER.

Ask me questions to help you guess what it is. If you get stuck, you can ask for a hint.`,
};

const LOADING_MESSAGE: Message = {
  id: "initial-loading",
  sender: "ai",
  text: "...",
};

const getToolDisplayName = (toolName: string): string => {
  switch (toolName) {
    case "general_chat":
      return "general_chat";
    case "answer_question":
      return "answer_question";
    case "check_guess":
      return "check_guess";
    case "give_hint":
      return "give_hint";
    case "generate_mystery_item":
      return "generate_secret_answer";
    case "reset_game":
      return "reset_game";
    default:
      return `No tool call`;
  }
};

interface Message {
  id?: string;
  sender: "ai" | "user" | "tool";
  text: string;
  type?: "human" | "ai" | "tool";
  content?: string;
}

interface MysteryItemViewProps {
  onMenuClick: () => void;
  onExplainClick: () => void;
}

const MysteryItemView: React.FC<MysteryItemViewProps> = ({
  onMenuClick,
  onExplainClick,
}) => {
  const [conversation, setConversation] = useState<Message[]>([
    LOADING_MESSAGE,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId] = useState<string>(() => {
    const deviceSessionId = getSessionId("mystery_item");
    console.log("Using device-based session ID:", deviceSessionId);
    return deviceSessionId;
  });
  const messageAreaRef = useRef<HTMLDivElement>(null);
  const initialLoadHandled = useRef(false);

  useEffect(() => {
    // Show loading dots for 2 seconds, then show welcome message
    if (conversation.length === 1 && conversation[0].id === "initial-loading") {
      const timer = setTimeout(() => {
        setConversation([WELCOME_MESSAGE]);
      }, 1200);
      return () => clearTimeout(timer);
    }

    if (
      conversation.length === 1 &&
      conversation[0].id === "welcome" &&
      !initialLoadHandled.current
    ) {
      initialLoadHandled.current = true;
      handleSendMessage("page_load");
    }
  }, [conversation]);

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

    // Do not show the page_load message in the UI
    if (text !== "page_load") {
      setConversation((prev) => [...prev, userMessage]);
    }

    setIsLoading(true);

    const aiLoadingMessage: Message = {
      id: "loading",
      sender: "ai",
      text: "...",
    };
    setConversation((prev) => [...prev, aiLoadingMessage]);

    try {
      const response = await invokeMysteryItemGraph(
        sessionId, // Use the persistent device-based session ID
        text
      );

      const aiMessageText =
        response.response ||
        "Sorry, I didn't get a valid response. Please try again.";
      const toolName = response.tool_name;

      setConversation((prev) => {
        const newConversation = prev.filter(
          (msg) => msg.id !== aiLoadingMessage.id
        );

        if (toolName) {
          newConversation.push({
            id: `tool-${Date.now()}`,
            sender: "tool",
            text: `Tool call: ${toolName}`,
          });
        }

        newConversation.push({
          id: `ai-${Date.now()}-response`,
          sender: "ai",
          text: aiMessageText,
        });

        return newConversation;
      });
    } catch (error) {
      console.error("Failed to get AI response: ", error);
      const errorMessage =
        "I'm having trouble connecting to the server right now. Please try again in a moment.";
      setConversation((prev) =>
        prev.map((msg) =>
          msg.id === aiLoadingMessage.id
            ? { ...msg, text: errorMessage, id: `ai-${Date.now()}-error` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewGame = async () => {
    // Reset the backend state for the current session
    try {
      const resetResponse = await resetMysteryItemSession(sessionId);
      console.log("Backend session reset successfully");

      if (resetResponse.success && resetResponse.response) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}-reset`,
          sender: "ai",
          text: resetResponse.response,
        };

        const newConversation: Message[] = [];

        if (resetResponse.tool_name) {
          newConversation.push({
            id: `tool-${Date.now()}-reset`,
            sender: "tool",
            text: `Tool call: ${resetResponse.tool_name}`,
          });
        }

        newConversation.push(aiMessage);

        setConversation(newConversation);
        console.log(
          "New game started with AI response:",
          resetResponse.response
        );
      } else {
        // Fallback to welcome message if reset didn't return a proper response
        setConversation([WELCOME_MESSAGE]);
        console.log(
          "Reset successful but no AI response, showing welcome message"
        );
      }
    } catch (error) {
      console.error("Failed to reset backend session:", error);
      // Fallback to welcome message on error
      setConversation([WELCOME_MESSAGE]);
    }

    setIsLoading(false);
    console.log("New game started with session ID:", sessionId);
  };

  const handleNewChatClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    handleNewGame();
  };

  return (
    <div className={styles.chatContainer}>
      <TopBar
        title="The Guessing Game"
        onMenuClick={onMenuClick}
        onExplainClick={onExplainClick}
      />
      <main className={styles.messageArea} ref={messageAreaRef}>
        {conversation.map((msg, index) => (
          <ChatMessage
            key={msg.id || index}
            sender={msg.sender}
            text={msg.text}
            onExplainClick={onExplainClick}
          />
        ))}
        {/* <Button variant="cancel">cancel</Button> */}
        {/* <Button variant="disabled">disabled</Button> */}
        {/* <Button variant="icon">icon</Button> */}
        {/* <Button variant="iconCircle">iconCircle</Button> */}
      </main>
      <div className={styles.newGameButtonContainer}>
        <div className={styles.buttonAndLabel}>
          <Button
            variant="iconCircle"
            onClick={handleNewChatClick}
            disabled={isLoading}
            type="button"
            className={styles.newGameButton}
          >
            <NewChatIcon />
          </Button>
          <span className={styles.newGameButtonLabel}>New Chat</span>
        </div>
      </div>
      <footer className={styles.inputArea}>
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </footer>

      <SharedModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        message="Start new chat? This will also reset your game."
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
      />
    </div>
  );
};

export default MysteryItemView;
