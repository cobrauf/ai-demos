import React from "react";
import styles from "./Toggle.module.css";
import { Link } from "react-router-dom";

interface ToggleProps {
  label: string;
  active: boolean;
  onClick?: () => void;
  to?: string;
}

const Toggle: React.FC<ToggleProps> = ({ label, active, onClick, to }) => {
  const className = `${styles.toggle} ${active ? styles.active : ""}`;

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={`${className} ${styles.link}`}>
        {label}
      </Link>
    );
  }

  return (
    <div className={className} onClick={onClick}>
      {label}
    </div>
  );
};

export default Toggle;
