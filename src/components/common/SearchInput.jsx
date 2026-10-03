import { forwardRef, useId } from "react";

import "./SearchInput.css";

const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    onClear,
    placeholder = "Search...",
    disabled = false,
    fullWidth = true,
    className = "",
    ...props
  },
  ref
) {
  const generatedId = useId();

  const classes = [
    "search-input",
    fullWidth ? "search-input-full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const hasValue = String(value || "").length > 0;

  return (
    <div className={classes}>
      <label
        className="search-input-wrapper"
        htmlFor={generatedId}
      >
        <span
          className="search-input-icon"
          aria-hidden="true"
        >
          ⌕
        </span>

        <input
          ref={ref}
          id={generatedId}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input-control"
          {...props}
        />

        {hasValue && (
          <button
            type="button"
            className="search-input-clear"
            onClick={onClear}
            disabled={disabled}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </label>
    </div>
  );
});

export default SearchInput;