import Button from "./Button";

import "./EmptyState.css";

function EmptyState({
  title = "Nothing here yet",
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
}) {
  const classes = [
    "empty-state",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {icon && (
        <div className="empty-state-icon">
          {icon}
        </div>
      )}

      <h3 className="empty-state-title">
        {title}
      </h3>

      {description && (
        <p className="empty-state-description">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button
          type="button"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;