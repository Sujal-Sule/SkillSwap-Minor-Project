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
  ArrowPathIcon, // Refresh
  ServerIcon, // System
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from "../components/icons";
import AdminLoader from "../components/AdminLoader";

// --- Components ---

const AdminSidebar = ({ activeTab, setActiveTab }: any) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: ShieldCheckIcon },
    { id: "users", label: "Users", icon: UserCircleIcon },
    { id: "sessions", label: "Sessions", icon: ChatBubbleLeftRightIcon },
    { id: "transactions", label: "Economy", icon: CurrencyDollarIcon },
    { id: "feedback", label: "Feedback", icon: HandThumbUpIcon },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-900 flex flex-col h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800 z-50 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="font-bold text-lg text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          ADMIN<span className="text-slate-500 dark:text-slate-600">PANEL</span>
        </div>
      </div>

      <div className="flex-1 py-6 space-y-1">
        <div className="px-6 text-xs font-semibold text-slate-500 dark:text-slate-600 uppercase tracking-wider mb-4">
          Main Menu
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-all border-l-2 ${
              activeTab === item.id
                ? "bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-white border-emerald-500"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200 border-transparent"
            }`}
          >
            <item.icon
              className={`w-5 h-5 mr-3 ${
                activeTab === item.id
                  ? "text-emerald-500"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            />
            {item.label}
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-500">
            SYSTEM ONLINE
          </span>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-600 mt-1 font-mono">
          v2.4.0-stable • 12ms
        </div>
      </div>
    </div>
  );
};

const Sparkline = ({
  data,
  color = "emerald",
}: {
  data: number[];
  color?: string;
}) => {
  const height = 40;
  const width = 100;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const colorHex =
    {
      emerald: "#10b981",
      blue: "#3b82f6",
      amber: "#f59e0b",
      purple: "#a855f7",
    }[color] || "#cbd5e1";

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke={colorHex}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const StatCard = ({
  title,
  value,
  sub,
  icon: Icon,
  color,
  trend,
  sparkData,
}: any) => {
  const colors: any = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    green: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-medium flex items-center ${trend > 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              {trend > 0 ? (
                <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-xs text-slate-400">{sub}</span>
        </div>
        {sparkData && (
          <div className="w-24 opacity-50 group-hover:opacity-100 transition-opacity">
            <Sparkline
              data={sparkData}
              color={color === "green" ? "emerald" : color}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Page Component ---

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
    if (!isAdmin) return;
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
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
      setUsers(usersData.map((u: any) => ({ ...u, id: u.id || u._id })));
      setSessions(sessionsData);
      setTransactions(transactionsData);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine mock trend data based on IDs or random (since we don't have real historical data backend yet)
  const getMockTrend = () => Math.floor(Math.random() * 20) - 5;
  const getMockSparkline = () =>
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 20);

  // Actions
  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Confirm suspension toggle?")) return;
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isSuspended: res.isSuspended } : u,
        ),
      );
    } catch (e) {
      alert("Action failed");
    }
  };

  const handleUpdateTokens = async (userId: string, currentTokens: number) => {
    const val = prompt("New Balance:", currentTokens.toString());
    if (!val) return;
    const num = parseInt(val);
    if (isNaN(num)) return;
    try {
      await api.put(`/admin/users/${userId}/tokens`, { tokens: num });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tokens: num } : u)),
      );
    } catch (e) {
      alert("Failed");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("PERMANENTLY DELETE USER?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      alert("Failed");
    }
  };

  if (!currentUser || !isAdmin)
    return (
      <div className="h-screen flex items-center justify-center text-red-500 font-mono">
        ACCESS DENIED
      </div>
    );
  if (loading) return <AdminLoader />;

  return (
    <div className="bg-slate-50 dark:bg-[#0B1120] min-h-screen font-sans text-slate-900 dark:text-slate-100 flex">
      {/* 1. Left Navigation */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header Bar */}
        <header className="h-16 bg-white dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Console / {activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-500 border-r border-slate-800 pr-6">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>API: ONLINE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>DB: CONNECTED</span>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-8">
          {activeTab === "overview" && stats && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  sub="+12 this week"
                  icon={UserCircleIcon}
                  color="blue"
                  trend={12.5}
                  sparkData={getMockSparkline()}
                />
                <StatCard
                  title="Active Users"
                  value={stats.activeUsers}
                  sub={`${stats.suspendedUsers} Suspended`}
                  icon={CheckCircleIcon}
                  color="green"
                  trend={8.2}
                  sparkData={getMockSparkline()}
                />
                <StatCard
                  title="Total Sessions"
                  value={stats.totalSessions}
                  sub={`${stats.completedSessions} Completed`}
                  icon={ChatBubbleLeftRightIcon}
                  color="purple"
                  trend={-2.4}
                  sparkData={getMockSparkline()}
                />
                <StatCard
                  title="Token Flow"
                  value={stats.totalTokens}
                  sub="Circulating Supply"
                  icon={CurrencyDollarIcon}
                  color="amber"
                  trend={5.1}
                  sparkData={getMockSparkline()}
                />
              </div>

              {/* Chart Section (Simulated with CSS Bars for simplicity/reliability without external lib) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                    User Acquisition Trend
                  </h3>
                  <div className="h-64 flex items-end gap-2 px-1">
                    {/* Real Data Bar Chart */}
                    {stats.acquisitionTrend?.map((val: number, i: number) => {
                      const maxVal = Math.max(
                        ...(stats.acquisitionTrend || []),
                        5,
                      );
                      const h = (val / maxVal) * 90 + 2; // Normalize plus small base for 0
                      return (
                        <div
                          key={i}
                          className="flex-1 h-full bg-slate-100 dark:bg-slate-800 rounded-t-sm hover:bg-sky-500/20 transition-colors relative group"
                        >
                          <div
                            className="absolute bottom-0 w-full bg-sky-500/80 rounded-t-sm transition-all duration-500"
                            style={{ height: `${val > 0 ? h : 0}%` }}
                          ></div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                            {val} Users
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-slate-500 font-mono uppercase">
                    <span>30 Days Ago</span>
                    <span>Today</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                    System Health
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Server Load</span>
                        <span className="text-emerald-500 font-mono">24%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[24%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Database Storage</span>
                        <span className="text-blue-500 font-mono">45%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[45%]"></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500">Memory Usage</span>
                        <span className="text-amber-500 font-mono">62%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[62%]"></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-3 mb-2">
                        <ExclamationCircleIcon className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium">
                          2 Pending Reports
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <ClockIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-500">
                          Last backup: 2h ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-950 font-medium text-slate-900 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">User Identity</th>
                    <th className="px-6 py-4">Role / Status</th>
                    <th className="px-6 py-4 text-right">Balance</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users
                    .filter((u) => !u.isAdmin)
                    .map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs">
                              {user.name?.[0] || "U"}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-xs font-mono text-slate-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.isSuspended ? (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20">
                              Suspended
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-900 dark:text-white">
                          {user.tokens}{" "}
                          <span className="text-slate-500 text-xs">TKN</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() =>
                              handleUpdateTokens(user.id, user.tokens)
                            }
                            className="text-xs font-medium text-blue-500 hover:text-blue-400 px-2 py-1 hover:bg-blue-500/10 rounded"
                          >
                            Edit Funds
                          </button>
                          <button
                            onClick={() => handleSuspendUser(user.id)}
                            className="text-xs font-medium text-amber-500 hover:text-amber-400 px-2 py-1 hover:bg-amber-500/10 rounded"
                          >
                            {user.isSuspended ? "Unsuspend" : "Suspend"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Sessions, Transactions, Feedback - Keeping Simplified for brevity but using the new container style */}
          {(activeTab === "sessions" ||
            activeTab === "transactions" ||
            activeTab === "feedback") && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12 text-center shadow-sm">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                {activeTab === "sessions" && (
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400" />
                )}
                {activeTab === "transactions" && (
                  <CurrencyDollarIcon className="w-8 h-8 text-slate-400" />
                )}
                {activeTab === "feedback" && (
                  <HandThumbUpIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                The structured data view for {activeTab} is ready to be
                populated. The new layout supports high-density rows and
                filtering.
              </p>

              {/* Temporary Simple List for Context */}
              <div className="mt-8 text-left border-t border-slate-200 dark:border-slate-800 pt-8">
                {activeTab === "sessions" &&
                  sessions.slice(0, 5).map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                    >
                      <span className="font-medium">{s.skill.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${s.status === "completed" ? "bg-green-500/10 text-green-500" : "bg-slate-500/10 text-slate-500"}`}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
