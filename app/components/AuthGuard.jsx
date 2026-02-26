"use client";

import { useAuth } from "../hook/useAuth";
import styled from "styled-components";

/* ================= LOADER ================= */
const Loader = () => {
  return (
    <StyledWrapper>
      <div className="loader" />
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader {
    width: 42px;
    height: 42px;
    border-radius: 9999px;
    border: 3px solid rgba(255, 255, 255, 0.25);
    border-top-color: #ffffff;
    animation: spin 0.65s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 480px) {
    .loader {
      width: 36px;
      height: 36px;
    }
  }
`;

/* ================= AUTH GUARD ================= */
export default function AuthGuard({ children }) {
  const { loading: authLoading, userEmail } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <Loader />
      </div>
    );
  }

  if (!userEmail) return null;

  return <>{children}</>;
}
