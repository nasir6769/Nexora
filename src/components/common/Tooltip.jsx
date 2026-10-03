import "./Tooltip.css";

function Tooltip({
  children,
  content,
  position = "top",
  className = "",
}) {
  if (!content) {
    return children;
  }

  const classes = [
    "tooltip",
    `tooltip-${position}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {children}

      <span
        className="tooltip-content"
        role="tooltip"
      >
        {content}
      </span>
    </span>
  );
}

export default Tooltip;