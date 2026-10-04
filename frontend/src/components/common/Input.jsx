import { forwardRef, useId } from "react";

import "./Input.css";

const Input = forwardRef(function Input(
  {
    label,
    name,
    type = "text",
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    disabled = false,
    readOnly = false,
    error,
    hint,
    fullWidth = true,
    className = "",
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = name || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const classes = [
    "input-field",
    fullWidth ? "input-field-full-width" : "",
    error ? "input-field-error" : "",
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
          className="input-label"
          htmlFor={inputId}
        >
          {label}
          {required && (
            <span className="input-required">
              *
            </span>
          )}
        </label>
      )}

      <input
        ref={ref}
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="input-control"
        {...props}
      />

      {hint && !error && (
        <p
          id={hintId}
          className="input-hint"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="input-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;