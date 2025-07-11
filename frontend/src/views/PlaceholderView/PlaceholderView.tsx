import React, { useState } from "react";
import styles from "./PlaceholderView.module.css";
import TopBar from "../../components/TopBar/TopBar";
import { Button } from "../../components/Button/Button";
import ExplainModal from "../../components/SharedModal/ExplainModal";
import PlaceholderExplainContent from "../../components/SharedModal/PlaceholderExplainContent";

interface PlaceholderViewProps {
  onMenuClick: () => void;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ onMenuClick }) => {
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  const handleExplainClick = () => {
    setIsExplainModalOpen(true);
  };

  const handleExplainModalClose = () => {
    setIsExplainModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <TopBar
        title="Placeholder"
        onMenuClick={onMenuClick}
        onExplainClick={handleExplainClick}
      />
      <main className={styles.contentArea}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>Other demos coming soon...</h1>
          {/* <p className={styles.subtitle}>
            Explore various AI-powered demonstrations and interactive
            experiences.
          </p> */}
        </div>

        {/* <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3>Interactive Games</h3>
            <p>
              Experience AI-powered guessing games and puzzles that challenge
              your thinking.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3>Smart Conversations</h3>
            <p>
              Engage with intelligent chatbots and conversational AI systems.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3>Creative Tools</h3>
            <p>
              Discover AI tools for creativity, writing, and content generation.
            </p>
          </div>

          <div className={styles.featureCard}>
            <h3>Learning Experiences</h3>
            <p>
              Educational AI demonstrations that help you understand machine
              learning.
            </p>
          </div>
        </div> */}
      </main>

      {/* <footer className={styles.actionArea}>
        <div className={styles.actionButtons}>
          <Button variant="base">Get Started</Button>
          <Button variant="secondary">Learn More</Button>
        </div>
      </footer> */}

      <ExplainModal
        isOpen={isExplainModalOpen}
        onClose={handleExplainModalClose}
      >
        <PlaceholderExplainContent />
      </ExplainModal>
    </div>
  );
};

export default PlaceholderView;
