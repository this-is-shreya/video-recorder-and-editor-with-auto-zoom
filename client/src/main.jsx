import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LandingPage from "./LandingPage.jsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import OpenProjects from "./components/OpenProjects.jsx";
import ExportPreview from "./components/export/ExportPreview.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import Auth from "./Auth.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Bounce, ToastContainer } from "react-toastify";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <StrictMode>
      <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Router>
        <Routes>
          <Route path="/" element={<h1>THIS IS THE MAIN LANDING PAGE</h1>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<LandingPage />} />
          <Route path="/open" element={<OpenProjects />} />
          <Route path="/:id" element={<App />}>
            <Route path="export" element={<ExportPreview />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
      </ClerkProvider>
    </StrictMode>
  </GoogleOAuthProvider>
);
