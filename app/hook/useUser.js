// hooks/useUser.js
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient.js";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const currentUser = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser({
          name: data.name,
          role: "Admin",
        });
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { user, loading };
}
