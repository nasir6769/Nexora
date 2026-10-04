import { forwardRef, useId } from "react";

import "./Select.css";

const Select = forwardRef(function Select(
  {
    label,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    placeholder = "Select an option",
    required = false,
    disabled = false,
    error,
    hint,
    fullWidth = true,
    className = "",
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = name || generatedId;

  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  const classes = [
    "select-field",
    fullWidth ? "select-field-full-width" : "",
    error ? "select-field-error" : "",
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
          className="select-label"
          htmlFor={selectId}
        >
          {label}

          {required && (
            <span className="select-required">
              *
            </span>
          )}
        </label>
      )}

      <div className="select-wrapper">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="select-control"
          {...props}
        >
          {placeholder && (
            <option
              value=""
              disabled={required}
            >
              {placeholder}
            </option>
          )}

          {options.map((option) => {
            const optionValue =
              typeof option === "object"
                ? option.value
                : option;

            const optionLabel =
              typeof option === "object"
                ? option.label
                : option;

            return (
              <option
                key={String(optionValue)}
                value={optionValue}
                disabled={
                  typeof option === "object"
                    ? Boolean(option.disabled)
                    : false
                }
              >
                {optionLabel}
              </option>
            );
          })}
        </select>
      </div>

      {hint && !error && (
        <p
          id={hintId}
          className="select-hint"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="select-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;