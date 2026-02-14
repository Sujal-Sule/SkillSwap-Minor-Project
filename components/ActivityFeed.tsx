import React from "react";
import type { User, Session, ConnectionRequest } from "../types";

interface ActivityItem {
  id: string;
  type:
    | "token_earned"
    | "connection_accepted"
    | "profile_milestone"
    | "session_completed"
    | "new_match";
  text: string;
  timestamp: Date;
  icon: string;
}

interface ActivityFeedProps {
  sessions: Session[];
  connectionRequests: ConnectionRequest[];
  users: User[];
  currentUser: User;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  sessions,
  connectionRequests,
  users,
  currentUser,
}) => {
  // Generate activity items from data
  const generateActivities = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Completed sessions → tokens earned
    const completedSessions = sessions.filter(
      (s) =>
        s.status === "completed" &&
        (s.studentId === currentUser.id || s.teacherId === currentUser.id),
    );
    completedSessions.slice(0, 3).forEach((session) => {
      const otherUserId =
        session.studentId === currentUser.id
          ? session.teacherId
          : session.studentId;
      const otherUser = users.find((u) => u.id === otherUserId);
      activities.push({
        id: `session-${session.id}`,
        type: "token_earned",
        text: `You earned 1 token for completing session with ${otherUser?.name || "a mentor"}`,
        timestamp: new Date(session.scheduledTime),
        icon: "💰",
      });
    });

    // Accepted connections
    const acceptedRequests = connectionRequests.filter(
      (r) => r.status === "accepted" && r.receiverId === currentUser.id,
    );
    acceptedRequests.slice(0, 2).forEach((request) => {
      const sender = users.find((u) => u.id === request.senderId);
      activities.push({
        id: `connection-${request.id}`,
        type: "connection_accepted",
        text: `${sender?.name || "Someone"} accepted your connection request`,
        timestamp: new Date(request.createdAt || Date.now()),
        icon: "✅",
      });
    });

    // Profile milestone (if 100%)
    if (currentUser && calculateProfileCompletion(currentUser) === 100) {
      activities.push({
        id: "profile-100",
        type: "profile_milestone",
        text: "Profile reached 100%",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        icon: "⭐",
      });
    }

    // Sort by timestamp (most recent first)
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 8);
  };

  const calculateProfileCompletion = (user: User): number => {
    const fields = [
      user.name,
      user.avatarUrl,
      user.bio,
      user.teaches?.length > 0,
      user.learns?.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const getTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const activities = generateActivities();

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 py-2 border-b border-border last:border-0"
          >
            <span className="text-lg flex-shrink-0">{activity.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-secondary">{activity.text}</p>
            </div>
            <span className="text-xs text-text-muted flex-shrink-0">
              {getTimeAgo(activity.timestamp)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border">
        <button className="text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium">
          View all activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
