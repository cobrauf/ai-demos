import React, { useEffect } from "react";
import styles from "./SharedModal.module.css";

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
            <h2 style={{ marginBottom: "20px", color: "var(--text-color)" }}>
              How to Play The Guessing Game
            </h2>
            <div style={{ textAlign: "left", lineHeight: "1.6" }}>
              <p>
                <strong>🎯 Goal:</strong> I've picked a mystery item, and your
                job is to guess what it is!
              </p>

              <p>
                <strong>🤔 How to Play:</strong>
              </p>
              <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
                <li>Ask me yes/no questions about the mystery item</li>
                <li>Make specific guesses when you think you know</li>
                <li>Request hints if you get stuck</li>
              </ul>

              <p>
                <strong>💡 Tips:</strong>
              </p>
              <ul style={{ paddingLeft: "20px", marginBottom: "15px" }}>
                <li>
                  Start with broad categories (living/non-living, big/small)
                </li>
                <li>Narrow down based on my answers</li>
                <li>Don't be afraid to make educated guesses!</li>
              </ul>

              <p>
                <strong>🔄 New Game:</strong> Click the "New Chat" button to
                start over with a different mystery item.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainModal;
