// app/reset-password/page.jsx
"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import WelcomeIcon from "../components/WelcomeIcon";
import ResetPasswordFormComponent from "../components/ResetPasswordForm";
import ResetPasswordHeader from "../components/ResetPasswordHeader";
import { handleResetPassword } from "../controller/resetPasswordController";
import { handleFormSubmit } from "../utils/formHandlers";

// ✅ Force dynamic rendering to avoid pre-rendering issues
export const dynamic = "force-dynamic";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = searchParams.get("token");
  const type = searchParams.get("type");

  const isValidResetLink = token && type === "recovery";

  const onSubmit = (e) => {
    setError("");
    setSuccess("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    handleFormSubmit({
      e,
      controllerFn: handleResetPassword,
      data: newPassword,
      setLoading,
      onSuccess: (response) => {
        setSuccess(
          response.message ||
            "Password updated successfully! Redirecting to login...",
        );
        setTimeout(() => {
          router.push("/");
        }, 2000);
      },
      onError: (error) => setError(error.message),
    });
  };

  return (
    <div className="flex h-screen font-inter overflow-hidden">
      <WelcomeIcon />

      {/* 📱 MOBILE DARK | 💻 DESKTOP WHITE */}
      <div className="w-full md:w-1/2 bg-[#020617] md:bg-white flex flex-col items-center justify-center p-8 overflow-y-auto transition-colors duration-300">
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
          <div className="animate__animated animate__fadeInDown animate__slow mb-6">
            <ResetPasswordHeader />
          </div>

          {/* Invalid link */}
          {!isValidResetLink && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg animate__animated animate__fadeIn">
              Invalid or expired reset link
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg animate__animated animate__fadeIn">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg animate__animated animate__fadeIn">
              {success}
            </div>
          )}

          {/* Form */}
          {isValidResetLink && !success && (
            <div className="animate__animated animate__fadeInUp animate__slow">
              <ResetPasswordFormComponent
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                onSubmit={onSubmit}
                loading={loading}
              />
            </div>
          )}

          {/* Back button */}
          {!isValidResetLink && (
            <div className="mt-4 text-center animate__animated animate__fadeIn">
              <button
                onClick={() => router.push("/")}
                className="text-blue-500 hover:text-blue-600 font-medium transition"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#020617] md:bg-gray-50">
          <div className="text-gray-300 md:text-gray-600">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
