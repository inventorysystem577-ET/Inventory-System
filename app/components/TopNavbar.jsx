"use client";

import { X, Menu, Sun, Moon, Mail } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { getDisplayName, getAvatarLetter } from "../utils/userHelper";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAccessRequests } from "../controller/accessRequestController";

// Import Animate.css
import "animate.css";

export default function TopNavbar({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  setDarkMode,
}) {
  const { userEmail, displayName, role, loading } = useAuth();
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [seenRequestIds, setSeenRequestIds] = useState([]);
  const isAdmin = String(role || "").toLowerCase() === "admin";

  const displayedName = getDisplayName(null, userEmail);
  const avatarLetter = getAvatarLetter(null, userEmail);

  // Load dark mode from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === "true");
    }
  }, [setDarkMode]);

  // Save dark mode to localStorage when it changes
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
  };

  useEffect(() => {
    if (!isAdmin) {
      setPendingRequests([]);
      setSeenRequestIds([]);
      return;
    }

    let mounted = true;
    const loadPendingRequests = async () => {
      try {
        const requests = await fetchAccessRequests("pending");
        if (mounted) {
          setPendingRequests(Array.isArray(requests) ? requests : []);
        }
      } catch (_error) {
        if (mounted) {
          setPendingRequests([]);
        }
      }
    };

    loadPendingRequests();
    const intervalId = setInterval(loadPendingRequests, 30000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [isAdmin]);

  const unseenPendingCount = pendingRequests.filter(
    (request) => !seenRequestIds.includes(request.id),
  ).length;

  return (
    <nav
      className={`fixed w-full z-30 top-0 shadow-sm border-b ${
        darkMode ? "bg-[#111827] border-[#374151]" : "bg-white border-[#E5E7EB]"
      }`}
    >
      <div className="px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left side */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                darkMode
                  ? "text-[#D1D5DB] hover:bg-[#1F2937]"
                  : "text-[#6B7280] hover:bg-[#F3F4F6]"
              }`}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo - changes based on dark mode */}
            <button
              type="button"
              onClick={() => router.push("/view/dashboard")}
              className="rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/70"
              aria-label="Go to dashboard"
            >
              <img
                src={darkMode ? "/logo.png" : "/logo2.png"}
                alt="logo"
                className="h-8 sm:h-10 w-auto animate__animated animate__fadeIn animate__slow"
              />
            </button>
          </div>

          {/* Right side - User Profile + Dark Mode Toggle */}
          <div
            className={`flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l ${
              darkMode ? "border-[#374151]" : "border-[#E5E7EB]"
            }`}
          >
            {/* Dark Mode Toggle */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowRequestModal((prev) => {
                      const nextOpenState = !prev;
                      if (nextOpenState) {
                        setSeenRequestIds((currentIds) => {
                          const nextIds = [...currentIds];
                          pendingRequests.forEach((request) => {
                            if (!nextIds.includes(request.id)) {
                              nextIds.push(request.id);
                            }
                          });
                          return nextIds;
                        });
                      }
                      return nextOpenState;
                    });
                  }}
                  className={`p-2 rounded-md transition relative ${
                    darkMode ? "hover:bg-[#1F2937]" : "hover:bg-[#F3F4F6]"
                  }`}
                  title="Access Requests"
                  aria-label="Access Requests"
                >
                  <Mail
                    className={`w-5 h-5 ${darkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"}`}
                  />
                  {unseenPendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unseenPendingCount}
                    </span>
                  )}
                </button>

                {showRequestModal && (
                  <div
                    className={`absolute right-0 mt-2 w-80 rounded-lg border shadow-xl z-50 ${
                      darkMode
                        ? "bg-[#111827] border-[#374151] text-white"
                        : "bg-white border-[#E5E7EB] text-[#111827]"
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-inherit">
                      <h3 className="text-sm font-semibold">Pending Access Requests</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {pendingRequests.length === 0 ? (
                        <p
                          className={`px-4 py-4 text-sm ${
                            darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                          }`}
                        >
                          No pending access requests.
                        </p>
                      ) : (
                        pendingRequests.slice(0, 8).map((request) => (
                          <div
                            key={request.id}
                            className={`px-4 py-3 border-b last:border-b-0 ${
                              darkMode ? "border-[#1F2937]" : "border-[#F3F4F6]"
                            }`}
                          >
                            <p className="text-sm font-medium">{request.email}</p>
                            <p
                              className={`text-xs mt-0.5 ${
                                darkMode ? "text-[#9CA3AF]" : "text-[#6B7280]"
                              }`}
                            >
                              {request.reason || "No reason provided"}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestModal(false);
                        router.push("/view/user-management?status=pending");
                      }}
                      className="w-full py-2.5 text-sm font-medium text-blue-500 hover:bg-blue-500/10"
                    >
                      Go to User Management
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-md transition ${
                darkMode ? "hover:bg-[#1F2937]" : "hover:bg-[#F3F4F6]"
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-[#FACC15]" />
              ) : (
                <Moon className="w-5 h-5 text-[#6B7280]" />
              )}
            </button>

            {/* User Profile */}
            <div className="text-right hidden md:block">
              {loading ? (
                <p className="text-xs lg:text-sm font-medium text-[#9CA3AF]">
                  Loading...
                </p>
              ) : (
                <>
                  <p
                    className={`text-xs lg:text-sm font-medium ${
                      darkMode ? "text-white" : "text-[#111827]"
                    }`}
                  >
                    {displayedName}
                  </p>
                  <p
                    className={`text-[10px] lg:text-xs ${
                      darkMode ? "text-[#D1D5DB]" : "text-[#6B7280]"
                    }`}
                  >
                    {(role || "staff").toString().toUpperCase()}
                  </p>
                </>
              )}
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#1D4ED8] to-[#1E3A8A] flex items-center justify-center text-white text-sm sm:text-base font-semibold">
              {avatarLetter}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
