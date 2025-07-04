import React from 'react'
import { BsStars } from 'react-icons/bs';

const PrivacyPolicy = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        color: "#ddd",
        padding: "20px",
        gap: "20px",
      }}
    >
      <h1>Privacy Policy</h1>
      <label
        style={{
          backgroundColor: "#f5e2bf",
          fontSize: "15px",
          padding: "5px",
          width: "fit-content",
          borderRadius: "5px",
          color: "#000",
        }}
      >
        <BsStars />
        Last updated on 12 June, 2025
      </label>

      <p>
        This Privacy Policy explains how RookieClip
        collects, uses, and protects your information when you use our video
        editor application.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account Information:</strong> When you sign up or log in using
          Google or other identity providers, we collect your name and email
          address.
        </li>
        <li>
          <strong>Project Data:</strong> We store your edited videos, media
          files, and project metadata to provide you access to your content
          across sessions.
        </li>
        <li>
          <strong>Feedback:</strong> If you submit feedback, we collect your
          input and email address.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide and maintain the video editor functionality</li>
        <li>To save and restore your editing projects</li>
        <li>To communicate with you about updates or support</li>
        <li>To improve and analyze the performance of our services</li>
      </ul>

      <h2>3. Data Sharing</h2>
      <p>
        We do not sell or share your personal data with third parties except:
      </p>
      <ul>
        <li>
          With trusted service providers who help us operate the platform (e.g.,
          hosting or authentication)
        </li>
      </ul>

      <h2>4. Cookies and Tracking</h2>
      <p>
        We may use cookies or local storage to keep you logged in and to improve
        your experience. You can clear or block cookies in your browser
        settings.
      </p>

      <h2>5. Data Security</h2>
      <p>
        We take appropriate measures to protect your data using encryption,
        access controls, and secure servers. However, no method of transmission
        over the internet is 100% secure.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        You may request to access, delete, or update your personal data by
        contacting us at:{" "}
        <a href="mailto:support@rookieclip.com">support@rookieclip.com</a>
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        revise the "Last updated" date at the top.
      </p>
    </div>
  );
}

export default PrivacyPolicy