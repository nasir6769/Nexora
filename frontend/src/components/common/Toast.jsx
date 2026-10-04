import "./Toast.css";

function Toast({
  message,
  type = "info",
  onClose,
  title,
}) {
  if (!message) {
    return null;
  }

  const classes = [
    "toast",
    `toast-${type}`,
  ].join(" ");

  return (
    <div
      className={classes}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-content">
        {title && (
          <strong className="toast-title">
            {title}
          </strong>
        )}

        <p className="toast-message">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          className="toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Toast;