import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import App from "./App.jsx";
import OpenProjects from "./components/OpenProjects.jsx";
import { ClerkProvider } from "@clerk/clerk-react";
import Auth from "./Auth.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Bounce, ToastContainer } from "react-toastify";
import Dashboard from "./Dashboard.jsx";
import LandingPage from "./LandingPage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import PrivacyPolicy from "./components/PrivacyPolicy.jsx";
import TermsOfService from "./components/TermsOfService.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <StrictMode>
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      >
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/open" element={<OpenProjects />} />
            <Route path="/new" element={<App />} />
            <Route path="/:id" element={<App />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
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
