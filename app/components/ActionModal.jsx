"use client";

import React from "react";
import { X } from "lucide-react";

export default function ActionModal({
  open,
  darkMode,
  title,
  subtitle,
  icon,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-4xl",
  zIndexClass = "z-[65]",
}) {
  if (!open) return null;

  return (
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4`}>
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${maxWidthClass} rounded-2xl border shadow-2xl p-6 max-h-[86vh] overflow-y-auto ${
          darkMode
            ? "bg-[#1F2937] border-[#374151] text-white"
            : "bg-white border-[#E5E7EB] text-black"
        }`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            {icon ? <div className="mt-0.5">{icon}</div> : null}
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              {subtitle ? (
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg border ${
              darkMode
                ? "border-[#374151] hover:bg-[#374151]"
                : "border-[#E5E7EB] hover:bg-[#F3F4F6]"
            }`}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children}

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </div>
  );
}
