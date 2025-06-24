import React from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import styles from "./SideMenu.module.css";
import { Button } from "../Button/Button";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: "light" | "dark";
  setTheme?: (theme: "light" | "dark") => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
}) => {
  return (
    <div className={clsx(styles.menu, { [styles.open]: isOpen })}>
      <Button variant="icon" onClick={onClose} className={styles.closeButton}>
        &times;
      </Button>

      <nav className={styles.nav}>
        <NavLink
          to="/demos/mystery-item"
          className={({ isActive }) =>
            clsx(styles.navLink, { [styles.activeLink]: isActive })
          }
        >
          Mystery Item Game
        </NavLink>
        <NavLink
          to="/demos/placeholder"
          className={({ isActive }) =>
            clsx(styles.navLink, { [styles.activeLink]: isActive })
          }
        >
          Placeholder
        </NavLink>
      </nav>

      {theme && setTheme && (
        <div className={styles.themeSection}>
          <h3>Themes</h3>
          <div className={styles.themeButtons}>
            <Button
              variant="secondary"
              className={clsx({
                [styles.selected]: theme === "light",
              })}
              onClick={() => setTheme("light")}
            >
              Light
            </Button>
            <Button
              variant="secondary"
              className={clsx({
                [styles.selected]: theme === "dark",
              })}
              onClick={() => setTheme("dark")}
            >
              Dark
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
