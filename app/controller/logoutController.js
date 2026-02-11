import { supabase } from "../../lib/supabaseClient"; // adjust path

export const handleLogout = async () => {
  console.log("Button clicked logout");
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    alert("Failed to logout. Try again.");
    return;
  }

  window.location.href = "/";
};
