import React, { useState } from "react";
import App from "./App";

const LandingPage = () => {
  const [choice, setChoice] = useState(null);

  return (
    <div>
      {!choice && (
        <>
          <button onClick={() => setChoice("new")}>New</button>
          <button onClick={() => setChoice("open")}>Open</button>
        </>
      )}
      {choice === "new" && <App />}
      {choice === "open" && (
        <div>
          <button onClick={() => setChoice(null)}>Go back</button>
          <div>All your projects here</div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
