import React, { useEffect } from "react";
import styles from "./ExplainModal.module.css";

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
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
          <div className={styles.message}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ExplainModal;
