import { useSignIn, useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { isLoaded, signIn } = useSignIn();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard"); // Redirect if already signed in
    }
  }, [isSignedIn, navigate]);

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;

    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/dashboard",
      });
    } catch (err) {
      console.error("Google sign-in failed", err);
    }
  };

  return (
    <div>
      <p>The current sign-in attempt status is {signIn?.status}</p>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
    </div>
  );
}
