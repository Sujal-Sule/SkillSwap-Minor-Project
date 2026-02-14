import React from "react";

const MentorshipIllustration: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <img
      src="/dashboard-illustration.png"
      alt="Mentorship Illustration"
      className={`${className} object-contain`}
    />
  );
};

export default MentorshipIllustration;
