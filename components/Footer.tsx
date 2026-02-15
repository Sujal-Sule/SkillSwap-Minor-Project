import React from "react";
import Logo from "./Logo";
import { Link } from "react-router-dom";

interface FooterProps {
  scrollToSection?: (id: string) => void;
}

const Footer: React.FC<FooterProps> = ({ scrollToSection }) => (
  <footer className="py-7 px-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <Logo size={60} className="mb-4" />
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            Built by learners. For Learners.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
            Platform
          </h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              {scrollToSection ? (
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="hover:text-sky-500 transition-colors text-left"
                >
                  How It Works
                </button>
              ) : (
                <Link
                  to="/#how-it-works"
                  className="hover:text-sky-500 transition-colors"
                >
                  How It Works
                </Link>
              )}
            </li>
            <li>
              {scrollToSection ? (
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-sky-500 transition-colors text-left"
                >
                  Features
                </button>
              ) : (
                <Link
                  to="/#features"
                  className="hover:text-sky-500 transition-colors"
                >
                  Features
                </Link>
              )}
            </li>
            <li>
              {scrollToSection ? (
                <button
                  onClick={() => scrollToSection("skills")}
                  className="hover:text-sky-500 transition-colors text-left"
                >
                  Browse Skills
                </button>
              ) : (
                <Link
                  to="/#skills"
                  className="hover:text-sky-500 transition-colors"
                >
                  Browse Skills
                </Link>
              )}
            </li>
          </ul>
        </div>

        {/* Community */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
            Community
          </h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link
                to="/roadmap"
                className="hover:text-sky-500 transition-colors"
              >
                Roadmap
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-sky-500 transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/community"
                className="hover:text-sky-500 transition-colors"
              >
                Community
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
            Legal
          </h4>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <Link
                to="/privacy-policy"
                className="hover:text-sky-500 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/cookie-policy"
                className="hover:text-sky-500 transition-colors"
              >
                Cookie Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms-of-service"
                className="hover:text-sky-500 transition-colors"
              >
                Terms of Service
              </Link>
            </li>
            <li>
              <a
                href="mailto:sujalsule31@gmail.com?subject=SkillSwap%20Legal%20Inquiry"
                className="hover:text-sky-500 transition-colors"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
