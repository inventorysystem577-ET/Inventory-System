// app/forgot-password/page.jsx
"use client";

// ✅ CRITICAL: This forces Vercel to include this route in production
export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";

import WelcomeIcon from "../../components/WelcomeIcon";
import ResetPasswordHeader from "../../components/ResetPasswordHeader";
import ForgotPasswordForm from "../../components/ForgotPassword";
import { handleForgotPassword } from "../../controller/forgotController";
import { handleFormSubmit } from "../../utils/formHandlers";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const onSubmit = (e) => {
    handleFormSubmit({
      e,
      controllerFn: handleForgotPassword,
      data: { email },
      setLoading,
      onSuccess: (response) => {
        setSuccess(
          response.message || "Password reset link sent! Check your email.",
        );
        setEmail("");
      },
      onError: (error) => alert(error.message),
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
            <ResetPasswordHeader />
          </div>

          {/* Form */}
          <div className="animate__animated animate__fadeInUp animate__slow mb-4">
            <ForgotPasswordForm
              email={email}
              setEmail={setEmail}
              onSubmit={onSubmit}
              loading={loading}
            />

            {/* Success Message */}
            {success && (
              <p className="text-[#22C55E] text-center mt-4 font-medium">
                {success}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
