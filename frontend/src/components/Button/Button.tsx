import { type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";
import clsx from "clsx";

type ButtonVariant =
  | "base"
  | "cancel"
  | "gradient"
  | "secondary"
  | "icon"
  | "theme"
  | "iconCircle";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  className,
  variant = "base",
  children,
  ...props
}: ButtonProps) {
  const buttonClasses = clsx(
    styles.button, // Always apply the base style
    styles[variant], // Apply the variant style based on the prop
    className // Allow passing in extra custom classes from the parent
  );

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}
