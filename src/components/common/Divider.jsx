import "./Divider.css";

function Divider({
  orientation = "horizontal",
  children,
  className = "",
}) {
  const classes = [
    "divider",
    `divider-${orientation}`,
    children ? "divider-with-content" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {children && (
        <span className="divider-content">
          {children}
        </span>
      )}
    </div>
  );
}

export default Divider;