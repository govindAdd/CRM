import React, { forwardRef } from "react";
import PropTypes from "prop-types";

const VARIANTS = {
  default: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive: "bg-destructive text-white hover:bg-destructive/90",
  outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
  link: "underline-offset-4 hover:underline text-primary",
};

const SIZES = {
  sm: "h-9 px-3 rounded-md text-sm",
  md: "h-10 px-4 py-2 rounded-md text-sm",
  lg: "h-11 px-8 rounded-md text-base",
  icon: "h-10 w-10 p-0 rounded-md",
};

const Button = forwardRef(
  (
    {
      type = "button",
      onClick,
      disabled = false,
      variant = "default",
      size = "md",
      className = "",
      fullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    // 🌈 Gradient Variant
    if (variant === "gradient") {
      return (
        <button
          ref={ref}
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={`
            relative inline-flex items-center justify-center overflow-hidden rounded-full 
            px-8 py-3 font-semibold tracking-wide transition-all duration-700 ease-out
            text-white bg-gradient-to-r from-purple-500 via-teal-400 to-yellow-300
            hover:from-yellow-300 hover:via-purple-500 hover:to-teal-400
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            disabled:opacity-50 disabled:pointer-events-none
            ${fullWidth ? "w-full" : ""}
            ${className}
          `}
          {...props}
        >
          <span
            className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-teal-400 to-yellow-300 blur-xl opacity-30 hover:opacity-60 transition-opacity duration-700"
            aria-hidden="true"
          ></span>
          <span className="relative z-10">{children}</span>
        </button>
      );
    }

    // 🧱 Default Tailwind Variants
    const variantClass = VARIANTS[variant] || VARIANTS.default;
    const sizeClass = SIZES[size] || SIZES.md;

    const classes = [
      "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
      variantClass,
      sizeClass,
      fullWidth ? "w-full" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

Button.propTypes = {
  type: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf([
    "default",
    "secondary",
    "destructive",
    "outline",
    "ghost",
    "link",
    "gradient", // 🌈 New variant
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg", "icon"]),
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default Button;
