import "./Avatar.css";

function Avatar({
  name = "User",
  image = "",
  size = "medium",
  className = "",
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return (
    <div
      className={`common-avatar common-avatar-${size} ${className}`}
      aria-label={name}
      title={name}
    >
      {image ? (
        <img src={image} alt={name} />
      ) : (
        <span>{initials || "U"}</span>
      )}
    </div>
  );
}

export default Avatar;