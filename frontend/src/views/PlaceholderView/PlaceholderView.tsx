import React from "react";
import styles from "./PlaceholderView.module.css";
import TopBar from "../../components/TopBar/TopBar";

interface PlaceholderViewProps {
  onMenuClick: () => void;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ onMenuClick }) => {
  return (
    <div className={styles.container}>
      <TopBar title="Placeholder" onMenuClick={onMenuClick} />
      <h1>Placeholder View</h1>
    </div>
  );
};

export default PlaceholderView;
