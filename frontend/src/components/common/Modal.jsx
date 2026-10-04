import { useEffect, useId } from "react";

import "./Modal.css";

function Modal({
  isOpen = true,
  title,
  children,
  onClose,
  size = "medium",
}) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={handleBackdropClick}
    >
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          title ? titleId : undefined
        }
      >
        <div className="modal-header">
          {title && (
            <h2 id={titleId}>
              {title}
            </h2>
          )}

          {onClose && (
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          )}
        </div>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;