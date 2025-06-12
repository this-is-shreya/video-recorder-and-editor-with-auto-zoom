import React from 'react'
import { BsStars } from 'react-icons/bs';

const TermsOfService = () => {
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
      <h1>Terms of Service</h1>
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
        Welcome to RookieClip! These Terms of Service ("Terms") govern your use
        of the RookieClip video editor application ("Service") operated by us. By accessing or using the Service,
        you agree to be bound by these Terms.
      </p>

      <h2>1. Use of the Service</h2>
      <ul>
        <li>You must be at least 13 years old to use the Service.</li>
        <li>
          You agree to use the Service only for lawful purposes and in
          accordance with these Terms.
        </li>
        <li>
          You are responsible for the content you create or upload.
        </li>
      </ul>

      <h2>2. Accounts and Access</h2>
      <ul>
        <li>
          All features require you to create an account or sign in via a
          third-party provider (e.g., Google).
        </li>
        <li>
          You are responsible for maintaining the security of your account
          credentials.
        </li>
        <li>
          We may suspend or terminate your access if you violate these Terms or
          misuse the Service.
        </li>
      </ul>

      <h2>3. Content Ownership</h2>
      <ul>
        <li>You retain all rights to the content you create and upload.</li>
        <li>
          By uploading content, you grant us a limited license to store,
          process, and display it for the purpose of providing the Service.
        </li>
        <li>
          You must not upload content that is illegal, harmful, or violates the
          rights of others.
        </li>
      </ul>

      <h2>4. Prohibited Uses</h2>
      <p>You agree not to:</p>
      <ul>
        <li>
          Use the Service to infringe on others’ rights or for illegal purposes
        </li>
        <li>Upload viruses or malicious code</li>
        <li>
          Reverse engineer or attempt to gain unauthorized access to the
          platform
        </li>
      </ul>

      <h2>5. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your account and access to
        the Service at any time, with or without notice, if you violate these
        Terms.
      </p>

      <h2>6. Disclaimers</h2>
      <p>
        The Service is provided "as is" without warranties of any kind. We do
        not guarantee that the Service will be uninterrupted or error-free.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, RookieClip shall not be liable
        for any indirect, incidental, or consequential damages arising out of
        your use or inability to use the Service.
      </p>

      <h2>8. Changes to These Terms</h2>
      <p>
        We may update these Terms at any time. Continued use of the Service
        after changes means you accept the new Terms. We will update the "Last
        updated" date accordingly.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have questions about these Terms, please contact us at:{" "}
        <a href="mailto:support@rookieclip.com">support@rookieclip.com</a>
      </p>
    </div>
  );
}

export default TermsOfService