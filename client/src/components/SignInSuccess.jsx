import React, { useEffect, useState } from "react";

const SignInSuccess = () => {
  const [link, setLink] = useState("");

  useEffect(() => {
    const myURL = new URL(window.location.href);
    const code = myURL.searchParams.get("code");
    setLink("rookieclip://?code=" + code);
  }, []);
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "30px",
        color: "white",
      }}
    >
      <h1>Signed in successfully</h1>
      {link !== "" && <a href={link}>Click here to open the app</a>}
    </div>
  );
};

export default SignInSuccess;
