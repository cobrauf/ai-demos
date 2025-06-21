import { type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "danger" | "success" | "warning";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = clsx(
    styles.base, // Always apply the base style
    styles[variant], // Apply the variant style based on the prop (e.g., styles.primary)
    className // Allow passing in extra custom classes from the parent
  );

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
