import React, { useEffect } from "react";
import styles from "./SharedModal.module.css";
import { Button } from "../Button/Button";

interface SharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

const SharedModal: React.FC<SharedModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
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
          <p className={styles.message}>{message}</p>
          <div className={styles.buttonGroup}>
            <Button variant="cancel" onClick={onClose}>
              {cancelButtonText}
            </Button>
            <Button variant="base" onClick={onConfirm}>
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedModal;
