"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";

import WelcomeIcon from "../../components/WelcomeIcon";
import RegisterHeader from "../../components/RegisterHeader";
import { handleFormSubmit } from "../../utils/formHandlers";
import { handleSubmitAccessRequest } from "../../controller/accessRequestController";
import { useRouter } from "next/navigation";

export default function RequestAccessPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = (e) => {
    handleFormSubmit({
      e,
      controllerFn: handleSubmitAccessRequest,
      data: { email, reason },
      setLoading,
      onSuccess: (response) => {
        if (response?.status === "approved_for_registration" && response?.registerUrl) {
          alert(response.message || "Access approved. Continue registration.");
          router.push(response.registerUrl);
          return;
        }

        alert(
          response?.message ||
            "Admin has been notified. Please wait for approval and try again later.",
        );
      },
      onError: (error) => {
        alert(error.message);
      },
    });
  };

  return (
    <div className="flex h-screen font-inter overflow-hidden">
      <WelcomeIcon />

      {/* 📱 MOBILE DARK | 💻 DESKTOP WHITE */}
      <div className="w-full md:w-1/2 bg-[#0B0B0B] md:bg-white flex flex-col items-center justify-center p-8 overflow-y-auto transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-4">
            <div className="mb-2 w-full max-w-md drop-shadow-2xl mt-10 hover:scale-105 transition-transform duration-300 ease-in-out animate__animated animate__fadeInDown animate__slow">
              <Image
                src="/logo.png"
                alt="Company Logo"
                width={400}
                height={400}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* Header */}
          <div className="animate__animated animate__fadeInDown animate__slow mb-2">
            <RegisterHeader
              title="Request Access"
              subtitle="Your account requires administrator approval before access is granted."
            />
          </div>

          {/* Form */}
          <div className="animate__animated animate__fadeInUp animate__slow mb-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Access Request (optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                  placeholder="Please explain why you need access to this inventory system..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                {loading ? "Submitting..." : "Request Access"}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an approved account?{" "}
                <a href="/" className="text-blue-600 hover:underline">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
