import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import SignInSuccess from "./components/SignInSuccess.jsx";
import AuthContext from "./AuthContext.js";
import UserDataProvider from "./UserDataProvider.jsx";

const isElectron = () => {
  return typeof window !== undefined && window.electronAPI;
};
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <UserDataProvider>
      <StrictMode>
        <Router>
          <Routes>
            {!isElectron() ? (
              <Route path="/" element={<LandingPage />} />
            ) : (
              <Route path="/" element={<Navigate to="/auth" replace />} />
            )}
            <Route path="/sign-in-success" element={<SignInSuccess />} />
            {isElectron() && <Route path="/auth" element={<Auth />} />}
            {isElectron() && (
              <Route path="/dashboard" element={<Dashboard />} />
            )}
            {isElectron() && <Route path="/open" element={<OpenProjects />} />}
            {isElectron() && <Route path="/new" element={<App />} />}
            {isElectron() && <Route path="/:id" element={<App />} />}
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
      </StrictMode>
    </UserDataProvider>
  </GoogleOAuthProvider>
);
