import React from "react";
import styles from "./TopBar.module.css";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick }) => {
  return (
    <header className={styles.topBar}>
      <div className={styles.menuTrigger} onClick={onMenuClick}>
        ☰
      </div>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
};

export default TopBar;
