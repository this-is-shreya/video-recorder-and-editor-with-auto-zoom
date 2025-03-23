import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LandingPage from './LandingPage.jsx'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import OpenProjects from "./components/OpenProjects.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/open" element={<OpenProjects />} />
        <Route path="/:id" element={<App />} />
      </Routes>
    </Router>
  </StrictMode>
);
