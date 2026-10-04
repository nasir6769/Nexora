import "./Card.css";

function Card({
  children,
  title,
  subtitle,
  actions,
  className = "",
  padding = "medium",
}) {
  const classes = [
    "card",
    `card-padding-${padding}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div className="card-heading">
            {title && (
              <h2 className="card-title">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="card-subtitle">
                {subtitle}
              </p>
            )}
          </div>

          {actions && (
            <div className="card-actions">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className="card-content">
        {children}
      </div>
    </section>
  );
}

export default Card;