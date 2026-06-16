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
  ArrowPathIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from "../components/icons";
import AdminLoader from "../components/AdminLoader";

const AdminSidebar = ({ activeTab, setActiveTab, theme, toggleTheme, logout }: any) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: ShieldCheckIcon },
    { id: "users", label: "Users", icon: UserCircleIcon },
    { id: "sessions", label: "Sessions", icon: ChatBubbleLeftRightIcon },
    { id: "transactions", label: "Economy", icon: CurrencyDollarIcon },
    { id: "feedback", label: "Feedback", icon: HandThumbUpIcon },
  ];

  return (
    <div className="w-64 bg-[#e8edf2] dark:bg-[#121a2e] flex flex-col h-full border-r border-slate-200/5 dark:border-slate-800/5 flex-shrink-0 z-10">
      <div className="h-20 flex items-center px-6 border-b border-slate-200/5 dark:border-slate-800/5">
        <div className="font-bold text-lg text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)] animate-pulse"></div>
          ADMIN<span className="text-slate-400 dark:text-slate-500">PANEL</span>
        </div>
      </div>

      <div className="flex-1 py-6 space-y-1">
        <div className="px-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
          Main Console
        </div>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-[calc(100%-2rem)] mx-4 my-1 flex items-center px-4 py-3 text-sm font-semibold transition-all duration-200 rounded-2xl border ${
                isActive
                  ? "bg-[#e8edf2] dark:bg-[#121a2e] text-sky-600 dark:text-sky-400 border-slate-200/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.5),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]"
                  : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-850 dark:hover:text-slate-200 hover:scale-[1.01]"
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-3 transition-colors ${
                  isActive ? "text-sky-500" : "text-slate-400 dark:text-slate-500"
                }`}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200/5 dark:border-slate-800/5 space-y-3">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] transition-all text-slate-500 hover:text-sky-500 dark:hover:text-sky-400"
            title="Toggle Theme"
          >
            {theme === "dark" ? <span className="text-sm">☀️</span> : <span className="text-sm">🌙</span>}
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] transition-all text-xs font-bold text-rose-500 hover:text-rose-600"
          >
            Sign Out
          </button>
        </div>

        <div className="p-3.5 rounded-2xl border border-slate-200/5 dark:border-slate-800/5 bg-[#e8edf2]/30 dark:bg-[#121a2e]/30 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.1),_inset_-1px_-1px_3px_rgba(255,255,255,0.5)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)] text-[10px] font-mono text-slate-400 dark:text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] animate-pulse"></span>
            SYS OK
          </div>
          <div>v2.4.0-stable</div>
          <div>latency: 12ms</div>
        </div>
      </div>
    </div>
  );
};

const Sparkline = ({ data, color = "emerald" }: { data: number[]; color?: string }) => {
  const height = 32;
  const width = 100;
  if (!data || data.length === 0) return null;
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
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
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

const StatCard = ({ title, value, sub, icon: Icon, color, trend, sparkData }: any) => {
  const colors: any = {
    blue: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    green: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className="bg-[#e8edf2] dark:bg-[#121a2e] p-6 rounded-[28px] border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_8px_rgba(163,177,198,0.25),_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),_-4px_-4px_8px_rgba(255,255,255,0.02)] transition-all hover:scale-[1.01] duration-300 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl border ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-6">
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span
              className={`text-xs font-bold flex items-center px-2 py-0.5 rounded-lg ${
                trend > 0
                  ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/10"
                  : "text-rose-500 bg-rose-500/10 border border-rose-500/10"
              }`}
            >
              {trend > 0 ? (
                <ArrowTrendingUpIcon className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{sub}</span>
        </div>
        {sparkData && (
          <div className="w-24 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkline data={sparkData} color={color === "green" ? "emerald" : color} />
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, children, variant = "default" }: any) => {
  const variantClasses: any = {
    default: "text-sky-600 dark:text-sky-400 hover:text-sky-500",
    warning: "text-amber-600 dark:text-amber-400 hover:text-amber-500",
    danger: "text-rose-600 dark:text-rose-400 hover:text-rose-500",
  };

  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-xl bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_4px_rgba(163,177,198,0.2),_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.4),_-2px_-2px_4px_rgba(255,255,255,0.02)] hover:shadow-[inset_1px_1px_3px_rgba(163,177,198,0.15),_inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 text-xs font-bold ${variantClasses[variant]}`}
    >
      {children}
    </button>
  );
};

const AdminDashboardPage: React.FC = () => {
  const { isAdmin, currentUser, theme, toggleTheme, logout } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "sessions" | "transactions" | "feedback"
  >("overview");

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [categoryDist, setCategoryDist] = useState<any[]>([]);

  const loadAllAdminData = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard-data");
      if (res) {
        setStats(res.stats);
        setUsers(res.users || []);
        setSessions(res.sessions || []);
        setTransactions(res.transactions || []);
        setRatings(res.ratings || []);
        setCategoryDist(res.categoryDistribution || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [isAdmin]);

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : "System / Unknown User";
  };

  const getMockSparkline = () =>
    Array.from({ length: 10 }, () => Math.floor(Math.random() * 50) + 20);

  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Confirm suspension toggle?")) return;
    try {
      const res = await api.put(`/admin/users/${userId}/suspend`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isSuspended: res.isSuspended } : u
        )
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
        prev.map((u) => (u.id === userId ? { ...u, tokens: num } : u))
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

  if (!currentUser || !isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center text-rose-500 font-mono bg-[#e8edf2] dark:bg-[#121a2e]">
        ACCESS DENIED
      </div>
    );
  }

  if (loading) return <AdminLoader />;

  const statsComputed = stats || {
    totalUsers: users.filter((u) => !u.isAdmin).length,
    activeUsers: users.filter((u) => !u.isAdmin && u.isOnline).length,
    suspendedUsers: users.filter((u) => !u.isAdmin && u.isSuspended).length,
    totalSessions: sessions.length,
    completedSessions: sessions.filter((s) => s.status === "completed").length,
    totalTokens: users.reduce((acc, u) => acc + (u.tokens || 0), 0),
    acquisitionTrend: [5, 10, 15, 12, 8, 20, 25, 22, 30, 35],
  };

  return (
    <div className="bg-[#e8edf2] dark:bg-[#121a2e] w-full h-screen font-sans text-slate-900 dark:text-slate-100 flex overflow-hidden p-4 gap-4">
      {/* Sidebar - Neumorphic panel */}
      <div className="w-64 bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_12px_rgba(163,177,198,0.35),_-6px_-6px_12px_rgba(255,255,255,0.8)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),_-6px_-6px_12px_rgba(255,255,255,0.02)] flex flex-col h-full overflow-hidden">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          toggleTheme={toggleTheme}
          logout={logout}
        />
      </div>

      {/* Main Console Area - Neumorphic panel */}
      <div className="flex-1 bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 shadow-[6px_6px_12px_rgba(163,177,198,0.35),_-6px_-6px_12px_rgba(255,255,255,0.8)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.4),_-6px_-6px_12px_rgba(255,255,255,0.02)] flex flex-col h-full overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200/10 dark:border-slate-800/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] transition-all text-xs font-bold text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 mr-2"
            >
              ← User View
            </a>
            <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Console / {activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400 dark:text-slate-500 border-r border-slate-200/10 dark:border-slate-800/10 pr-6">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                <span>API: ONLINE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span>DB: CONNECTED</span>
              </div>
            </div>

            <button
              onClick={loadAllAdminData}
              className="p-3.5 rounded-xl bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)] hover:shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),_inset_-2px_-2px_4px_rgba(255,255,255,0.8)] dark:hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)] transition-all text-slate-400 hover:text-sky-500 dark:hover:text-sky-400"
              title="Refresh Data"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>

            <div className="h-10 px-4 rounded-xl bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 flex items-center gap-2.5 text-xs font-bold shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)]">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              System Admin
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {activeTab === "overview" && statsComputed && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={statsComputed.totalUsers}
                  sub="Registered Base"
                  icon={UserCircleIcon}
                  color="blue"
                  trend={12.5}
                  sparkData={getMockSparkline()}
                />
                <StatCard
                  title="Active Users"
                  value={statsComputed.activeUsers}
                  sub={`${statsComputed.suspendedUsers} Suspended`}
                  icon={CheckCircleIcon}
                  color="green"
                  trend={8.2}
                  sparkData={getMockSparkline()}
                />
                <StatCard
                  title="Total Sessions"
                  value={statsComputed.totalSessions}
                  sub={`${statsComputed.completedSessions} Completed`}
                  icon={ChatBubbleLeftRightIcon}
                  color="purple"
                  trend={-2.4}
                  sparkData={getMockSparkline()}
                />
                <StatCard
                  title="Token Flow"
                  value={statsComputed.totalTokens}
                  sub="Circulating Supply"
                  icon={CurrencyDollarIcon}
                  color="amber"
                  trend={5.1}
                  sparkData={getMockSparkline()}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 p-6 shadow-[4px_4px_8px_rgba(163,177,198,0.25),_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),_-4px_-4px_8px_rgba(255,255,255,0.02)]">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                    User Acquisition Trend
                  </h3>
                  <div className="h-64 flex items-end gap-2 px-1">
                    {statsComputed.acquisitionTrend?.map((val: number, i: number) => {
                      const maxVal = Math.max(...(statsComputed.acquisitionTrend || []), 5);
                      const h = (val / maxVal) * 90 + 2;
                      return (
                        <div
                          key={i}
                          className="flex-1 h-full bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/5 dark:border-slate-800/5 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.2)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] rounded-t-xl hover:bg-sky-500/10 transition-all duration-300 relative group"
                        >
                          <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-xl shadow-[0_-2px_10px_rgba(14,165,233,0.3)] transition-all duration-500"
                            style={{ height: `${val > 0 ? h : 0}%` }}
                          ></div>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 pointer-events-none shadow-md font-mono">
                            {val} Users
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex justify-between text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">
                    <span>30 Days Ago</span>
                    <span>Today</span>
                  </div>
                </div>

                <div className="bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 p-6 shadow-[4px_4px_8px_rgba(163,177,198,0.25),_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),_-4px_-4px_8px_rgba(255,255,255,0.02)]">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
                    Popular Skills Distribution
                  </h3>
                  <div className="space-y-6">
                    {categoryDist.map((cat) => {
                      const colors: any = {
                        c1: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]",
                        c2: "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]",
                        c3: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
                        c4: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
                        c5: "bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.4)]",
                      };
                      const textColors: any = {
                        c1: "text-sky-500",
                        c2: "text-purple-500",
                        c3: "text-emerald-500",
                        c4: "text-rose-500",
                        c5: "text-slate-500",
                      };
                      return (
                        <div key={cat.id}>
                          <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-slate-400">{cat.name}</span>
                            <span className={`${textColors[cat.id] || "text-slate-500"} font-mono`}>
                              {cat.percentage}% ({cat.count})
                            </span>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-900/50 rounded-full overflow-hidden border border-slate-200/5 dark:border-slate-800/5 shadow-[inset_1px_1px_2px_rgba(163,177,198,0.2)] dark:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)]">
                            <div
                              className={`h-full ${colors[cat.id] || "bg-slate-500"} rounded-full`}
                              style={{ width: `${cat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_8px_rgba(163,177,198,0.25),_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),_-4px_-4px_8px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col flex-1">
              <div className="p-6 border-b border-slate-200/10 dark:border-slate-800/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">User Administration</h3>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {users.filter((u) => !u.isAdmin).length} total users registered
                </span>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-[#e8edf2] dark:bg-[#121a2e] sticky top-0 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/10 dark:border-slate-800/10 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] z-10">
                    <tr>
                      <th className="px-6 py-4">User Identity</th>
                      <th className="px-6 py-4">Role / Status</th>
                      <th className="px-6 py-4 text-right">Balance</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/5">
                    {users
                      .filter((u) => !u.isAdmin)
                      .map((user) => (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-200/10 dark:hover:bg-slate-800/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-[#e8edf2] dark:bg-[#121a2e] border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_6px_rgba(163,177,198,0.2),_-3px_-3px_6px_rgba(255,255,255,0.8)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4)] flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-sm">
                                {user.name?.[0] || "U"}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {user.isSuspended ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                                Suspended
                              </span>
                            ) : user.isOnline ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 animate-pulse">
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 text-xs font-bold border border-slate-500/20">
                                Offline
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-slate-800 dark:text-white font-bold">
                            {user.tokens}{" "}
                            <span className="text-slate-400 dark:text-slate-500 text-xs font-sans">TKN</span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2.5">
                            <ActionButton onClick={() => handleUpdateTokens(user.id, user.tokens)}>
                              Edit Funds
                            </ActionButton>
                            <ActionButton onClick={() => handleSuspendUser(user.id)} variant="warning">
                              {user.isSuspended ? "Unsuspend" : "Suspend"}
                            </ActionButton>
                            <ActionButton onClick={() => handleRemoveUser(user.id)} variant="danger">
                              Delete
                            </ActionButton>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_8px_rgba(163,177,198,0.25),_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),_-4px_-4px_8px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col flex-1">
              <div className="p-6 border-b border-slate-200/10 dark:border-slate-800/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Exchange Sessions Ledger</h3>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {sessions.length} exchange sessions
                </span>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-[#e8edf2] dark:bg-[#121a2e] sticky top-0 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/10 dark:border-slate-800/10 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] z-10">
                    <tr>
                      <th className="px-6 py-4">Skill Topic</th>
                      <th className="px-6 py-4">Participants</th>
                      <th className="px-6 py-4">Scheduled Date</th>
                      <th className="px-6 py-4">Duration & Cost</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/5">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">
                          No exchange sessions found.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => {
                        const teacherName = getUserName(session.teacherId);
                        const studentName = getUserName(session.studentId);
                        const formattedDate = new Date(session.scheduledTime).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        });

                        const statusColors: Record<string, string> = {
                          proposed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          scheduled: "bg-sky-500/10 text-sky-500 border-sky-500/20",
                          active: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 animate-pulse",
                          completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                          cancelled: "bg-slate-500/10 text-slate-500 border-slate-500/20",
                          declined: "bg-rose-500/10 text-rose-500 border-rose-500/20",
                        };

                        return (
                          <tr
                            key={session.id}
                            className="hover:bg-slate-200/10 dark:hover:bg-slate-800/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 dark:text-white">
                                {session.skill.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                                ID: {session.id}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs">
                                <span className="text-slate-400 dark:text-slate-500">Teacher:</span>{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {teacherName}
                                </span>
                              </div>
                              <div className="text-xs mt-0.5">
                                <span className="text-slate-400 dark:text-slate-500">Student:</span>{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {studentName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-650 dark:text-slate-300">
                              {formattedDate}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {session.duration} mins
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500">
                                Cost: {session.cost} Token(s)
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  statusColors[session.status] || "bg-slate-500/10 text-slate-500"
                                }`}
                              >
                                {session.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_8px_rgba(163,177,198,0.25),_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),_-4px_-4px_8px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col flex-1">
              <div className="p-6 border-b border-slate-200/10 dark:border-slate-800/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Token Transactions Ledger</h3>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {transactions.length} total transactions logged
                </span>
              </div>
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
                  <thead className="bg-[#e8edf2] dark:bg-[#121a2e] sticky top-0 font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200/10 dark:border-slate-800/10 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] z-10">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 dark:divide-slate-800/5">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500 font-bold">
                          No transactions found.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t) => {
                        const userName = getUserName(t.userId);
                        const formattedDate = new Date(t.timestamp).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        });

                        return (
                          <tr
                            key={t.id}
                            className="hover:bg-slate-200/10 dark:hover:bg-slate-800/5 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-800 dark:text-white">{userName}</div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                                UID: {t.userId}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {t.type === "earned" ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                  Earned
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                                  Spent
                                </span>
                              )}
                            </td>
                            <td
                              className={`px-6 py-4 text-right font-mono font-bold ${
                                t.type === "earned" ? "text-emerald-500" : "text-rose-500"
                              }`}
                            >
                              {t.type === "earned" ? "+" : "-"}{t.amount} TKN
                            </td>
                            <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                              {t.description}
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-xs text-slate-400 dark:text-slate-500">
                              {formattedDate}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="bg-[#e8edf2] dark:bg-[#121a2e] rounded-[32px] border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_8px_rgba(163,177,198,0.25),_-4px_-4px_8px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.4),_-4px_-4px_8px_rgba(255,255,255,0.02)] overflow-hidden flex flex-col flex-1">
              <div className="p-6 border-b border-slate-200/10 dark:border-slate-800/10 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">User Feedback & Ratings</h3>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  {ratings.length} reviews submitted
                </span>
              </div>
              {ratings.length === 0 ? (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500 font-bold">
                  No ratings or reviews submitted yet.
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#e8edf2]/30 dark:bg-[#121a2e]/30 overflow-y-auto flex-1">
                  {ratings.map((r) => {
                    const raterName = getUserName(r.raterId);
                    const ratedName = getUserName(r.ratedId);

                    return (
                      <div
                        key={r.id}
                        className="bg-[#e8edf2] dark:bg-[#121a2e] p-6 rounded-[28px] border border-slate-200/10 dark:border-slate-800/10 shadow-[3px_3px_6px_rgba(163,177,198,0.25),_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.4),_-3px_-3px_6px_rgba(255,255,255,0.02)] flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="text-xs text-slate-400 dark:text-slate-500">
                                <span className="font-bold text-slate-855 dark:text-slate-200">
                                  {raterName}
                                </span>{" "}
                                rated{" "}
                                <span className="font-bold text-slate-855 dark:text-slate-200">
                                  {ratedName}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                                Session: {r.sessionId}
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= r.stars
                                      ? "text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                                      : "text-slate-200 dark:text-slate-700"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 italic font-medium p-4 rounded-2xl bg-[#e8edf2]/30 dark:bg-[#121a2e]/30 border border-slate-200/5 dark:border-slate-800/5 shadow-[inset_1px_1px_3px_rgba(163,177,198,0.15),_inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)]">
                            "{r.feedback || "No written comment provided."}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
