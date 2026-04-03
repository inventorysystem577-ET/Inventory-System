// app/layout.jsx
import "./globals.css";
import { useEffect } from "react";

// ✅ Force entire app to be dynamic
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Inventory System",
  description: "Track your assets. Manage your workflow. Optimize results.",
};

// Global error handler for auth issues
function AuthErrorHandler() {
  useEffect(() => {
    const handleAuthError = (event) => {
      const error = event.error || event.message;
      if (typeof error === 'string' && 
          (error.includes('Refresh Token Not Found') || 
           error.includes('Invalid Refresh Token'))) {
        // Clear auth data and reload
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.refreshToken');
        sessionStorage.clear();
        console.log('Auth error detected, clearing tokens and reloading...');
        setTimeout(() => window.location.reload(), 100);
      }
    };

    window.addEventListener('error', handleAuthError);
    window.addEventListener('unhandledrejection', handleAuthError);

    return () => {
      window.removeEventListener('error', handleAuthError);
      window.removeEventListener('unhandledrejection', handleAuthError);
    };
  }, []);

  return null;
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
      </head>
      <body className="antialiased">
        <AuthErrorHandler />
        {children}
      </body>
    </html>
  );
}
