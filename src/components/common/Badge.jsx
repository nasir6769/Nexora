import "./Badge.css";

function Badge({
  children,
  variant = "default",
  size = "medium",
  className = "",
}) {
  const classes = [
    "badge",
    `badge-${variant}`,
    `badge-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {children}
    </span>
  );
}

export default Badge;