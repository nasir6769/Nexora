import "./Button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  fullWidth = false,
  className = "",
  as: Component = "button",
  ...props
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? "btn-full-width" : "",
    loading ? "btn-loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const componentProps =
    Component === "button"
      ? {
          type,
          disabled: disabled || loading,
        }
      : {};

  return (
    <Component
      className={classes}
      {...componentProps}
      {...props}
    >
      {loading ? (
        <span className="btn-loading-content">
          <span className="btn-spinner" />
          <span>Loading...</span>
        </span>
      ) : (
        children
      )}
    </Component>
  );
}

export default Button;