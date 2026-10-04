import { forwardRef, useId } from "react";

import "./Textarea.css";

const Textarea = forwardRef(function Textarea(
  {
    label,
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    rows = 4,
    required = false,
    disabled = false,
    readOnly = false,
    error,
    hint,
    maxLength,
    fullWidth = true,
    className = "",
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = name || generatedId;

  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;

  const classes = [
    "textarea-field",
    fullWidth ? "textarea-field-full-width" : "",
    error ? "textarea-field-error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const describedBy = [
    hint ? hintId : "",
    error ? errorId : "",
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={classes}>
      {label && (
        <label
          className="textarea-label"
          htmlFor={textareaId}
        >
          {label}

          {required && (
            <span className="textarea-required">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="textarea-control"
        {...props}
      />

      <div className="textarea-footer">
        {hint && !error ? (
          <p
            id={hintId}
            className="textarea-hint"
          >
            {hint}
          </p>
        ) : (
          <span />
        )}

        {maxLength && (
          <span className="textarea-counter">
            {String(value || "").length}/{maxLength}
          </span>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          className="textarea-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Textarea;