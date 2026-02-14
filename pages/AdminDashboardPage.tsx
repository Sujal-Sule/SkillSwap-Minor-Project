import React, { useEffect, useState, useContext } from "react";
import type { User, Session, TokenTransaction, Rating } from "../types";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  UserCircleIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  HandThumbUpIcon,
  ExclamationCircleIcon,
  HandThumbDownIcon,
} from "../components/icons";
import AdminLoader from "../components/AdminLoader";

const AdminDashboardPage: React.FC = () => {
  const { isAdmin, currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "sessions" | "transactions" | "feedback"
  >("overview");

  // Data State
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    console.log("AdminDashboardPage Mounted, isAdmin:", isAdmin);
    if (!isAdmin) return;
    fetchData();
    return () => console.log("AdminDashboardPage Unmounted");
  }, []); // Changed dependency to empty array to run only on mount

  const fetchData = async () => {
    console.log("fetchData called");
    try {
      setLoading(true);
      const [
        statsData,
        usersData,
        sessionsData,
        transactionsData,
        ratingsData,
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/sessions"),
        api.get("/admin/transactions"),
        api.get("/admin/ratings"),
      ]);
      setStats(statsData);
      // Normalize user IDs (handle _id from backend)
      const normalizedUsers = usersData.map((u: any) => ({
        ...u,
        id: u.id || u._id,
      }));
      setUsers(normalizedUsers);
      setSessions(sessionsData);
      setTransactions(transactionsData);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Are you sure you want to toggle suspension for this user?"))
      return;
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isSuspended: res.isSuspended } : u,
        ),
      );
    } catch (error) {
      alert("Failed to update suspension status");
    }
  };

  const handleUpdateTokens = async (userId: string, currentTokens: number) => {
    const newTokensStr = prompt(
      "Enter new token balance:",
      currentTokens.toString(),
    );
    if (newTokensStr === null) return;
    const newTokens = parseInt(newTokensStr);
    if (isNaN(newTokens)) return alert("Invalid number");

    try {
      await api.put(`/admin/users/${userId}/tokens`, { tokens: newTokens });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tokens: newTokens } : u)),
      );
    } catch (error) {
      alert("Failed to update tokens");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this user?"))
      return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  if (!currentUser || !isAdmin)
    return <div className="p-10 text-center text-red-500">Access Denied</div>;
  if (loading) return <AdminLoader />;

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? "bg-sky-600 text-white shadow-md"
          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
      }`}
    >
      <Icon className="w-5 h-5 mr-2" />
      {label}
    </button>
  );

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : userId; // Fallback to ID if name not found
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admin Panel
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Platform Oversight & Management
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" label="Overview" icon={CheckCircleIcon} />
        <TabButton id="users" label="Users" icon={UserCircleIcon} />
        <TabButton
          id="sessions"
          label="Sessions"
          icon={ChatBubbleLeftRightIcon}
        />
        <TabButton
          id="transactions"
          label="Economy"
          icon={CurrencyDollarIcon}
        />
        <TabButton id="feedback" label="Feedback" icon={HandThumbUpIcon} />
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={UserCircleIcon}
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={stats.activeUsers}
              sub={`Suspended: ${stats.suspendedUsers}`}
              icon={CheckCircleIcon}
              color="green"
            />
            <StatCard
              title="Total Sessions"
              value={stats.totalSessions}
              sub={`Completed: ${stats.completedSessions}`}
              icon={ChatBubbleLeftRightIcon}
              color="purple"
            />
            <StatCard
              title="Tokens in Circulation"
              value={stats.totalTokens}
              icon={CurrencyDollarIcon}
              color="amber"
            />
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {Array.isArray(users) &&
                  users
                    .filter((u) => !u.isAdmin)
                    .map((user) => {
                      if (!user) return null;
                      const userName = user.name || "Unknown User";
                      const userId = user.id ? user.id.toString() : "N/A";
                      return (
                        <tr
                          key={user.id || Math.random()}
                          className={
                            user.isSuspended
                              ? "bg-red-50 dark:bg-red-900/10"
                              : ""
                          }
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                className="h-10 w-10 rounded-full bg-slate-200"
                                src={
                                  user.avatarUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`
                                }
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
                                }}
                              />
                              <div className="ml-3">
                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                  {userName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  ID: {userId.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {user.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-amber-600 dark:text-amber-400">
                            {user.tokens}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {user.isSuspended ? (
                              <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                                Suspended
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() =>
                                handleUpdateTokens(user.id, user.tokens)
                              }
                              className="text-sky-600 hover:text-sky-800 text-sm"
                            >
                              Tokens
                            </button>
                            {!user.isAdmin && (
                              <>
                                <button
                                  onClick={() => handleSuspendUser(user.id)}
                                  className="text-amber-600 hover:text-amber-800 text-sm"
                                >
                                  {user.isSuspended ? "Unsuspend" : "Suspend"}
                                </button>
                                <button
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Skill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Participants (S / T)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                      {session.skill.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {getUserName(session.studentId)} /{" "}
                      {getUserName(session.teacherId)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          session.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : session.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500 dark:text-slate-400">
                      {new Date(session.scheduledTime).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {getUserName(tx.userId)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={
                          tx.type === "earned"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">{tx.amount}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "feedback" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Reviewer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Rated User
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                    Stars
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {ratings.map((rating) => (
                  <tr key={rating.id}>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {getUserName(rating.raterId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {getUserName(rating.ratedId)}
                    </td>
                    <td className="px-6 py-4 text-center text-amber-500 font-bold">
                      {"★".repeat(rating.stars)}
                      <span className="text-slate-300">
                        {"★".repeat(5 - rating.stars)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 italic">
                      "{rating.feedback}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon: Icon, color }: any) => {
  const colorClasses: any = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    amber:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-start space-x-4">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
          {value}
        </p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
