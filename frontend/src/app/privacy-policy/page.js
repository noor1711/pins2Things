import React from "react";
import styles from "./PrivacyPolicy.module.css"; // Import CSS Module

// Optional: Metadata for this specific page
export const metadata = {
  title: "Privacy Policy - Pins2Things",
  description:
    "Understand how Pins2Things collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container">
      {" "}
      {/* Use global container class for max-width */}
      <h1 className={styles.policyTitle}>Privacy Policy for Pins2Things</h1>
      <p className={styles.lastUpdated}>
        <strong>Last Updated:</strong> July 3, 2025
      </p>
      <hr />
      <h2>1. Introduction</h2>
      <p>
        Welcome to Pins2Things. We are committed to protecting your privacy and
        providing a safe and effective experience with our application. This
        Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our Pins2Things application.
      </p>
      <p>
        By using the App, you agree to the terms of this Privacy Policy. If you
        do not agree with the terms of this Privacy Policy, please do not access
        or use the App.
      </p>
      <hr />
      <h2>2. Information We Collect</h2>
      <p>
        We collect information to provide and improve our services to you. The
        types of information we collect include:
      </p>
      <h3>Information You Provide Directly:</h3>
      <ul>
        <li>
          <strong>Email Address:</strong> We collect your email address when you
          interact with our App, for purposes such as communication related to
          your use of the App or to send you recommendations if you opt-in for
          email delivery.
        </li>
      </ul>
      <h3>Public Pinterest Board Data (User-Provided URL):</h3>
      <p>
        When you use Pins2Things, you will provide a public URL to a Pinterest
        board. We will then access and process the publicly available pins from
        that specific board URL to generate product recommendations.
      </p>
      <div className={styles.importantNotes}>
        <p>
          <strong>Important Notes Regarding Pinterest Data:</strong>
        </p>
        <ul>
          <li>
            We do NOT require or collect any Pinterest account login credentials
            (usernames or passwords) from you.
          </li>
          <li>
            We do NOT connect to your private Pinterest account or access any
            data from Pinterest beyond what is publicly available at the URL you
            provide.
          </li>
          <li>
            We do NOT store any Pinterest data on our servers. The publicly
            available data accessed from your designated Pinterest board URL is
            processed temporarily in real-time solely to generate product
            recommendations and is immediately discarded thereafter. We do not
            retain copies of these pins, board content, or any other
            Pinterest-related information once the recommendation process is
            complete.
          </li>
        </ul>
      </div>
      <h3>Automatically Collected Information (Usage Data):</h3>
      <ul>
        <li>
          <strong>Vercel Analytics:</strong> We use Vercel Analytics to collect
          general, non-personal information about your usage of the App. This
          helps us understand how the App is being used, identify areas for
          improvement, and monitor its performance. This data may include
          information such as your device type, browser type, operating system,
          pages viewed within the App, and the time spent on those pages. This
          information is anonymized and used for analytical purposes only.
        </li>
      </ul>
      <hr />
      <h2>3. How We Use Your Information</h2>
      <p>We use the information we collect for the following purposes:</p>
      <ul>
        <li>
          To provide and operate the core functionality of the App, which
          includes processing publicly available pins from your provided
          Pinterest board URL to generate and display product recommendations.
        </li>
        <li>
          To improve, personalize, and enhance your experience with the App.
        </li>
        <li>
          To understand and analyze how you use the App (through Vercel
          Analytics) to develop new features and services.
        </li>
        <li>
          To communicate with you regarding App updates, support, or other
          service-related messages to your provided email address.
        </li>
        <li>
          To maintain the security and integrity of our App and prevent fraud or
          misuse.
        </li>
      </ul>
      <p className={styles.noteHighlight}>
        We do not use any collected data for marketing or advertising purposes.
      </p>
      <hr />
      <h2>4. How We Share Your Information</h2>
      <p>
        We are committed to keeping your information confidential. We will not
        sell, rent, or lease your personal information or the public Pinterest
        data we process to third parties. We may share information only in the
        following limited circumstances:
      </p>
      <ul>
        <li>
          <strong>With Service Providers:</strong> We may share your information
          with third-party vendors and service providers who perform services
          for us or on our behalf, such as hosting (Vercel), analytics (Vercel
          Analytics), and email delivery. These service providers are obligated
          to protect your information and are prohibited from using it for any
          other purpose.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may disclose your information
          if required to do so by law or in response to valid requests by public
          authorities (e.g., a court order or government agency).
        </li>
        <li>
          <strong>Business Transfers:</strong> In the event of a merger,
          acquisition, or sale of all or a portion of our assets, your
          information may be transferred as part of that transaction. We will
          notify you via email and/or a prominent notice on our App of any
          change in ownership or uses of your personal information.
        </li>
        <li>
          <strong>Aggregate or Anonymized Data:</strong> We may share aggregated
          or de-identified data (which cannot identify you individually) with
          third parties for research, analytical, or statistical purposes.
        </li>
      </ul>
      <hr />
      <h2>5. Data Retention</h2>
      <p>
        As stated, we do not store any Pinterest data that we access for
        generating recommendations; it is processed temporarily and discarded.
        We retain your email address for as long as necessary to provide you
        with the App&apos;s services or as required by law.
      </p>
      <hr />
      <h2>6. Your Data Protection Rights</h2>
      <p>
        Depending on your location and applicable privacy laws (e.g., GDPR,
        CCPA), you may have the following rights regarding your personal
        information:
      </p>
      <ul>
        <li>
          <strong>Right to Access:</strong> You have the right to request access
          to the personal data we hold about you.
        </li>
        <li>
          <strong>Right to Rectification:</strong> You have the right to request
          correction of any inaccurate or incomplete data we hold about you.
        </li>
        <li>
          <strong>Right to Erasure (Right to Be Forgotten):</strong> You have
          the right to request that we delete your personal data under certain
          conditions.
        </li>
        <li>
          <strong>Right to Object:</strong> You have the right to object to our
          processing of your personal data under certain conditions.
        </li>
        <li>
          <strong>Right to Restriction of Processing:</strong> You have the
          right to request that we restrict the processing of your personal data
          under certain conditions.
        </li>
        <li>
          <strong>Right to Data Portability:</strong> You have the right to
          request that we transfer the data that we have collected to another
          organization, or directly to you, under certain conditions.
        </li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at{" "}
        <a href="mailto:noornimrat00@gmail.com" className={styles.contactEmail}>
          noornimrat00@gmail.com
        </a>
        . We will respond to your request within the timeframe required by
        applicable law.
      </p>
      <hr />
      <h2>7. Children&apos;s Privacy</h2>
      <p>
        Our App is intended for users who meet the minimum age requirements for
        using Pinterest, which typically means users must be at least 13 years
        old. We do not knowingly collect personal information from children
        under this age. If we become aware that we have collected personal
        information from a child under the minimum age without parental consent,
        we will take steps to remove that information from our records.
      </p>
      <hr />
      <h2>8. Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the &quot;Last Updated&quot; date at the top. You are advised
        to review this Privacy Policy periodically for any changes. Changes to
        this Privacy Policy are effective when they are posted on this page.
      </p>
      <hr />
      <h2>9. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at:
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:noornimrat00@gmail.com" className={styles.contactEmail}>
          noornimrat00@gmail.com
        </a>
      </p>
    </div>
  );
}
