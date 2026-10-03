import { useEffect, useRef, useState } from "react";

import "./Dropdown.css";

function Dropdown({
  trigger,
  children,
  align = "right",
  className = "",
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) {
      return;
    }

    setIsOpen((current) => !current);
  };

  const handleContentClick = (event) => {
    if (
      event.target.closest(
        "[data-dropdown-close]"
      )
    ) {
      setIsOpen(false);
    }
  };

  const classes = [
    "dropdown",
    `dropdown-${align}`,
    isOpen ? "dropdown-open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={dropdownRef}
      className={classes}
    >
      <div
        className="dropdown-trigger"
        onClick={handleToggle}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className="dropdown-menu"
          onClick={handleContentClick}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default Dropdown;