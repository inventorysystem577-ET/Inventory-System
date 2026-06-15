import { supabase } from "../../lib/supabaseClient.js";

export const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      throw error;
    }

    // Clear any cached data
    localStorage.removeItem(STOCK_THRESHOLDS_STORAGE_KEY);

    // Redirect to login page
    window.location.href = "/";
  } catch (error) {
    console.error("Logout failed:", error);
    // Still redirect even if signOut fails (user might already be logged out)
    window.location.href = "/";
  }
};

const STOCK_THRESHOLDS_STORAGE_KEY = "inventory-item-thresholds-v1";
