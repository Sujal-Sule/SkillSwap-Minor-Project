import React from "react";

const CookiePolicyPage: React.FC = () => {
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
            Cookie Policy
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Last Updated: {currentDate}
          </p>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            SkillSwap Cookie Policy
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
              This Cookie Policy explains how SkillSwap ("we", "our", "us") uses
              cookies and similar technologies when you visit or use our
              platform.
            </p>
            <p className="mt-4">
              By continuing to use SkillSwap, you agree to the use of cookies as
              described in this policy.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit
              a website.
            </p>
            <p className="mt-4">They help:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Recognize your device</li>
              <li>Remember preferences</li>
              <li>Improve performance</li>
              <li>Enhance security</li>
              <li>Deliver analytics insights</li>
            </ul>
            <p className="mt-4">
              Cookies do not typically contain personally identifiable
              information, but they may be linked to user account data.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Types of Cookies We Use
            </h2>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              3.1 Essential Cookies (Strictly Necessary)
            </h3>
            <p>These cookies are required for the platform to function.</p>
            <p className="mt-2 font-medium">Examples:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Login authentication</li>
              <li>Session management</li>
              <li>Security tokens</li>
              <li>Account state persistence</li>
              <li>Theme preference (Dark/Light mode toggle)</li>
            </ul>
            <p className="mt-4">
              Without these, SkillSwap cannot operate properly.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              3.2 Performance & Analytics Cookies
            </h3>
            <p>These help us understand:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>How users navigate the platform</li>
              <li>Which features are used most</li>
              <li>Where performance issues occur</li>
            </ul>
            <p className="mt-2 font-medium">Examples:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Page visit tracking</li>
              <li>Error monitoring</li>
              <li>Feature engagement metrics</li>
            </ul>
            <p className="mt-4">Used solely to improve platform quality.</p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              3.3 Functional Cookies
            </h3>
            <p>These remember user preferences such as:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Language settings</li>
              <li>Dashboard layout preferences</li>
              <li>Notification settings</li>
              <li>Timezone selection</li>
            </ul>
            <p className="mt-4">
              They improve user experience but are not mandatory.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
              3.4 Future Advertising Cookies (If Ever Implemented)
            </h3>
            <p>Currently, SkillSwap does not use advertising cookies.</p>
            <p className="mt-4">
              If monetization expands in the future, this policy will be updated
              before implementation.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Third-Party Cookies
            </h2>
            <p>We may use trusted third-party services such as:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Hosting providers</li>
              <li>Analytics tools</li>
              <li>Infrastructure services</li>
            </ul>
            <p className="mt-4">
              These providers may set cookies necessary for platform performance
              and analytics.
            </p>
            <p className="mt-4 font-medium text-slate-900 dark:text-slate-100">
              We do not sell cookie data to third parties.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. How Long Cookies Are Stored
            </h2>
            <p>Cookies may be:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Session-based (deleted when browser closes)</li>
              <li>Persistent (stored for a defined duration)</li>
            </ul>
            <p className="mt-4">
              Retention varies depending on the cookie purpose.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Managing Cookies
            </h2>
            <p>You can control cookies through:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Browser settings</li>
              <li>Clearing stored cookies</li>
              <li>Blocking certain cookie categories</li>
            </ul>
            <p className="mt-4 font-bold text-slate-900 dark:text-white">
              Note:
            </p>
            <p>
              Disabling essential cookies may affect platform functionality.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. GDPR & Global Compliance
            </h2>
            <p>For users in jurisdictions such as the EU:</p>
            <p className="mt-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Request access to data collected via cookies</li>
              <li>Request deletion</li>
              <li>Withdraw consent (where applicable)</li>
            </ul>
            <p className="mt-4">
              To exercise your rights, contact:{" "}
              <a
                href="mailto:sujalsule31@gmail.com"
                className="text-sky-500 hover:text-sky-600 font-medium"
              >
                sujalsule31@gmail.com
              </a>
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              8. Cookie Consent Banner (Important Implementation Note)
            </h2>
            <p>For investor-grade compliance, SkillSwap should implement:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>A cookie consent banner on first visit</li>
              <li>
                Options: Accept All / Reject Non-Essential / Manage Preferences
              </li>
              <li>Link to this Cookie Policy</li>
              <li>Store consent preference</li>
            </ul>
            <p className="mt-4">This is required for EU GDPR alignment.</p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              9. Updates to This Policy
            </h2>
            <p>We may update this Cookie Policy periodically to reflect:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Legal changes</li>
              <li>Platform upgrades</li>
              <li>Technology changes</li>
            </ul>
            <p className="mt-4">
              Continued use of the platform constitutes acceptance of updates.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
