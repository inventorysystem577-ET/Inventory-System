"use client";

import Link from "next/link";
import Image from "next/image";

const NotFoundPage = () => {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "'Orbitron', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background image */}
      <Image
        src="/notfound.png"
        alt="404 Not Found"
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        priority
      />

      {/* Buttons at the bottom */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          gap: "0.8rem",
          marginBottom: "3rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          style={{
            padding: "0.55rem 1.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "1.5px solid rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.1)",
            color: "#d0e4f4",
            cursor: "pointer",
            borderRadius: "3px",
            textDecoration: "none",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.22)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "0 0 14px rgba(180,220,255,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
            e.currentTarget.style.color = "#d0e4f4";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Go Home
        </Link>

        <button
          onClick={() => history.back()}
          style={{
            padding: "0.55rem 1.6rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "1.5px solid rgba(255,255,255,0.5)",
            background: "rgba(255,255,255,0.1)",
            color: "#d0e4f4",
            cursor: "pointer",
            borderRadius: "3px",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.22)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.boxShadow = "0 0 14px rgba(180,220,255,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
            e.currentTarget.style.color = "#d0e4f4";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
