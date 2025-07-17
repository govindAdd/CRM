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

// Main Component
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
    if (variant === "fancy") {
      return (
        <button
          ref={ref}
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={`relative inline-block border-2 border-black bg-transparent px-8 py-4 text-left text-sm font-bold uppercase leading-tight tracking-wider text-black transition-all duration-300 hover:bg-black hover:text-white ${fullWidth ? "w-full" : ""} ${className}`}
          {...props}
        >
          <span
            className="absolute left-6 top-1/2 h-0.5 w-6 -translate-y-1/2 transform bg-black transition-all duration-300 group-hover:bg-white group-hover:w-4"
          ></span>

          <span className="block pl-8 text-[1.125em] transition-all duration-300">
            {children}
          </span>

          <span className="absolute left-2 top-[-2px] h-0.5 w-6 bg-gray-300 transition-all duration-300 group-hover:w-0"></span>
          <span className="absolute bottom-[-2px] right-8 h-0.5 w-6 bg-gray-300 transition-all duration-300 group-hover:w-0"></span>
          <span className="absolute bottom-[-2px] right-2 h-0.5 w-2 bg-gray-300 transition-all duration-300 group-hover:w-0"></span>
        </button>
      );
    }

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
    "fancy",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg", "icon"]),
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default Button;
