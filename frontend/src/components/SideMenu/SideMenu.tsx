import React from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import styles from "./SideMenu.module.css";

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
      <button onClick={onClose} className={styles.closeButton}>
        &times;
      </button>

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
            <button
              className={clsx(styles.themeButton, {
                [styles.selected]: theme === "light",
              })}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
            <button
              className={clsx(styles.themeButton, {
                [styles.selected]: theme === "dark",
              })}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideMenu;
