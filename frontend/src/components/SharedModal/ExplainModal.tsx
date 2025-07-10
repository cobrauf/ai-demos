import React, { useEffect } from "react";
import styles from "./ExplainModal.module.css";

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExplainModal: React.FC<ExplainModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContainer}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        <div className={styles.modalContent}>
          <div className={styles.message}>
            <h3 style={{ marginBottom: "20px", color: "var(--text-color)" }}>
              How to Play
            </h3>
            <div style={{ textAlign: "left", lineHeight: "1.6" }}>
              <p>
                <strong>🎯 Goal:</strong> Guess the SECRET ANSWER
              </p>

              <p>
                <strong>💡 How to Play:</strong>
              </p>
              <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
                <li>Ask questions to narrow down the answer</li>
                <li>Request hints if you get stuck</li>
                <li>You can tell the AI to restart or end the game anytime</li>
              </ul>

              <p>
                <strong> How this game was built:</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainModal;
