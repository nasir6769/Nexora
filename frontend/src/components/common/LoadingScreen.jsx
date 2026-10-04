import Spinner from "./Spinner";

import "./LoadingScreen.css";

function LoadingScreen({
  message = "Loading...",
}) {
  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        <Spinner size="large" />

        <p className="loading-screen-message">
          {message}
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;