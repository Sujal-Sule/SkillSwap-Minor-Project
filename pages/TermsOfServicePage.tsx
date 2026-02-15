import React from "react";

const TermsOfServicePage: React.FC = () => {
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
            Terms of Service
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Last Updated: {currentDate}
          </p>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Legal agreement governing use of SkillSwap.
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-12">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using SkillSwap, you agree to be bound by these
              Terms of Service.
            </p>
            <p className="mt-4 font-medium">
              If you do not agree, you must discontinue use immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Platform Description
            </h2>
            <p>
              SkillSwap is a peer-to-peer platform enabling users to exchange
              skills through a token-based system.
            </p>
            <p className="mt-4">
              SkillSwap does not employ mentors and does not guarantee learning
              outcomes.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. User Accounts
            </h2>
            <p>Users must:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide accurate information</li>
              <li>Maintain account security</li>
              <li>Be responsible for all account activity</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts violating
              these Terms.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Token Economy
            </h2>
            <p>Tokens are:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Virtual credits within SkillSwap</li>
              <li>Earned by teaching</li>
              <li>Spent when learning</li>
              <li>Non-transferable outside the platform</li>
              <li>Non-redeemable for cash</li>
            </ul>
            <p className="mt-4">
              SkillSwap reserves the right to modify token mechanics.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Acceptable Use Policy
            </h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Harass or abuse others</li>
              <li>Post illegal or harmful content</li>
              <li>Attempt to manipulate token systems</li>
              <li>Engage in fraud or impersonation</li>
            </ul>
            <p className="mt-4">
              Violations may result in suspension or permanent removal.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Session Responsibility
            </h2>
            <p>SkillSwap:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Facilitates connections</li>
              <li>Does not control session content</li>
              <li>Is not responsible for outcomes</li>
            </ul>
            <p className="mt-4">All sessions occur at users’ own discretion.</p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Intellectual Property
            </h2>
            <p>
              The SkillSwap platform, design, branding, and code are owned by
              SkillSwap.
            </p>
            <p className="mt-4">
              Users retain ownership of content they create but grant SkillSwap
              a license to display it on the platform.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              8. Limitation of Liability
            </h2>
            <p>To the maximum extent permitted by law:</p>
            <p className="mt-4">SkillSwap shall not be liable for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Indirect damages</li>
              <li>Loss of profits</li>
              <li>Disputes between users</li>
              <li>Learning outcomes</li>
            </ul>
            <p className="mt-4 font-bold">
              Use of the platform is at your own risk.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              9. Indemnification
            </h2>
            <p>
              Users agree to indemnify SkillSwap against claims arising from:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Violation of these Terms</li>
              <li>Misuse of the platform</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              10. Termination
            </h2>
            <p>We may suspend or terminate accounts:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>For violation of policies</li>
              <li>For fraudulent behavior</li>
              <li>At our sole discretion</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              11. Governing Law
            </h2>
            <p>These Terms shall be governed by the laws of India.</p>
            <p className="mt-4">
              Disputes shall be resolved in competent courts of that
              jurisdiction.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              12. Changes to Terms
            </h2>
            <p>
              We may update these Terms at any time. Continued use constitutes
              acceptance.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              13. Contact
            </h2>
            <p>For legal inquiries:</p>
            <p className="mt-2">
              <a
                href="mailto:sujalsule31@gmail.com"
                className="text-sky-500 hover:text-sky-600 font-medium"
              >
                sujalsule31@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
