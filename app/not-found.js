"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";

const NotFoundCard = () => {
  return (
    <StyledWrapper>
      {/* Background grid and floating nodes */}
      <div className="background-grid" aria-hidden="true" />
      <div className="floating-node node1" aria-hidden="true" />
      <div className="floating-node node2" aria-hidden="true" />
      <div className="floating-node node3" aria-hidden="true" />

      {/* Center content */}
      <div className="content-wrapper">
        <div className="logo-wrapper">
          <Image
            src="/logo3.gif"
            alt="Erovoutika Logo"
            fill
            className="logo"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <div className="brutalist-card">
          <div className="brutalist-card__header">
            <div className="brutalist-card__icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div className="brutalist-card__alert">404 Not Found</div>
          </div>
          <div className="brutalist-card__message">
            Oops! The page you are looking for does not exist. You may have
            typed an incorrect URL or the page has been moved.
          </div>
          <div className="brutalist-card__actions">
            <Link
              className="brutalist-card__button brutalist-card__button--mark"
              href="/"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #003df5; /* Welcome panel blue */
  font-family: "Inter", sans-serif;
  overflow: hidden;

  /* Grid overlay */
  .background-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.05;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
    background-size: 56px 56px;
  }

  /* Floating nodes */
  .floating-node {
    position: absolute;
    border-radius: 50%;
    filter: blur(60px);
    opacity: 0.1;
    animation: pulse 4s ease-in-out infinite;
  }

  .node1 {
    top: 20%;
    left: 10%;
    width: 120px;
    height: 120px;
    background-color: #f97316; /* orange */
  }

  .node2 {
    bottom: 15%;
    right: 10%;
    width: 140px;
    height: 140px;
    background-color: #fb923c; /* lighter orange */
    animation-delay: 1s;
  }

  .node3 {
    top: 50%;
    left: 25%;
    width: 100px;
    height: 100px;
    background-color: #f59e0b; /* yellow-orange */
    animation-delay: 2s;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 0.1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.15;
    }
  }

  /* Center content wrapper */
  .content-wrapper {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
    max-width: 400px;
    width: 90%;
  }

  .logo-wrapper {
    margin-bottom: 2rem;
    width: 200px;
    height: 200px;
    position: relative;
  }

  .logo {
    border-radius: 50px;
  }

  /* Brutalist card styling */
  .brutalist-card {
    width: 100%;
    border: 4px solid #f97316; /* orange border */
    background-color: #b45309; /* darker orange card */
    padding: 2rem;
    box-shadow: 10px 10px 0 #f97316; /* orange shadow */
    font-family: "Inter", sans-serif;
  }

  .brutalist-card__header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #f97316;
    padding-bottom: 1rem;
  }

  .brutalist-card__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f97316;
    padding: 0.5rem;
  }

  .brutalist-card__icon svg {
    height: 1.5rem;
    width: 1.5rem;
    fill: #b45309;
  }

  .brutalist-card__alert {
    font-weight: 900;
    color: #ffeccf; /* light text */
    font-size: 1.5rem;
    text-transform: uppercase;
  }

  .brutalist-card__message {
    margin-top: 1rem;
    color: #ffedd5; /* lighter text */
    font-size: 1rem;
    line-height: 1.4;
    border-bottom: 2px solid #f97316;
    padding-bottom: 1rem;
    font-weight: 600;
  }

  .brutalist-card__actions {
    margin-top: 1rem;
  }

  .brutalist-card__button {
    display: block;
    width: 100%;
    padding: 0.75rem;
    text-align: center;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    border: 3px solid #f97316;
    background-color: #b45309;
    color: #ffedd5;
    position: relative;
    transition: all 0.2s ease;
    box-shadow: 5px 5px 0 #f97316;
    overflow: hidden;
    text-decoration: none;
  }

  .brutalist-card__button--mark:hover {
    background-color: #f97316;
    border-color: #f97316;
    color: #b45309;
    box-shadow: 7px 7px 0 #7c2d12;
  }

  .brutalist-card__button:active {
    transform: translate(5px, 5px);
    box-shadow: none;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .logo-wrapper {
      width: 150px;
      height: 150px;
      margin-bottom: 1.5rem;
    }

    .brutalist-card {
      padding: 1.5rem;
    }

    .brutalist-card__alert {
      font-size: 1.25rem;
    }

    .brutalist-card__message {
      font-size: 0.9rem;
    }
  }
`;

export default NotFoundCard;
