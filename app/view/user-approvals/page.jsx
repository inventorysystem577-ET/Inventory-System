"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import AuthGuard from "../../components/AuthGuard";
import Sidebar from "../../components/Sidebar";
import TopNavbar from "../../components/TopNavbar";
import { useAuth } from "../../hook/useAuth";
import { isAdminRole } from "../../utils/roleHelper";
import { supabase } from "../../../lib/supabaseClient";

export default function UserApprovalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const { role, loading, userEmail } = useAuth();
  const router = useRouter();
  const isAdmin = isAdminRole(role);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/view/dashboard");
    }
  }, [loading, isAdmin, router]);

  const loadPendingUsers = useCallback(async () => {
    setLoadingRequests(true);
    const { data, error } = await supabase
      .from("access_requests_temp")
      .select("id, name, email, role, reason, requested_at")
      .eq("is_approved", false)
      .is("rejected_at", null)
      .order("requested_at", { ascending: true });

    if (error) {
      setFeedback({ type: "error", message: `Unable to load pending users: ${error.message}` });
      setPendingUsers([]);
      setLoadingRequests(false);
      return;
    }

    setPendingUsers(data || []);
    setLoadingRequests(false);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPendingUsers();
    }
  }, [isAdmin, loadPendingUsers]);

const approveUser = async (user) => {
  const now = new Date().toISOString();

  // user.id is now the real auth.users UUID — no lookup needed
  const { error: profileError } = await supabase.from("user_profiles").upsert({
    id: user.id,              // ← real auth UUID, FK constraint satisfied
    name: user.name,
    email: user.email,
    role: user.role || "staff",
    reason: user.reason || "Registration approved",
    is_approved: true,
    requested_at: user.requested_at || now,
    approved_at: now,
    approved_by: userEmail || "admin",
    rejected_at: null,
    rejected_by: null,
    updated_at: now,
  });

  if (profileError) {
    setFeedback({ type: "error", message: `Approval failed: ${profileError.message}` });
    return;
  }

  const { error: queueError } = await supabase
    .from("access_requests_temp")
    .delete()
    .eq("id", user.id);

  if (queueError) {
    setFeedback({ type: "error", message: `Approved, but failed to clear queue: ${queueError.message}` });
    await loadPendingUsers();
    return;
  }

  setFeedback({ type: "success", message: `${user.name} approved successfully.` });
  await loadPendingUsers();
};

  const denyUser = async (user) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("access_requests_temp")
      .update({
        is_approved: false,
        rejected_at: now,
        rejected_by: userEmail || "admin",
        updated_at: now,
      })
      .eq("id", user.id);

    if (error) {
      setFeedback({ type: "error", message: `Rejection failed: ${error.message}` });
      return;
    }

    setFeedback({ type: "success", message: `${user.name} has been rejected.` });
    await loadPendingUsers();
  };

  const cardClass = (extra = "") =>
    `rounded-xl border ${extra} ${
      darkMode ? "bg-[#1F2937] border-[#374151]" : "bg-white border-[#E5E7EB]"
    }`;

  const subtextClass = darkMode ? "text-gray-400" : "text-gray-600";

  if (!isAdmin) {
    return (
      <AuthGuard darkMode={darkMode}>
        <div
          className={`min-h-screen flex items-center justify-center ${
            darkMode ? "bg-[#111827] text-white" : "bg-[#F3F4F6] text-black"
          }`}
        >
          <p className="text-sm">Redirecting...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard darkMode={darkMode}>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode ? "bg-[#111827] text-white" : "bg-[#F3F4F6] text-black"
        }`}
      >
        <TopNavbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
        />

        <div
          className={`transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "ml-0"
          } pt-16`}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <div className={`${cardClass()} p-6 mb-6`}>
              <div className="flex items-center gap-3 mb-1">
                <ShieldCheck className="w-6 h-6 text-[#2563EB]" />
                <h1 className="text-2xl font-bold">Admit Pending Users</h1>
              </div>
              <p className={`text-sm ${subtextClass}`}>
                Review registration requests and admit approved users into user_profiles.
              </p>
            </div>

            {feedback.message && (
              <div
                className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                  feedback.type === "success"
                    ? darkMode
                      ? "bg-green-900/30 text-green-400 border border-green-800"
                      : "bg-green-50 text-green-700 border border-green-200"
                    : darkMode
                      ? "bg-red-900/30 text-red-400 border border-red-800"
                      : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className={`${cardClass()} overflow-hidden`}>
              {loadingRequests ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                  <p className={`mt-3 text-sm ${subtextClass}`}>Loading pending requests...</p>
                </div>
              ) : pendingUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={`text-sm ${subtextClass}`}>No pending registrations.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={darkMode ? "bg-[#374151]/50" : "bg-[#F9FAFB]"}>
                        <th className={`px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider ${subtextClass}`}>Name</th>
                        <th className={`px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider ${subtextClass}`}>Email</th>
                        <th className={`px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider ${subtextClass}`}>Role</th>
                        <th className={`px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider ${subtextClass}`}>Reason</th>
                        <th className={`px-4 py-3 text-right font-semibold text-xs uppercase tracking-wider ${subtextClass}`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {pendingUsers.map((user) => (
                        <tr key={user.id} className={darkMode ? "hover:bg-[#374151]/30" : "hover:bg-[#F9FAFB]"}>
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.role}</td>
                          <td className="px-4 py-3">{user.reason || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => approveUser(user)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  darkMode
                                    ? "hover:bg-[#374151] text-green-400"
                                    : "hover:bg-green-50 text-green-600"
                                }`}
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => denyUser(user)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  darkMode
                                    ? "hover:bg-[#374151] text-red-400"
                                    : "hover:bg-red-50 text-red-600"
                                }`}
                                title="Deny"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
