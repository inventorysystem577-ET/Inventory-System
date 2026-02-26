"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const applySession = (session) => {
      if (!mounted) return;

      if (!session) {
        setUserEmail(null);
        setDisplayName(null);
        setLoading(false);
        router.replace("/");
        return;
      }

      setUserEmail(session.user?.email || null);
      setDisplayName(session.user?.user_metadata?.display_name || null);
      setLoading(false);
    };

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        applySession(session);
      } catch (error) {
        console.error("Error checking session:", error.message);
        applySession(null);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return { userEmail, displayName, loading };
};
