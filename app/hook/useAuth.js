"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient.js";

const APPROVED_USERS_TABLE = "user_profiles";

const normalizeStatus = (status, fallback = "approved") => {
  if (!status) return fallback;
  const normalized = String(status).toLowerCase();
  if (normalized === "approved" || normalized === "denied" || normalized === "pending") {
    return normalized;
  }
  return fallback;
};

const mapRowToStatus = (row) => {
  if (!row) return "pending";
  if (row.is_approved) return "approved";
  if (row.rejected_at) return "denied";
  return "pending";
};

export const useAuth = () => {
  const [userEmail, setUserEmail] = useState(null);
  const [displayName, setDisplayName] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const resolveProfile = async (userId) => {
      try {
        const { data, error } = await supabase
          .from(APPROVED_USERS_TABLE)
          .select("name, role, is_approved, rejected_at")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("Error fetching user profile:", error.message);
          // If profile fetch fails, return null (don't log out)
          // User will be treated as staff with pending status from metadata
          return null;
        }

        if (data) {
          data.status = mapRowToStatus(data);
          return data;
        }

        // No profile found - this is OK, user might not have created profile yet
        return null;
      } catch (error) {
        console.error("Error resolving profile:", error);
        // Don't throw - let user stay logged in with metadata role
        return null;
      }
    };

    const applySession = async (session) => {
      if (!mounted) return;

      try {
        if (!session) {
          setUserEmail(null);
          setDisplayName(null);
          setRole(null);
          setStatus(null);
          setLoading(false);
          setInitialized(true);
          hasInitializedRef.current = true;
          return;
        }

        const metadataName =
          session.user?.user_metadata?.display_name ||
          session.user?.user_metadata?.name ||
          null;
        const metadataRole = session.user?.user_metadata?.role || "staff";
        const metadataStatus = normalizeStatus(session.user?.user_metadata?.status);
        const profile = await resolveProfile(session.user?.id);
        const isMetadataAdmin = String(metadataRole).toLowerCase() === "admin";

        // Batch state updates to avoid race conditions
        if (mounted) {
          const effectiveRole = profile?.role || metadataRole;
          const isEffectiveAdmin = String(effectiveRole).toLowerCase() === "admin";

          setUserEmail(session.user?.email || null);
          setDisplayName(profile?.name || metadataName);
          setRole(effectiveRole);
          setStatus(isMetadataAdmin || isEffectiveAdmin ? "approved" : normalizeStatus(profile?.status || metadataStatus, "pending"));
          setLoading(false);
          setInitialized(true);
          hasInitializedRef.current = true;
        }
      } catch (error) {
        console.error("Error applying session:", error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
          hasInitializedRef.current = true;
        }
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        await applySession(session);
      } catch (error) {
        console.error("Error in auth state change:", error.message);
        await applySession(null);
      }
    });

    // Initialize session on mount
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await applySession(session);
      } catch (error) {
        console.error("Error initializing session:", error.message);
        try {
          await applySession(null);
        } catch (_) {
          // ignore
        }
      }
    };

    initializeSession();

    // Fallback timeout so UI doesn't stay stuck on loading
    const fallback = setTimeout(() => {
      if (!hasInitializedRef.current && mounted) {
        console.warn("Auth initialization timeout - proceeding unauthenticated");
        setLoading(false);
        setInitialized(true);
        hasInitializedRef.current = true;
      }
    }, 5000);

    // Handle tab visibility change to recover from idle state
    const handleVisibilityChange = async () => {
      if (!mounted || !hasInitializedRef.current) return;
      if (document.visibilityState !== 'visible') return;

      // Only refresh if auth state seems stale
      try {
        const { data: { session } } = await supabase.auth.getSession();
        // Only update if session actually changed (compare emails, not id with email)
        if (session?.user?.email !== userEmail) {
          await applySession(session);
        }
      } catch (error) {
        console.error("Error refreshing session on visibility change:", error.message);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallback);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { userEmail, displayName, role, status, loading, initialized };
};