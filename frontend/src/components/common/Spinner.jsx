import "./Spinner.css";

function Spinner({
  size = "medium",
  className = "",
}) {
  const classes = [
    "spinner",
    `spinner-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={classes}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;