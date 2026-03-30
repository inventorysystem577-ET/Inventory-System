// app/register/page.jsx
"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import WelcomeIcon from "../../components/WelcomeIcon";
import RegisterHeader from "../../components/RegisterHeader";
import RegisterForm from "../../components/RegisterForm";
import { handleFormSubmit } from "../../utils/formHandlers";
import { handleSubmitRegister } from "../../controller/registerController";
import { handleSubmitLogin } from "../../controller/loginController";
import { fetchAccessRequestStatusByEmail } from "../../controller/accessRequestController";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromQuery = (searchParams.get("email") || "")
      .toString()
      .trim()
      .toLowerCase();

    if (!emailFromQuery) {
      alert("Please request access first.");
      router.replace("/");
      return;
    }

    setEmail(emailFromQuery);

    const verifyAccess = async () => {
      try {
        const statusData = await fetchAccessRequestStatusByEmail(emailFromQuery);
        if (statusData?.status !== "approved_for_registration") {
          alert(statusData?.message || "Access is not approved yet.");
          router.replace("/");
          return;
        }
      } catch (error) {
        alert(error.message || "Unable to verify access request");
        router.replace("/");
        return;
      } finally {
        setCheckingAccess(false);
      }
    };

    verifyAccess();
  }, [router, searchParams]);

  const onSubmit = (e) => {
    if (checkingAccess) {
      e.preventDefault();
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    if (password.length < 8 || !hasUpper || !hasLower || !hasDigit) {
      alert("Password must contain at least 8 characters, including uppercase, lowercase, and numbers.");
      return;
    }

    handleFormSubmit({
      e,
      controllerFn: handleSubmitRegister,
      data: { name, email, password },
      setLoading,
      onSuccess: async (response) => {
        alert(response.message || "Registration complete. Redirecting to your workspace.");

        // Ensure browser session is established before redirecting into protected routes.
        let userRole = "";
        try {
          const loginData = await handleSubmitLogin({ email, password });
          userRole = (loginData?.user?.user_metadata?.role || "")
            .toString()
            .toLowerCase();
        } catch (_error) {
          router.push("/");
          return;
        }

        if (userRole === "staff") {
          router.push("/view/product-in");
          return;
        }
        router.push("/view/dashboard");
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
            <RegisterHeader />
          </div>

          {/* Form */}
          <div className="animate__animated animate__fadeInUp animate__slow mb-4">
            <RegisterForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              onSubmit={onSubmit}
              loading={loading || checkingAccess}
              showReasonField={false}
              emailReadOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}
