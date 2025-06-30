import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import styles from "./SideMenu.module.css";
import Toggle from "../Toggle/Toggle";
import { Button } from "../Button/Button";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

const DownArrow = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ verticalAlign: "middle" }}
  >
    <path
      d="M7 10L12 15L17 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
}) => {
  const [demosOpen, setDemosOpen] = useState(true);
  const [themesOpen, setThemesOpen] = useState(true);
  const location = useLocation();

  return (
    <div className={clsx(styles.menu, { [styles.open]: isOpen })}>
      <Button variant="icon" onClick={onClose} className={styles.closeButton}>
        &times;
      </Button>
      <div className={styles.dropdownSection}>
        <div
          className={styles.dropdownHeader}
          onClick={() => setDemosOpen(!demosOpen)}
        >
          <span>Demos</span>
          <span className={clsx(styles.arrow, { [styles.open]: demosOpen })}>
            <DownArrow />
          </span>
        </div>
        {demosOpen && (
          <div className={styles.dropdownContent}>
            <Toggle
              label="The Guessing Game"
              to="/demos/mystery-item"
              active={location.pathname === "/demos/mystery-item"}
              //   onClick={onClose}
            />
            <Toggle
              label="Placeholder"
              to="/demos/placeholder"
              active={location.pathname === "/demos/placeholder"}
              //   onClick={onClose}
            />
          </div>
        )}
      </div>

      <div className={styles.dropdownSection}>
        <div
          className={styles.dropdownHeader}
          onClick={() => setThemesOpen(!themesOpen)}
        >
          <span>Themes</span>
          <span className={clsx(styles.arrow, { [styles.open]: themesOpen })}>
            <DownArrow />
          </span>
        </div>
        {themesOpen && (
          <div className={styles.dropdownContent}>
            <Toggle
              label="Light"
              active={theme === "light"}
              onClick={() => setTheme("light")}
            />
            <Toggle
              label="Dark"
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SideMenu;
