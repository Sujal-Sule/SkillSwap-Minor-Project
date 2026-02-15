import React from "react";
import { motion } from "framer-motion";

const PrivacyPolicyPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Last Updated: {currentDate}
          </p>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            How SkillSwap collects, uses, protects, and governs your data.
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Introduction
            </h2>
            <p>
              SkillSwap (“we,” “our,” “us”) is a peer-to-peer skill exchange
              platform that enables users to teach and learn through a
              token-based system.
            </p>
            <p>This Privacy Policy explains:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>What data we collect</li>
              <li>Why we collect it</li>
              <li>How we protect it</li>
              <li>Your rights regarding your data</li>
            </ul>
            <p className="mt-4">
              By using SkillSwap, you agree to this Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              2.1 Account Information
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Profile photo</li>
              <li>Bio & skills</li>
              <li>Learning preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              2.2 Platform Activity Data
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sessions scheduled</li>
              <li>Sessions completed</li>
              <li>Token transactions</li>
              <li>Reviews & ratings</li>
              <li>Connection history</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              2.3 Communication Data
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Messages exchanged between users</li>
              <li>AI Coach interactions (if applicable)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              2.4 Technical Information
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Usage analytics</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Lawful Basis for Processing (GDPR-Oriented)
            </h2>
            <p>We process data based on:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Contractual necessity (to provide the platform)</li>
              <li>
                Legitimate interest (improving experience & preventing fraud)
              </li>
              <li>User consent (where applicable)</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. How We Use Your Information
            </h2>
            <p>We use data to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Match learners and mentors</li>
              <li>Facilitate scheduling and sessions</li>
              <li>Manage token economy</li>
              <li>Improve platform performance</li>
              <li>Prevent abuse and fraud</li>
              <li>Provide AI-powered recommendations</li>
            </ul>
            <p className="mt-4 font-medium text-slate-900 dark:text-slate-100">
              We do not sell personal data.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Data Sharing & Disclosure
            </h2>
            <p>We may share data only:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>
                With service providers (hosting, analytics, infrastructure)
              </li>
              <li>If required by law</li>
              <li>To protect platform security</li>
            </ul>
            <p className="mt-4 font-medium text-slate-900 dark:text-slate-100">
              We never sell or trade user data.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Data Retention
            </h2>
            <p>We retain data:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>As long as your account is active</li>
              <li>As required for legal compliance</li>
              <li>For dispute resolution and fraud prevention</li>
            </ul>
            <p className="mt-4">Users may request deletion at any time.</p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Data Security
            </h2>
            <p>We implement:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Encrypted transmission (HTTPS)</li>
              <li>Secure authentication</li>
              <li>Access controls</li>
              <li>Database protection measures</li>
            </ul>
            <p className="mt-4">
              While no system is 100% secure, we actively safeguard your
              information.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              8. International Data Transfers
            </h2>
            <p>
              If SkillSwap expands internationally, data may be processed in
              This jurisdictions with different data laws. We will implement
              appropriate safeguards.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              9. User Rights
            </h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Access your data</li>
              <li>Correct inaccuracies</li>
              <li>Request deletion</li>
              <li>Object to processing</li>
              <li>Request data portability</li>
            </ul>
            <p className="mt-4">
              Contact:{" "}
              <a
                href="mailto:sujalsule31@gmail.com"
                className="text-sky-500 hover:text-sky-600 font-medium"
              >
                sujalsule31@gmail.com
              </a>
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              10. Children’s Privacy
            </h2>
            <p>
              SkillSwap is not intended for users under 13 years of age (or
              minimum age required in your region).
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              11. Policy Updates
            </h2>
            <p>
              We may update this policy periodically. Continued use of the
              platform constitutes acceptance of changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
